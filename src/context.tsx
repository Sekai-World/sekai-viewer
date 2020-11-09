import React, { createContext, PropsWithChildren, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentTransModeType, DisplayModeType } from "./types";
import { useAssetI18n } from "./utils/i18n";

export const SettingContext = createContext<
  | {
      lang: string;
      displayMode: DisplayModeType;
      contentTransMode: ContentTransModeType;
      updateLang(newLang: string): void;
      updateDisplayMode(newMode: DisplayModeType): void;
      updateContentTransMode(newMode: ContentTransModeType): void;
    }
  | undefined
>(undefined);

export const SettingProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const { assetI18n } = useAssetI18n();

  const [lang, setLang] = useState(i18n.language);
  const [displayMode, setDisplayMode] = useState<DisplayModeType>(
    (localStorage.getItem("display-mode") as DisplayModeType) || "auto"
  );
  const [contentTransMode, setContentTransMode] = useState<
    ContentTransModeType
  >(
    (localStorage.getItem(
      "content-translation-mode"
    ) as ContentTransModeType) || "translated"
  );

  return (
    <SettingContext.Provider
      value={{
        lang,
        updateLang(newLang: string) {
          setLang(newLang);
          i18n.changeLanguage(newLang);
          assetI18n.changeLanguage(newLang);
        },
        displayMode,
        updateDisplayMode(newMode: DisplayModeType) {
          setDisplayMode(newMode);
          localStorage.setItem("display-mode", newMode);
        },
        contentTransMode,
        updateContentTransMode(newMode: ContentTransModeType) {
          setContentTransMode(newMode);
          localStorage.setItem("content-translation-mode", newMode);
        },
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};
