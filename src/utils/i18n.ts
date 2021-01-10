import { ContentTransModeType } from "./../types.d";
import i18n, { TOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import fetchBackend from "i18next-fetch-backend";
import detector from "i18next-browser-languagedetector";
import { useCallback } from "react";
import { getLanguages } from "./apiClient";

export const assetI18n: typeof i18n = i18n.createInstance();
// export const announcementI18n: typeof i18n = i18n.createInstance();

export async function initGlobalI18n() {
  const languages = await getLanguages();
  localStorage.setItem("languages-cache", JSON.stringify(languages));
  const codes = languages.map((lang) => lang.code);

  i18n
    .use(initReactI18next)
    .use(fetchBackend)
    .use(detector)
    .init({
      supportedLngs: codes,
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
        "live2d",
        "virtual_live",
        "translate",
        "honor",
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
      supportedLngs: codes,
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
        "virtualLive_name",
        "unit_story_episode_title",
        "event_story_episode_title",
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

  // announcementI18n
  //   .use(fetchBackend)
  //   .use(detector)
  //   .init({
  //     supportedLngs: codes,
  //     fallbackLng: {
  //       default: ["en"],
  //       pt: ["pt-BR", "en"],
  //     },
  //     backend: {
  //       loadPath:
  //         process.env.REACT_APP_STRAPI_BASE +
  //         "/announcement/{{ns}}/translation/{{lng}}",
  //     },
  //     returnEmptyString: false,
  //   });
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

// export function useAnnouncementI18n() {
//   return {
//     t: announcementI18n.t,
//     i18n: announcementI18n,
//     loadNS: announcementI18n.loadNamespaces,
//   };
// }
