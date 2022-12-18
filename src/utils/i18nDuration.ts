import {
  HumanizerOptions,
  humanizer as createHumanizer,
} from "humanize-duration";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const fallbackLang = "en";

// map from our (i18next's) language code to humanize-duration's language code
const languageMap = new Map<string, string>([
  //
  ["zh-CN", "zh_CN"],
  ["zh-TW", "zh_TW"],
]);

const humanizer = createHumanizer({
  languages: {
    // TODO: add langs here

    // short langs
    short_en: {
      d: () => "d",
      h: () => "h",
      m: () => "m",
      mo: () => "mo",
      ms: () => "ms",
      s: () => "s",
      w: () => "w",
      y: () => "y",
    },
  },
});

export function useDurationI18n() {
  const { i18n } = useTranslation();

  const language = languageMap.get(i18n.language) || i18n.language;

  const humanize = useCallback(
    (duration: number, options?: HumanizerOptions) =>
      humanizer(duration, {
        fallbacks: [fallbackLang],
        language,
        ...options,
      }),
    [language]
  );

  const humanizeShort = useCallback(
    (duration: number, options?: HumanizerOptions) =>
      humanizer(duration, {
        fallbacks: [language, `short_${fallbackLang}`, fallbackLang],
        language: `short_${language}`,
        ...options,
      }),
    [language]
  );

  return [humanize, humanizeShort] as const;
}
