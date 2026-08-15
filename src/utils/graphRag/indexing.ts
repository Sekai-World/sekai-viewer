/**
 * Orchestrates bulk indexing of all Unit + Event stories
 */

import {
  IScenarioData,
  ServerRegion,
  IGameChara,
  ICharaProfile,
} from "../../types.d";
import { GraphRAGExtractionService } from "./extraction";
import { graphRAGStore } from "./storage";
import { ILlmApiConfig } from "../LlmClient";
import { IndexingProgress, CharacterNode, FactNode } from "./types";
import Axios from "axios";
import { getRemoteAssetURL } from "../index";

interface UnitStory {
  unit: string;
  chapters: Array<{
    chapterNo: number;
    assetbundleName: string;
    episodes: Array<{
      episodeNo: number;
      scenarioId: string;
    }>;
  }>;
}

interface EventStory {
  id: number;
  assetbundleName: string;
  eventStoryEpisodes: Array<{
    episodeNo: number;
    scenarioId: string;
    assetbundleName: string;
  }>;
}

export class GraphRAGIndexingOrchestrator {
  private extractionService: GraphRAGExtractionService;
  private progress: IndexingProgress = {
    total: 0,
    current: 0,
    currentEpisode: "",
    status: "idle",
    processedCount: 0,
  };
  private onProgressUpdate?: (progress: IndexingProgress) => void;
  private onRetry?: (
    attempt: number,
    maxRetries: number,
    delayMs: number,
    error: string
  ) => void;
  private aborted = false;
  private region: ServerRegion;

  constructor(
    llmConfig: ILlmApiConfig,
    targetLanguage: string,
    similarityThreshold: number,
    region: ServerRegion,
    onProgressUpdate?: (progress: IndexingProgress) => void,
    onRetry?: (
      attempt: number,
      maxRetries: number,
      delayMs: number,
      error: string
    ) => void
  ) {
    this.extractionService = new GraphRAGExtractionService(
      llmConfig,
      targetLanguage,
      similarityThreshold,
      onRetry
    );
    this.region = region;
    this.onProgressUpdate = onProgressUpdate;
    this.onRetry = onRetry;
  }

  async indexAllStories(
    unitStories: UnitStory[],
    eventStories: EventStory[],
    gameCharacters?: IGameChara[],
    charaProfiles?: ICharaProfile[]
  ): Promise<void> {
    this.aborted = false;
    await graphRAGStore.init();

    // Seed main characters first if provided
    if (gameCharacters && gameCharacters.length > 0) {
      await this.seedGameCharacters(gameCharacters, charaProfiles ?? []);
    }

    // Build list of all stories to index (not individual episodes)
    const stories: Array<{
      storyType: "unitStory" | "eventStory";
      unitId?: string;
      eventStoryId?: number;
      storyTag: string; // Identifies the story for indexing check
      episodes: Array<{
        chapterNo?: number;
        episodeNo: number;
        scenarioId: string;
        assetbundleName: string;
        episodeTag: string;
      }>;
    }> = [];

    // Unit stories (one story per unit)
    for (const unit of unitStories) {
      const unitId = unit.unit;
      const storyTag = `unitStory-${unitId}`;

      const episodes: Array<{
        chapterNo: number;
        episodeNo: number;
        scenarioId: string;
        assetbundleName: string;
        episodeTag: string;
      }> = [];
      for (const chapter of unit.chapters) {
        for (const episode of chapter.episodes) {
          const episodeTag = episode.scenarioId;
          episodes.push({
            chapterNo: chapter.chapterNo,
            episodeNo: episode.episodeNo,
            scenarioId: episode.scenarioId,
            assetbundleName: chapter.assetbundleName,
            episodeTag,
          });
        }
      }

      stories.push({
        storyType: "unitStory",
        unitId,
        storyTag,
        episodes,
      });
    }

    // Event stories (one story per event)
    for (const event of eventStories) {
      const storyTag = `eventStory-${event.id}`;
      // Event story scenario assets are namespaced under the *event's*
      // assetbundleName, not each episode's (episodes don't have their own).
      const eventAssetName = event.assetbundleName;

      const episodes: Array<{
        episodeNo: number;
        scenarioId: string;
        assetbundleName: string;
        episodeTag: string;
      }> = [];
      for (const episode of event.eventStoryEpisodes) {
        const episodeTag = `event_${event.id}_${episode.episodeNo}`;
        episodes.push({
          episodeNo: episode.episodeNo,
          scenarioId: episode.scenarioId,
          assetbundleName: eventAssetName,
          episodeTag,
        });
      }

      stories.push({
        storyType: "eventStory",
        eventStoryId: event.id,
        storyTag,
        episodes,
      });
    }

    // Filter out stories that were already fully indexed in a prior run
    const toIndex: typeof stories = [];
    for (const story of stories) {
      const alreadyProcessed = await graphRAGStore.isStoryProcessed(
        story.storyTag
      );
      if (!alreadyProcessed) {
        toIndex.push(story);
      }
    }

    this.progress = {
      total: toIndex.length,
      current: 0,
      currentEpisode: "",
      status: "running",
      processedCount: 0,
    };
    this.updateProgress();

    // Index each story (all episodes in one API call)
    for (let i = 0; i < toIndex.length; i++) {
      if (this.aborted) {
        this.progress.status = "paused";
        this.updateProgress();
        return;
      }

      const story = toIndex[i];
      this.progress.current = i + 1;
      this.progress.currentEpisode = story.storyTag;
      this.updateProgress();

      try {
        const nodeCount = await this.indexStory(story);
        // Only count a story as "processed" (and skip it on future runs)
        // if extraction actually produced at least one node. A story that
        // yields nothing (e.g. the LLM returned an empty-but-valid
        // extraction) is left unmarked so a future re-index will retry it.
        if (nodeCount > 0) {
          await graphRAGStore.markStoryProcessed(story.storyTag);
          this.progress.processedCount += 1;
        }
      } catch (error) {
        // A thrown error here means the API call itself failed (network,
        // auth, malformed response, etc.) rather than the LLM simply
        // extracting nothing. Halt the whole run and surface it to the
        // user instead of silently continuing to the next story.
        console.error(`Failed to index ${story.storyTag}:`, error);
        this.progress.status = "error";
        this.progress.error = `Failed to index ${story.storyTag}: ${
          error instanceof Error ? error.message : String(error)
        }`;
        this.updateProgress();
        throw error;
      }
    }

    this.progress.status = "completed";
    this.updateProgress();
  }

  private async indexStory(story: {
    storyType: "unitStory" | "eventStory";
    unitId?: string;
    eventStoryId?: number;
    storyTag: string;
    episodes: Array<{
      chapterNo?: number;
      episodeNo: number;
      scenarioId: string;
      assetbundleName: string;
      episodeTag: string;
    }>;
  }): Promise<number> {
    // Fetch all episode scenario data
    const episodeDataList: Array<{
      scenarioData: IScenarioData;
      episodeTag: string;
    }> = [];

    for (const episode of story.episodes) {
      // Build scenario URL
      let scenarioUrl: string;
      if (story.storyType === "unitStory") {
        scenarioUrl = `scenario/unitstory/${episode.assetbundleName}/${episode.scenarioId}.asset`;
      } else {
        scenarioUrl = `event_story/${episode.assetbundleName}/scenario/${episode.scenarioId}.asset`;
      }

      // Fetch scenario data
      const fullUrl = await getRemoteAssetURL(
        scenarioUrl,
        undefined,
        "minio",
        this.region
      );

      const response = await Axios.get<IScenarioData>(fullUrl);
      episodeDataList.push({
        scenarioData: response.data,
        episodeTag: episode.episodeTag,
      });
    }

    // Extract all scenarios data
    const scenariosData = episodeDataList.map((e) => e.scenarioData);

    return this.extractionService.extractFromScenario(scenariosData);
  }

  abort(): void {
    this.aborted = true;
  }

  private async seedGameCharacters(
    gameCharacters: IGameChara[],
    charaProfiles: ICharaProfile[]
  ): Promise<void> {
    const toProperCase = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    const profileMap = new Map(charaProfiles.map((p) => [p.characterId, p]));

    for (const chara of gameCharacters) {
      const identifier =
        chara.givenNameEnglish?.toLowerCase() ?? `character-${chara.id}`;
      const nodeId = `char-${identifier}`;

      // Don't overwrite nodes already enriched by LLM extraction
      const existing = await graphRAGStore.getNode(nodeId);
      if (existing) continue;

      // Build English name in Japanese order (family given), proper-cased
      const familyEn = chara.firstNameEnglish
        ? toProperCase(chara.firstNameEnglish)
        : chara.firstName || "";
      const givenEn = chara.givenNameEnglish
        ? toProperCase(chara.givenNameEnglish)
        : chara.givenName || "";
      const name = `${familyEn} ${givenEn}`.trim() || identifier;

      // Japanese name variants for text matching
      const originalTextVariants = Array.from(
        new Set(
          [
            chara.firstName && chara.givenName
              ? `${chara.firstName}${chara.givenName}`
              : null,
            chara.firstName,
            chara.givenNameRuby,
          ].filter((v): v is string => Boolean(v))
        )
      );

      const charNode: CharacterNode = {
        id: nodeId,
        type: "character",
        name,
        identifier,
        originalName:
          chara.firstName && chara.givenName
            ? `${chara.firstName}${chara.givenName}`
            : originalTextVariants[0] || name,
        gender: chara.gender,
        translatedNames: {},
        originalTextVariants,
      };

      await graphRAGStore.putNode(charNode);

      // Seed profile fact if available
      const profile = profileMap.get(chara.id);
      if (profile) {
        const factId = `fact-${identifier}_profile`;
        const factNode: FactNode = {
          id: factId,
          type: "fact",
          identifier: `${identifier}_profile`,
          statement: `${name}'s profile`,
          description: `Hobby: ${profile.hobby}. Special skill: ${profile.specialSkill}. Favorite food: ${profile.favoriteFood}. Disliked food: ${profile.hatedFood}. Weakness: ${profile.weak}.`,
          embedding: new Float32Array(0),
          episodeTags: ["seed"],
        };
        await graphRAGStore.putNode(factNode);
        await graphRAGStore.upsertEdge(
          nodeId,
          factId,
          "FACT",
          "seed",
          "Character profile fact",
          `${identifier}_profile_edge`
        );
      }

      console.log(`Seeded character: ${name} (${identifier})`);
    }
  }

  private updateProgress(): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({ ...this.progress });
    }
  }
}
