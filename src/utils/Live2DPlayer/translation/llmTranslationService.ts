import { log } from "../log";
import { rootStore } from "../../../stores/root";
import { IScenarioData } from "../../../types.d";
import { SnippetAction, SpecialEffectType } from "../../../story-scenerio.d";
import { TranslationCache } from "./translationCache";
import { LlmProviderClient, ILlmApiConfig } from "../../llmClient";
import {
  retrieveContext,
  formatContextAsMarkdown,
} from "../../graphRag/retrieval";

type TranslationItemType = "talk" | "fullscreen" | "telop";
const TRANSLATION_CHUNK_SIZE = 40;

/**
 * One translatable unit pulled out of `scenarioData` in story order.
 *
 * Walking `Snippets` (rather than iterating TalkData / SpecialEffectData
 * independently) preserves the interleaved order: a FullScreenText/Telop that
 * precedes a run of dialogue is sent to the model first, so it can act as a
 * scene header that contextualises the dialogue that follows.
 */
interface TranslationItem {
  type: TranslationItemType;
  /**
   * `Snippet.ReferenceIndex` into the source array. Used to build the cache
   * key the player reads back:
   *   talk        -> `talk_${refIdx}`
   *   fullscreen  -> `fullscreen_texts_${refIdx}`
   *   telop       -> `telop_${refIdx}`
   */
  refIdx: number;
  text: string;
  // talk-only metadata (omitted for fullscreen / telop):
  speaker?: string;
  /** Raw `MotionName` tokens (non-empty) for emotion context. */
  motions?: string[];
  /** Raw `FacialName` tokens (non-empty) for emotion context. */
  facials?: string[];
  /** True when `TalkData.LipSync === 2` (text wrapped in `()`, monologue). */
  monologue?: boolean;
}

const CACHE_KEY_PREFIX: Record<TranslationItemType, string> = {
  talk: "talk_",
  fullscreen: "fullscreen_texts_",
  telop: "telop_",
};

export class LlmTranslationService {
  private config: ILlmApiConfig;
  private providerClient: LlmProviderClient;

  constructor(config?: ILlmApiConfig) {
    // Use provided config or read from settings store
    this.config = config || this.getConfigFromSettings();

    this.providerClient = new LlmProviderClient(this.config);
  }

  /**
   * Get configuration from main settings store.
   * Reads the active provider's own config bucket — each provider keeps its
   * own model / apiKey / endpoint so switching providers doesn't affect the
   * others' saved values.
   */
  private getConfigFromSettings(): ILlmApiConfig {
    const settings = rootStore.settings;
    const provider = settings.llmTranslationProvider;
    const cfg = settings.llmConfigs[provider];

    return {
      provider,
      apiKey: cfg.apiKey,
      apiEndpoint: cfg.endpoint,
      model: cfg.model,
    };
  }

  /**
   * Check if settings have changed and update client configuration
   */
  private checkAndUpdateConfigIfNeeded(): void {
    const newConfig = this.getConfigFromSettings();

    // Compare old and new configurations
    if (JSON.stringify(this.config) === JSON.stringify(newConfig)) {
      return; // No changes, skip update
    }
    this.config = newConfig;
    this.providerClient.updateConfig(newConfig);
  }

  /**
   * Create system prompt with formatting instructions.
   *
   * The schema is enforced by the provider (structured outputs / forced tool
   * use), but we still describe the expected shape in the prompt so the model
   * understands the contract. The output must be a JSON object of the form
   *   { "translations": [ "<translation for input [1]>", "<translation for input [2]>", ... ] }
   * with the array length exactly matching the number of inputs and the
   * order preserved.
   */
  private async createSystemPrompt(
    targetLanguage: string,
    sourceLanguage: string,
    scenarioData: IScenarioData
  ): Promise<string> {
    const settings = rootStore.settings;
    const userPrompt = settings.additionalSystemPrompt?.trim() ?? "";

    // Retrieve RAG context if enabled
    let ragContext = "";
    if (settings.enableGraphRAG) {
      try {
        const context = await retrieveContext(
          [scenarioData],
          settings.graphRAGEventsPerCharacter,
          settings.graphRAGEmbeddingModel,
          settings.graphRAGMaxDirectCharacterRelations
        );
        const currentEpisodeId = this.getEpisodeId([scenarioData]);
        ragContext = formatContextAsMarkdown(context, currentEpisodeId);
      } catch (error) {
        log.error(
          "LlmTranslationService",
          "Failed to retrieve RAG context:",
          error
        );
        // Continue without RAG context if retrieval fails
      }
    }

    const base = `You are a professional translator specializing in ${sourceLanguage} to ${targetLanguage} translation for Project Sekai: Colorful Stage (プロセカ), a mobile rhythm game featuring Hatsune Miku and Virtual Singers.
${ragContext ? `\n${ragContext}\n` : ""}

SAFETY GUIDELINES:
- Only translate the provided text content, do not generate new content
- If you encounter inappropriate content, translate it objectively without enhancement
- Do not add personal opinions, commentary, or interpretations
- Maintain professional neutrality in all translations
- Do not translate content that could be political, harmful, illegal, or violate platform policies
- If uncertain about content appropriateness, provide a conservative translation or skip the problematic section

CRITICAL FORMATTING REQUIREMENTS:
- Preserve the emotional tone and dramatic impact of the original dialogue
- Maintain character voice consistency throughout the conversation
- Keep the natural flow and rhythm of speech appropriate for ${targetLanguage}
- If unsure about specific game context, prioritize natural ${targetLanguage} expression while preserving emotional intent

RESPONSE FORMAT:
Respond with a JSON object matching the provided schema. The "translations" array must contain exactly one string per input line, in the same order as the numbered inputs ([1], [2], ...). Do not add explanations, notes, or any text outside the JSON object.

INPUT FORMAT:
Each input line is one of three labelled forms, given in story order:
  [n] [TALK] (Speaker | motion: <names> | face: <names> | monologue) text
  [n] [FULLSCREEN] text
  [n] [TELOP] text

The bracket tag and any parenthesised context are metadata only — do NOT echo them in the translation. Use them as cues for register, voice, tone, and scene state:
- Speaker names disambiguate pronouns and choose register; keep character voice consistent across lines that share the same speaker.
- "motion" / "face" tokens are raw Live2D motion/expression names (e.g. smile_01, ang_03_a). They describe the actor's pose and emotion; use them to pick wording but never reproduce them.
- "monologue" marks an unvoiced inner thought (in-game wrapped in parentheses). Use an inner-thought register in the translation if the target language has one.
- FULLSCREEN lines are usually scene titles / intertitles; TELOP lines are usually location superscripts. When a FULLSCREEN or TELOP line precedes a run of TALK lines, treat it as context (a scene header) for the dialogue that follows — never as dialogue itself.

Example response for 3 inputs:
{
  "translations": [
    "translated text for input 1",
    "translated text for input 2",
    "translated text for input 3"
  ]
}`;
    if (!userPrompt) return base;
    return `${base}

ADDITIONAL INSTRUCTIONS FROM THE USER (apply on top of the above; never override the response format):
${userPrompt}`;
  }

  /**
   * Build a single user message from translation items, in story order.
   * Each line is labelled with its type and (for talks) the speaker +
   * raw motion / face tokens + monologue marker.
   */
  private createUserMessage(items: TranslationItem[]): string {
    return items.map((item, i) => this.formatItemLine(item, i)).join("\n\n");
  }

  private formatItemLine(item: TranslationItem, i: number): string {
    const tag = item.type.toUpperCase();
    const ctx: string[] = [];
    if (item.speaker) ctx.push(item.speaker);
    if (item.motions?.length) ctx.push(`motion: ${item.motions.join(", ")}`);
    if (item.facials?.length) ctx.push(`face: ${item.facials.join(", ")}`);
    if (item.monologue) ctx.push("monologue");
    const ctxStr = ctx.length ? ` (${ctx.join(" | ")})` : "";
    return `[${i + 1}] [${tag}]${ctxStr} ${item.text}`;
  }

  private getEpisodeId(scenariosData: IScenarioData[]): string {
    return scenariosData[0].ScenarioId;
  }

  /**
   * Walk `scenarioData.Snippets` in order and collect every translatable
   * line — Talk bodies plus the FullScreenText and Telop special effects —
   * into a single ordered list. Order is what gives the model usable scene
   * headers.
   */
  private collectTranslationItems(
    scenarioData: IScenarioData
  ): TranslationItem[] {
    const items: TranslationItem[] = [];
    const snippets = scenarioData.Snippets ?? [];
    for (const sn of snippets) {
      const item =
        sn.Action === SnippetAction.Talk
          ? this.buildTalkItem(scenarioData, sn.ReferenceIndex)
          : sn.Action === SnippetAction.SpecialEffect
            ? this.buildEffectItem(scenarioData, sn.ReferenceIndex)
            : null;
      if (item) items.push(item);
    }
    return items;
  }

  private buildTalkItem(
    scenarioData: IScenarioData,
    refIdx: number
  ): TranslationItem | null {
    const talk = scenarioData.TalkData?.[refIdx];
    if (!talk?.Body?.trim()) return null;
    const namedMotions = (name: "MotionName" | "FacialName") =>
      (talk.Motions ?? [])
        .map((motion) => motion[name]?.trim())
        .filter((value): value is string => Boolean(value));
    const motions = namedMotions("MotionName");
    const facials = namedMotions("FacialName");
    return {
      type: "talk",
      refIdx,
      text: talk.Body,
      speaker: talk.WindowDisplayName?.trim() || undefined,
      motions: motions.length ? motions : undefined,
      facials: facials.length ? facials : undefined,
      monologue: talk.LipSync === 2,
    };
  }

  private buildEffectItem(
    scenarioData: IScenarioData,
    refIdx: number
  ): TranslationItem | null {
    const effect = scenarioData.SpecialEffectData?.[refIdx];
    if (!effect?.StringVal?.trim()) return null;
    if (effect.EffectType === SpecialEffectType.FullScreenText) {
      return { type: "fullscreen", refIdx, text: effect.StringVal };
    }
    if (effect.EffectType === SpecialEffectType.Telop) {
      return { type: "telop", refIdx, text: effect.StringVal };
    }
    return null;
  }

  /**
   * Build translation schema for structured output
   */
  private buildTranslationSchema(expectedCount: number) {
    return {
      type: "object",
      properties: {
        translations: {
          type: "array",
          items: { type: "string" },
          minItems: expectedCount,
          maxItems: expectedCount,
        },
      },
      required: ["translations"],
      additionalProperties: false,
    };
  }

  /**
   * Parse a structured (JSON) batch translation response into individual
   * lines. The provider enforces the shape `{ "translations": string[] }`,
   * but we still defend against malformed output by extracting the first JSON
   * object in the response if direct parsing fails. Responses with a wrong
   * number of entries are rejected to avoid assigning a translation to the
   * wrong story line.
   */
  private parseBatchResponse(
    batchResponse: string,
    expectedCount: number
  ): string[] {
    const fallback = () => new Array(expectedCount).fill("");
    try {
      if (!batchResponse) return fallback();

      let parsed: unknown;
      try {
        parsed = JSON.parse(batchResponse);
      } catch {
        // Some providers may still wrap JSON in prose/fences despite schema
        // enforcement. Try to slice out the first {...} block.
        const start = batchResponse.indexOf("{");
        const end = batchResponse.lastIndexOf("}");
        if (start === -1 || end === -1 || end <= start) return fallback();
        const candidate = batchResponse.slice(start, end + 1);
        parsed = JSON.parse(candidate);
      }

      const translations = (parsed as any)?.translations;
      if (
        !Array.isArray(translations) ||
        translations.length !== expectedCount
      ) {
        log.error(
          "LlmTranslationService",
          `Expected ${expectedCount} translations, received ${Array.isArray(translations) ? translations.length : "non-array"}`
        );
        return fallback();
      }

      return translations.map((t) => (typeof t === "string" ? t.trim() : ""));
    } catch (error) {
      log.error(
        "LlmTranslationService",
        "Failed to parse batch translation response:",
        error
      );
      return fallback();
    }
  }

  /**
   * Translate all dialogue from scenario data in ordered, bounded batches.
   *
   * Walks `Snippets` in story order so FullScreenText / Telop lines that
   * precede a run of dialogue act as scene headers, then caches each
   * returned translation under the cache key the player later reads:
   *   `talk_${refIdx}` | `fullscreen_texts_${refIdx}` | `telop_${refIdx}`
   */
  async translateScenarioData(
    scenarioData: IScenarioData,
    targetLanguage?: string,
    sourceLanguage = "Japanese"
  ): Promise<void> {
    // Check if settings changed and update cache accordingly
    this.checkAndUpdateConfigIfNeeded();

    const settings = rootStore.settings;
    const language = targetLanguage || settings.targetLanguage;

    const items = this.collectTranslationItems(scenarioData);
    if (items.length === 0) return;

    const systemPrompt = await this.createSystemPrompt(
      language,
      sourceLanguage,
      scenarioData
    );
    let storedTranslation = false;

    try {
      for (
        let start = 0;
        start < items.length;
        start += TRANSLATION_CHUNK_SIZE
      ) {
        const batch = items.slice(start, start + TRANSLATION_CHUNK_SIZE);
        const translationSchema = this.buildTranslationSchema(batch.length);
        const batchResponse =
          await this.providerClient.callWithStructuredOutput(
            systemPrompt,
            this.createUserMessage(batch),
            translationSchema
          );
        this.parseBatchResponse(batchResponse, batch.length).forEach(
          (translation, i) => {
            const item = batch[i];
            if (!translation || translation === item.text) return;
            TranslationCache.storeTranslationByKey(
              `${CACHE_KEY_PREFIX[item.type]}${item.refIdx}`,
              translation
            );
            storedTranslation = true;
          }
        );
      }
      if (!storedTranslation) {
        throw new Error(
          "The translation provider returned no usable translations"
        );
      }
    } catch (error) {
      log.error("LlmTranslationService", "Batch translation failed:", error);
      throw error;
    }
  }
}
