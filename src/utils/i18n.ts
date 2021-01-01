import { ContentTransModeType } from "./../types.d";
import i18n, { TOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import fetchBackend from "i18next-fetch-backend";
import detector from "i18next-browser-languagedetector";
import { useCallback } from "react";

export const assetI18n: typeof i18n = i18n.createInstance();

export function initGlobalI18n() {
  i18n
    .use(initReactI18next)
    .use(fetchBackend)
    .use(detector)
    .init({
      supportedLngs: [
        "en",
        "zh-CN",
        "zh-TW",
        "ja",
        "ko",
        "es",
        "de",
        "pt-BR",
        "ru",
        "it",
        "pl",
        "fr",
        "id",
        "th",
      ],
      ns: [
        "common",
        "home",
        "card",
        "music",
        "gacha",
        "event",
        "unit",
        "member",
        "filter",
        "music",
        "title",
        "member",
        "unit",
        "about",
        "support",
        "music_recommend",
        "story_reader",
        "mission",
        "event_calc",
        "team_build",
        "user",
        "auth",
        "announcement",
        "comment",
      ],
      fallbackLng: {
        default: ["en"],
        pt: ["pt-BR", "en"],
      },
      fallbackNS: "common",
      backend: {
        loadPath:
          (window.isChinaMainland
            ? process.env.REACT_APP_JSON_DOMAIN_CN + "/locales"
            : process.env.REACT_APP_JSON_DOMAIN_WW) + "/{{lng}}/{{ns}}.json",
      },
      returnEmptyString: false,
    });

  assetI18n
    .use(fetchBackend)
    .use(detector)
    .init({
      supportedLngs: [
        "en",
        "zh-CN",
        "zh-TW",
        "ja",
        "ko",
        "es",
        "de",
        "pt-BR",
        "ru",
        "it",
        "pl",
        "fr",
        "id",
        "th",
      ],
      ns: [
        "music_titles",
        "card_prefix",
        "card_skill_name",
        "event_name",
        "gacha_name",
        "character_name",
        "skill_desc",
        "character_profile",
        "unit_profile",
        "stamp_name",
        "comic_title",
        "release_cond",
        "card_episode_title",
        "music_vocal",
        "unit_story_chapter_title",
        "honor_mission",
        "normal_mission",
        "beginner_mission",
        "honor_name",
        "honorGroup_name",
      ],
      fallbackLng: {
        default: ["ja"],
        pt: ["pt-BR", "ja"],
      },
      backend: {
        loadPath:
          (window.isChinaMainland
            ? process.env.REACT_APP_JSON_DOMAIN_CN + "/locales"
            : process.env.REACT_APP_JSON_DOMAIN_WW) + "/{{lng}}/{{ns}}.json",
      },
      returnEmptyString: false,
    });
}

export function useAssetI18n() {
  const assetT = useCallback(
    (key: string, original: string, options?: string | TOptions): string => {
      const translated = assetI18n.t(key, options);
      return !Number.isNaN(Number(translated)) ? original : translated;
    },
    []
  );
  const getTranslated = useCallback(
    (
      mode: ContentTransModeType,
      key: string,
      original: string,
      options?: string | TOptions
    ) => {
      switch (mode) {
        case "original":
          return original;
        case "translated":
          return assetT(key, original, options);
        case "both":
          return `${original} | ${assetT(key, original, options)}`;
      }
    },
    [assetT]
  );
  return { assetT, assetI18n, getTranslated };
}
