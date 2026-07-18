import { log } from "../log";
import { rootStore } from "../../../stores/root";
import { IScenarioData } from "../../../types.d";
import { SpecialEffectType } from "../../../story-scenerio.d";
import { TranslationCache } from "./TranslationCache";
import { LlmProviderClient, ILlmApiConfig } from "./LlmProviderClient";

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
      apiKey: cfg?.apiKey || "",
      apiEndpoint: cfg?.endpoint || "",
      model: cfg?.model || "",
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
  private createSystemPrompt(
    targetLanguage: string,
    sourceLanguage: string
  ): string {
    return `You are a professional translator specializing in ${sourceLanguage} to ${targetLanguage} translation for Project Sekai: Colorful Stage (プロセカ), a mobile rhythm game featuring Hatsune Miku and Virtual Singers.

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

Example response for 3 inputs:
{
  "translations": [
    "translated text for input 1",
    "translated text for input 2",
    "translated text for input 3"
  ]
}`;
  }

  /**
   * Create clean user message with just the content to translate
   */
  private createUserMessage(
    dialogues: string[],
    _targetLanguage: string,
    _sourceLanguage: string
  ): string {
    return dialogues
      .map((dialogue, i) => `[${i + 1}] ${dialogue}`)
      .join("\n\n");
  }

  /**
   * Perform batch translation using the configured provider
   */
  private async performBatchTranslation(
    dialogues: string[],
    targetLanguage: string,
    sourceLanguage: string
  ): Promise<string> {
    const systemPrompt = this.createSystemPrompt(
      targetLanguage,
      sourceLanguage
    );
    const userMessage = this.createUserMessage(
      dialogues,
      targetLanguage,
      sourceLanguage
    );

    // Use the provider client to handle the API call. The provider enforces
    // the structured output schema; expectedCount is required to constrain
    // the array length.
    return this.providerClient.translateBatch(
      systemPrompt,
      userMessage,
      dialogues.length
    );
  }

  /**
   * Parse a structured (JSON) batch translation response into individual
   * lines. The provider enforces the shape `{ "translations": string[] }`,
   * but we still defend against malformed output by extracting the first JSON
   * object in the response if direct parsing fails, and by padding/trimming
   * to `expectedCount`.
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
        parsed = JSON.parse(batchResponse.slice(start, end + 1));
      }

      const translations = (parsed as any)?.translations;
      if (!Array.isArray(translations)) return fallback();

      return translations
        .slice(0, expectedCount)
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .concat(
          expectedCount > translations.length
            ? new Array(expectedCount - translations.length).fill("")
            : []
        );
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
   * Translate multiple text strings in a single batch request
   */
  private async translateTexts(
    texts: string[],
    targetLanguage: string,
    sourceLanguage = "Japanese"
  ): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      // Perform batch translation
      const batchResponse = await this.performBatchTranslation(
        texts,
        targetLanguage,
        sourceLanguage
      );

      if (batchResponse) {
        // Parse batch response back into individual translations
        return this.parseBatchResponse(batchResponse, texts.length);
      }

      // Return original text as fallback
      return texts;
    } catch (error) {
      log.error("LlmTranslationService", "Batch translation failed:", error);
      // Return original dialogues as fallback
      return texts;
    }
  }

  /**
   * Method to translate texts and store them in cache
   * @param texts - Array of texts to translate
   * @param indices - Array of indices corresponding to texts
   * @param targetLanguage - Target language for translation
   * @param sourceLanguage - Source language (default: Japanese)
   * @param cacheKeyPrefix - Prefix for cache keys (e.g., "talk_" for dialogues, "fullscreen_" for fullscreen texts)
   * @param contentType - Type of content for logging purposes
   */
  private async translateAndCacheTexts(
    texts: string[],
    indices: number[],
    targetLanguage: string,
    sourceLanguage = "Japanese",
    cacheKeyPrefix = ""
  ): Promise<void> {
    const translatedTexts = await this.translateTexts(
      texts,
      targetLanguage,
      sourceLanguage
    );

    // Store translations in cache using prefixed keys
    translatedTexts.forEach((translation, i) => {
      if (translation && translation !== texts[i] && i < indices.length) {
        const cacheKey = `${cacheKeyPrefix}${indices[i]}`;
        TranslationCache.storeTranslationByKey(cacheKey, translation);
      }
    });
  }

  /**
   * Translate all dialogue from scenario data
   * Extracts dialogue internally and stores translations in cache
   */
  async translateScenarioData(
    scenarioData: IScenarioData,
    targetLanguage?: string,
    sourceLanguage = "Japanese"
  ): Promise<void> {
    // Check if settings changed and update cache accordingly
    this.checkAndUpdateConfigIfNeeded();

    // Get target language from settings if not provided
    const settings = rootStore.settings;
    const language = targetLanguage || settings.targetLanguage;

    // Extract and translate talk dialogues
    const talkTexts: string[] = [];
    const talkIndices: number[] = [];

    scenarioData.TalkData.forEach((talkData, index) => {
      if (talkData.Body && talkData.Body.trim()) {
        talkTexts.push(talkData.Body);
        talkIndices.push(index);
      }
    });

    // Extract and translate fullscreen text
    const fullscreenTexts: string[] = [];
    const fullscreenIndices: number[] = [];

    // Extract and translate telop text
    const telopTexts: string[] = [];
    const telopIndices: number[] = [];

    scenarioData.SpecialEffectData.forEach((effectData, index) => {
      if (
        effectData.EffectType === SpecialEffectType.FullScreenText &&
        effectData.StringVal &&
        effectData.StringVal.trim()
      ) {
        fullscreenTexts.push(effectData.StringVal);
        fullscreenIndices.push(index);
      } else if (
        effectData.EffectType === SpecialEffectType.Telop &&
        effectData.StringVal &&
        effectData.StringVal.trim()
      ) {
        telopTexts.push(effectData.StringVal);
        telopIndices.push(index);
      }
    });

    // Translate talk dialogues with "talk_" prefix for cache keys
    if (talkTexts.length > 0) {
      await this.translateAndCacheTexts(
        talkTexts,
        talkIndices,
        language,
        sourceLanguage,
        "talk_"
      );
    }

    // Translate fullscreen texts with prefixed cache keys
    if (fullscreenTexts.length > 0) {
      await this.translateAndCacheTexts(
        fullscreenTexts,
        fullscreenIndices,
        language,
        sourceLanguage,
        "fullscreen_texts_"
      );
    }

    // Translate telop texts with prefixed cache keys
    if (telopTexts.length > 0) {
      await this.translateAndCacheTexts(
        telopTexts,
        telopIndices,
        language,
        sourceLanguage,
        "telop_"
      );
    }
  }
}
