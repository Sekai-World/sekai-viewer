import { HumanizerOptions, humanizer as createHumanizer } from "humanize-duration";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const fallbackLang = "en";

const humanizer = createHumanizer({
  languages: {
    // TODO: add langs here

    // short langs
    short_en: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
});

export function useDurationI18n() {
  const { i18n } = useTranslation();

  const humanize = useCallback(
    (duration: number, options?: HumanizerOptions) =>
      humanizer(duration, {
        language: i18n.language,
        fallbacks: [fallbackLang],
        ...options,
      }),
    [i18n.language]
  );

  const humanizeShort = useCallback(
    (duration: number, options?: HumanizerOptions) =>
      humanizer(duration, {
        language: `short_${i18n.language}`,
        fallbacks: [i18n.language, `short_${fallbackLang}`, fallbackLang],
        ...options,
      }),
    [i18n.language]
  );

  return [humanize, humanizeShort] as const;
}
