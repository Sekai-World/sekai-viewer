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
   * Get configuration from main settings store
   */
  private getConfigFromSettings(): ILlmApiConfig {
    const settings = rootStore.settings;
    return {
      provider: settings.llmTranslationProvider,
      apiKey: settings.llmApiKey,
      apiEndpoint: settings.llmApiEndpoint || "",
      model: settings.llmModel || "",
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
   * Create system prompt with formatting instructions
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
- You must maintain the exact numbering format: [1], [2], [3], etc.
- Each translation must be on its own line
- Do not add any explanations, notes, or extra text
- Preserve the emotional tone and dramatic impact of the original dialogue
- Maintain character voice consistency throughout the conversation
- Keep the natural flow and rhythm of speech appropriate for ${targetLanguage}
- If unsure about specific game context, prioritize natural ${targetLanguage} expression while preserving emotional intent

RESPONSE FORMAT:
[1] translated text here
[2] translated text here  
[3] translated text here

Respond ONLY with the numbered translations. Do not include any other text.`;
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

    // Use the provider client to handle the API call
    return this.providerClient.translateBatch(systemPrompt, userMessage);
  }

  /**
   * Parse batch translation response back into individual lines
   */
  private parseBatchResponse(
    batchResponse: string,
    expectedCount: number
  ): string[] {
    const lines: string[] = [];
    try {
      // Try to extract numbered sections [1], [2], etc.
      for (let i = 1; i <= expectedCount; i++) {
        const pattern = new RegExp(
          `\\[${i}\\]\\s*(.+?)(?=\\[${i + 1}\\]|$)`,
          "s"
        );
        const match = batchResponse.match(pattern);

        if (match && match[1]) {
          lines.push(match[1].trim().replace(/^\n+|\n+$/g, ""));
        } else {
          lines.push(""); // Empty string for failed translations
        }
      }
    } catch (error) {
      log.error(
        "LlmTranslationService",
        "Failed to parse batch translation response:",
        error
      );
      // Return empty array on parse failure
      return new Array(expectedCount).fill("");
    }
    return lines;
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

    // Check if translation is enabled or region is JP
    if (
      !settings.enableLlmTranslation ||
      !settings.llmApiKey ||
      settings.region !== "jp"
    ) {
      return;
    }

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
