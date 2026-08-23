/**
 * Graph RAG extraction service
 * Handles LLM-based extraction of entities and relationships from story data
 */
import { IScenarioData } from "../../types";
import { LlmProviderClient, ILlmApiConfig } from "../llmClient";
import { graphRAGStore } from "./storage";
import { ExtractionOutput } from "./types";
import { embeddingService } from "./embeddings";
import { retrieveContext } from "./retrieval";
import { ExtractionProcessor } from "./extraction/processors";
import { buildExtractionPrompt } from "./extraction/prompt";
import { generateExtractionSchema } from "./extraction/schema";

export { mergeVariantTranslations } from "./extraction/processors";

export class GraphRAGExtractionService {
  private client: LlmProviderClient;
  private targetLanguage: string;
  private processor: ExtractionProcessor;

  constructor(
    config: ILlmApiConfig,
    targetLanguage: string,
    similarityThreshold: number = 0.85
  ) {
    this.client = new LlmProviderClient(config);
    this.targetLanguage = targetLanguage;
    this.processor = new ExtractionProcessor(
      targetLanguage,
      similarityThreshold
    );
  }

  /**
   * Extract graph data from a scenario.
   *
   * Returns the number of nodes created or updated (characters + groups +
   * events + terms), so callers can decide whether the story actually
   * yielded anything worth marking as "processed".
   */
  async extractFromScenario(
    scenariosData: IScenarioData[],
    storyTag: string
  ): Promise<number> {
    await graphRAGStore.init();
    await embeddingService.init();

    const storyId = storyTag;

    // Step 1: Retrieve existing context for this story's cast
    const existingContext = await retrieveContext(
      scenariosData,
      10 // edgesPerChar for context
    );

    // Step 2: Build LLM extraction prompt
    const { systemPrompt, userPrompt } = buildExtractionPrompt(
      this.targetLanguage,
      scenariosData,
      existingContext
    );

    // Step 3: Call LLM for extraction
    const contextCount =
      existingContext.characters.length +
      existingContext.events.length +
      existingContext.terms.length;
    const extraction = await this.callExtractionLLM(
      systemPrompt,
      userPrompt,
      contextCount
    );

    // Step 5: Build identifier -> node ID mapping
    const identifierToNodeId = new Map<string, string>();

    // Add existing context nodes to mapping
    for (const char of existingContext.characters) {
      if (char.identifier) {
        identifierToNodeId.set(`character:${char.identifier}`, char.id);
      }
      identifierToNodeId.set(`character:${char.name}`, char.id);
    }
    for (const group of existingContext.groups) {
      identifierToNodeId.set(`group:${group.name}`, group.id);
    }
    for (const event of existingContext.events) {
      identifierToNodeId.set(`event:${event.name}`, event.id);
    }
    for (const term of existingContext.terms) {
      identifierToNodeId.set(`term:${term.name}`, term.id);
    }

    // Step 6: Process extracted characters
    for (const charData of extraction.characters || []) {
      const charId = await this.processor.processCharacter(charData);
      identifierToNodeId.set(`character:${charData.identifier}`, charId);
      identifierToNodeId.set(`character:${charData.name}`, charId);
    }

    // Step 7: Process groups
    for (const groupData of extraction.groups || []) {
      await this.processor.processGroup(
        groupData.identifier,
        groupData.name,
        groupData.translatedName,
        groupData.originalTextVariants || []
      );
      identifierToNodeId.set(
        `group:${groupData.identifier}`,
        `group-${groupData.identifier}`
      );
      identifierToNodeId.set(
        `group:${groupData.name}`,
        `group-${groupData.identifier}`
      );
    }

    // Step 8: Process events
    for (const eventData of extraction.events || []) {
      const eventId = await this.processor.processEvent(eventData, storyId);
      identifierToNodeId.set(`event:${eventData.identifier}`, eventId);
      identifierToNodeId.set(`event:${eventData.name}`, eventId);
    }

    // Step 9: Process terms
    for (const termData of extraction.terms || []) {
      const termId = await this.processor.processTerm(termData, storyId);
      identifierToNodeId.set(`term:${termData.identifier}`, termId);
      identifierToNodeId.set(`term:${termData.name}`, termId);
    }

    // Step 10: Process all nested relations and facts
    // Process character relations and facts
    for (const charData of extraction.characters || []) {
      const sourceId = identifierToNodeId.get(
        `character:${charData.identifier}`
      );
      if (!sourceId) continue;

      // Process character relations (CHARACTER_RELATION edges)
      for (const relation of charData.relations || []) {
        if (!relation.identifier) {
          console.warn(
            `⚠️  Skipping relation without identifier from ${charData.identifier}`
          );
          continue;
        }
        await this.processor.processRelation(
          sourceId,
          relation,
          identifierToNodeId,
          storyId
        );
      }

      // Process character facts
      for (const fact of charData.facts || []) {
        await this.processor.processFact(fact, sourceId, storyId);
      }
    }

    // Process event involve and facts
    for (const eventData of extraction.events || []) {
      const sourceId = identifierToNodeId.get(`event:${eventData.identifier}`);
      if (!sourceId) continue;

      // Process event involve (INVOLVE edges)
      for (const involvement of eventData.involve || []) {
        if (!involvement.identifier) {
          console.warn(
            `⚠️  Skipping involvement without identifier from ${eventData.identifier}`
          );
          continue;
        }
        await this.processor.processInvolvement(
          sourceId,
          involvement,
          identifierToNodeId,
          storyId
        );
      }

      // Process event facts
      for (const fact of eventData.facts || []) {
        await this.processor.processFact(fact, sourceId, storyId);
      }
    }

    // Process term facts and related edges
    for (const termData of extraction.terms || []) {
      const sourceId = identifierToNodeId.get(`term:${termData.identifier}`);
      if (!sourceId) continue;

      // Process term related edges (RELATED edges)
      for (const related of termData.related || []) {
        if (!related.identifier) {
          console.warn(
            `⚠️  Skipping related without identifier from ${termData.identifier}`
          );
          continue;
        }
        await this.processor.processRelated(
          sourceId,
          related,
          identifierToNodeId,
          storyId
        );
      }

      // Process term facts
      for (const fact of termData.facts || []) {
        await this.processor.processFact(fact, sourceId, storyId);
      }
    }

    // Process group members and facts
    for (const groupData of extraction.groups || []) {
      const sourceId = identifierToNodeId.get(`group:${groupData.name}`);
      if (!sourceId) continue;

      // Process group members (MEMBER_OF edges)
      for (const member of groupData.members || []) {
        if (!member.identifier) {
          console.warn(
            `⚠️  Skipping member without identifier from ${groupData.name}`
          );
          continue;
        }
        await this.processor.processMembership(
          sourceId,
          member,
          identifierToNodeId,
          storyId
        );
      }

      // Process group facts
      for (const fact of groupData.facts || []) {
        await this.processor.processFact(fact, sourceId, storyId);
      }
    }

    return (
      (extraction.characters || []).length +
      (extraction.groups || []).length +
      (extraction.events || []).length +
      (extraction.terms || []).length
    );
  }

  private async callExtractionLLM(
    systemPrompt: string,
    userPrompt: string,
    _contextCount: number
  ): Promise<ExtractionOutput> {
    const schema = generateExtractionSchema();

    // Deliberately do NOT catch-and-return-empty here: a failed LLM call
    // (network error, bad API key, malformed JSON, etc.) must propagate so
    // the indexing orchestrator halts and reports the failure to the user,
    // rather than silently recording an empty extraction as "processed".
    const response = await this.client.callWithStructuredOutput(
      systemPrompt,
      userPrompt,
      schema
    );

    try {
      return JSON.parse(response) as ExtractionOutput;
    } catch (error) {
      throw new Error(
        `LLM returned invalid JSON for structured extraction: ${error}`
      );
    }
  }
}
