import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  SekaiProfileModel,
  UserMetadatumModel,
  UserModel,
} from "./strapi-model";
import { ContentTransModeType, DisplayModeType } from "./types";
import { useAssetI18n } from "./utils/i18n";
import useJwtAuth from "./utils/jwt";

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

export const UserContext = createContext<
  | {
      user: UserModel | null;
      updateUser(newUser: UserModel | null): void;
      jwtToken: string;
      updateJwtToken(newToken: string): void;
      sekaiProfile?: SekaiProfileModel;
      updateSekaiProfile(data?: SekaiProfileModel): void;
      logout(): void;
      usermeta: UserMetadatumModel | null;
      updateUserMeta(data: UserMetadatumModel | null): void;
    }
  | undefined
>(undefined);

export const UserProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const auth = useJwtAuth();

  const [sekaiProfile, setSekaiProfile] = useState<
    SekaiProfileModel | undefined
  >(JSON.parse(localStorage.getItem("sekaiProfile") || "null") || undefined);

  return (
    <UserContext.Provider
      value={{
        get user() {
          return auth.user;
        },
        get jwtToken() {
          return auth.token;
        },
        sekaiProfile,
        updateUser: useCallback(
          (newUser: UserModel | null) => {
            auth.user = newUser;
          },
          [auth.user]
        ),
        updateJwtToken: useCallback(
          (newToken: string) => {
            auth.token = newToken;
          },
          [auth.token]
        ),
        updateSekaiProfile: useCallback((data) => {
          setSekaiProfile(data);
          if (data) localStorage.setItem("sekaiProfile", JSON.stringify(data));
          else localStorage.removeItem("sekaiProfile");
        }, []),
        logout: useCallback(() => {
          auth.user = null;
          auth.token = "";
          setSekaiProfile(undefined);
          localStorage.removeItem("sekaiProfile");
        }, [auth.token, auth.user]),
        get usermeta() {
          return auth.usermeta;
        },
        updateUserMeta: useCallback(
          (data) => {
            auth.usermeta = data;
          },
          [auth.usermeta]
        ),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
