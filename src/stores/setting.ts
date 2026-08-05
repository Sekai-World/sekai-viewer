import { types, Instance } from "mobx-state-tree";
import { ContentTransModeType, DisplayModeType, ServerRegion } from "../types";
import { ILanguageModel, LanguageModel } from "./user";
import { migrateLlmSettings } from "../utils/Live2DPlayer/translation/migrateLlmSettings";

export const SettingDisplayMode = types.enumeration<DisplayModeType>(
  "DisplayMode",
  ["dark", "light", "auto"]
);

export const SettingContentTransMode = types.enumeration<ContentTransModeType>(
  "ContentTransMode",
  ["original", "translated", "both"]
);

export const SettingRegion = types.enumeration<ServerRegion>("ServerRegion", [
  "jp",
  "tw",
  "en",
  "kr",
  "cn",
]);

export const TRANSLATION_PROVIDERS = [
  "openai-compatible",
  "anthropic",
  "gemini",
] as const;
export type TranslationProviderType = (typeof TRANSLATION_PROVIDERS)[number];

export const TranslationProvider = types.enumeration("TranslationProvider", [
  ...TRANSLATION_PROVIDERS,
]);

/**
 * Per-provider LLM configuration.
 */
export const LlmProviderConfig = types.model("LlmProviderConfig", {
  model: types.optional(types.string, ""),
  apiKey: types.optional(types.string, ""),
  endpoint: types.optional(types.string, ""),
});
export interface ILlmProviderConfig extends Instance<
  typeof LlmProviderConfig
> {}

export const Settings = types
  .model({
    contentTransMode: SettingContentTransMode,
    displayMode: SettingDisplayMode,
    isShowSpoiler: types.optional(types.boolean, false),
    isSpoilerMosaicked: types.optional(types.boolean, true),
    lang: types.string,
    languages: types.array(LanguageModel),
    region: SettingRegion,
    // LLM Translation Settings
    enableLlmTranslation: types.optional(types.boolean, false),
    llmTranslationProvider: types.optional(
      TranslationProvider,
      "openai-compatible"
    ),
    llmConfigs: types.optional(
      types.model({
        "openai-compatible": types.optional(LlmProviderConfig, {}),
        anthropic: types.optional(LlmProviderConfig, {}),
        gemini: types.optional(LlmProviderConfig, {}),
      }),
      {}
    ),
    // Schema version for the LLM settings block. 0 = legacy/unmigrated;
    // bumped by `migrateLlmSettings` whenever the persisted shape changes.
    llmConfigVersion: types.optional(types.integer, 0),
    targetLanguage: types.optional(types.string, "en"),
    showOriginalText: types.optional(types.boolean, true),
    additionalSystemPrompt: types.optional(types.string, ""),
  })
  .preProcessSnapshot(migrateLlmSettings)
  .views((self) => ({
    get hasLlmApiKey() {
      return Boolean(self.llmConfigs[self.llmTranslationProvider]?.apiKey);
    },
  }))
  .actions((self) => ({
    setContentTransMode(newMode: ContentTransModeType) {
      self.contentTransMode = newMode;
    },
    setDisplayMode(newMode: DisplayModeType) {
      self.displayMode = newMode;
    },
    setIsShowSpoiler(newMode: boolean) {
      self.isShowSpoiler = newMode;
    },
    setIsSpoilerMosaicked(newMode: boolean) {
      self.isSpoilerMosaicked = newMode;
    },
    setLang(newLang: string) {
      self.lang = newLang;
    },
    setLanguages(newLanguages: ILanguageModel[]) {
      // @ts-expect-error type mismatch
      self.languages = newLanguages;
    },
    setRegion(newRegion: ServerRegion) {
      self.region = newRegion;
    },
    // LLM Translation Actions
    setEnableLlmTranslation(enabled: boolean) {
      self.enableLlmTranslation = enabled;
    },
    setLlmTranslationProvider(provider: TranslationProviderType) {
      self.llmTranslationProvider = provider;
    },
    setLlmModel(provider: TranslationProviderType, model: string) {
      self.llmConfigs[provider].model = model;
    },
    setLlmApiKey(provider: TranslationProviderType, apiKey: string) {
      self.llmConfigs[provider].apiKey = apiKey;
    },
    setLlmApiEndpoint(provider: TranslationProviderType, endpoint: string) {
      self.llmConfigs[provider].endpoint = endpoint;
    },
    setTargetLanguage(language: string) {
      self.targetLanguage = language;
    },
    setShowOriginalText(show: boolean) {
      self.showOriginalText = show;
    },
    setAdditionalSystemPrompt(prompt: string) {
      self.additionalSystemPrompt = prompt;
    },
  }));
export interface ISettings extends Instance<typeof Settings> {}
