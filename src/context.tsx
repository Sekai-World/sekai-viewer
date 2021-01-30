import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  LanguageModel,
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
      languages: LanguageModel[];
      updateLang(newLang: string): void;
      updateDisplayMode(newMode: DisplayModeType): void;
      updateContentTransMode(newMode: ContentTransModeType): void;
      updateLanguages(newLangs: LanguageModel[]): void;
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
  const [languages, setLanguages] = useState<LanguageModel[]>(
    JSON.parse(
      localStorage.getItem("languages-cache") || "[]"
    ) as LanguageModel[]
  );
  const [
    contentTransMode,
    setContentTransMode,
  ] = useState<ContentTransModeType>(
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
        languages,
        updateLanguages(newLangs: LanguageModel[]) {
          setLanguages(newLangs);
          localStorage.setItem("languages-cache", JSON.stringify(newLangs));
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
      updateSekaiProfile(data?: Partial<SekaiProfileModel>): void;
      logout(): void;
      usermeta: UserMetadatumModel | null;
      updateUserMeta(data: Partial<UserMetadatumModel> | null): void;
    }
  | undefined
>(undefined);

export const UserProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const auth = useJwtAuth();

  const [user, setUser] = useState(auth.user);
  const [token, setToken] = useState(auth.token);
  const [usermeta, setUsermeta] = useState(auth.usermeta);

  const [sekaiProfile, setSekaiProfile] = useState<
    SekaiProfileModel | undefined
  >(JSON.parse(localStorage.getItem("sekaiProfile") || "null") || undefined);

  return (
    <UserContext.Provider
      value={{
        user: useMemo(() => user, [user]),
        jwtToken: useMemo(() => token, [token]),
        sekaiProfile,
        updateUser: useCallback(
          (newUser: UserModel | null) => {
            auth.user = newUser;
            setUser(newUser);
          },
          [auth]
        ),
        updateJwtToken: useCallback(
          (newToken: string) => {
            auth.token = newToken;
            setToken(newToken);
          },
          [auth]
        ),
        updateSekaiProfile: useCallback((data) => {
          setSekaiProfile((profile) => Object.assign({}, profile, data));
          if (data) localStorage.setItem("sekaiProfile", JSON.stringify(data));
          else localStorage.removeItem("sekaiProfile");
        }, []),
        logout: useCallback(() => {
          auth.user = null;
          auth.token = "";
          setSekaiProfile(undefined);
          localStorage.removeItem("sekaiProfile");
        }, [auth]),
        usermeta: useMemo(() => usermeta, [usermeta]),
        updateUserMeta: useCallback(
          (data) => {
            auth.usermeta = Object.assign({}, auth.usermeta, data);
            setUsermeta((usermeta) => Object.assign({}, usermeta, data));
          },
          [auth]
        ),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
