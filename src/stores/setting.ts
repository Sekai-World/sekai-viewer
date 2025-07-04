import { types, Instance } from "mobx-state-tree";
import { ContentTransModeType, DisplayModeType, ServerRegion } from "../types";
import { ILanguageModel, LanguageModel } from "./user";

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

export const TranslationProvider = types.enumeration("TranslationProvider", [
  "openai",
  "anthropic",
  "google",
  "openrouter",
  "custom",
]);

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
    llmTranslationProvider: types.optional(TranslationProvider, "openai"),
    llmModel: types.optional(types.string, ""),
    llmApiKey: types.optional(types.string, ""),
    llmApiEndpoint: types.optional(types.string, ""),
    targetLanguage: types.optional(types.string, "en"),
    showOriginalText: types.optional(types.boolean, true),
  })
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
    setLlmTranslationProvider(
      provider: "openai" | "anthropic" | "google" | "openrouter" | "custom"
    ) {
      self.llmTranslationProvider = provider;
    },
    setLlmModel(model: string) {
      self.llmModel = model;
    },
    setLlmApiKey(apiKey: string) {
      self.llmApiKey = apiKey;
    },
    setLlmApiEndpoint(endpoint: string) {
      self.llmApiEndpoint = endpoint;
    },
    setTargetLanguage(language: string) {
      self.targetLanguage = language;
    },
    setShowOriginalText(show: boolean) {
      self.showOriginalText = show;
    },
  }));
export interface ISettings extends Instance<typeof Settings> {}
