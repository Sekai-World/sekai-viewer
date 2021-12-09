import { types, Instance } from "mobx-state-tree";
import { ContentTransModeType, DisplayModeType, ServerRegion } from "../types";
import { ILanguageModel, LanguageModel } from "./user";

export const SettingDisplayMode = types.enumeration<DisplayModeType>([
  "dark",
  "light",
  "auto",
]);

export const SettingContentTransMode = types.enumeration<ContentTransModeType>([
  "original",
  "translated",
  "both",
]);

export const SettingRegion = types.enumeration<ServerRegion>([
  "jp",
  "tw",
  "en",
]);

export const Settings = types
  .model({
    lang: types.string,
    displayMode: SettingDisplayMode,
    contentTransMode: SettingContentTransMode,
    languages: types.array(LanguageModel),
    isShowSpoiler: types.optional(types.boolean, false),
    region: SettingRegion,
  })
  .actions((self) => ({
    setLang(newLang: string) {
      self.lang = newLang;
    },
    setDisplayMode(newMode: DisplayModeType) {
      self.displayMode = newMode;
    },
    setContentTransMode(newMode: ContentTransModeType) {
      self.contentTransMode = newMode;
    },
    setLanguages(newLanguages: ILanguageModel[]) {
      //@ts-ignore
      self.languages = newLanguages;
    },
    setIsShowSpoiler(newMode: boolean) {
      self.isShowSpoiler = newMode;
    },
    setRegion(newRegion: ServerRegion) {
      self.region = newRegion;
    },
  }));
export interface ISettings extends Instance<typeof Settings> {}
