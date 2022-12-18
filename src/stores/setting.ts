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
  "kr",
]);

export const Settings = types
  .model({
    contentTransMode: SettingContentTransMode,
    displayMode: SettingDisplayMode,
    isShowSpoiler: types.optional(types.boolean, false),
    lang: types.string,
    languages: types.array(LanguageModel),
    region: SettingRegion,
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
    setLang(newLang: string) {
      self.lang = newLang;
    },
    setLanguages(newLanguages: ILanguageModel[]) {
      //@ts-ignore
      self.languages = newLanguages;
    },
    setRegion(newRegion: ServerRegion) {
      self.region = newRegion;
    },
  }));
export interface ISettings extends Instance<typeof Settings> {}
