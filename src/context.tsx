import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  LanguageModel,
  SekaiCardTeamModel,
  SekaiProfileModel,
  UserMetadatumModel,
  UserModel,
} from "./strapi-model";
import { ContentTransModeType, DisplayModeType } from "./types.d";
import { useLocalStorage } from "./utils";
import { useAssetI18n } from "./utils/i18n";
import useJwtAuth from "./utils/jwt";

export const SettingContext = createContext<
  | {
      lang: string;
      displayMode: DisplayModeType;
      contentTransMode: ContentTransModeType;
      languages: LanguageModel[];
      isShowSpoiler: boolean;
      updateLang(newLang: string): void;
      updateDisplayMode(newMode: DisplayModeType): void;
      updateContentTransMode(newMode: ContentTransModeType): void;
      updateLanguages(newLangs: LanguageModel[]): void;
      updateIsShowSpoiler(mode: boolean): void;
    }
  | undefined
>(undefined);

export const SettingProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const { assetI18n } = useAssetI18n();

  const [lang, setLang] = useState(i18n.language);
  const [displayMode, setDisplayMode] = useLocalStorage<DisplayModeType>(
    "display-mode",
    "auto"
  );
  const [languages, setLanguages] = useLocalStorage<LanguageModel[]>(
    "languages-cache",
    []
  );
  const [contentTransMode, setContentTransMode] =
    useLocalStorage<ContentTransModeType>(
      "content-translation-mode",
      "translated"
    );
  const [isShowSpoiler, setIsShowSpoiler] = useLocalStorage<boolean>(
    "is-show-spoiler",
    false
  );

  useEffect(() => {
    if (!localStorage.getItem("is-show-spoiler-force-false")) {
      setIsShowSpoiler(false);
      localStorage.setItem("is-show-spoiler-force-false", "true");
    }
  }, [setIsShowSpoiler]);

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
        },
        contentTransMode,
        updateContentTransMode(newMode: ContentTransModeType) {
          setContentTransMode(newMode);
        },
        languages,
        updateLanguages(newLangs: LanguageModel[]) {
          setLanguages(newLangs);
        },
        isShowSpoiler,
        updateIsShowSpoiler(mode: boolean) {
          setIsShowSpoiler(mode);
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
      sekaiCardTeam?: SekaiCardTeamModel;
      updateSekaiCardTeam(data?: Partial<SekaiCardTeamModel>): void;
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
  const [sekaiCardTeam, setSekaiCardTeam] = useState<
    SekaiCardTeamModel | undefined
  >(JSON.parse(localStorage.getItem("sekaiCardTeam") || "null") || undefined);

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
          setSekaiProfile((profile) => {
            const _data = Object.assign({}, profile, data);

            if (data) {
              localStorage.setItem("sekaiProfile", JSON.stringify(_data));
              return _data;
            } else {
              localStorage.removeItem("sekaiProfile");
              return data;
            }
          });
        }, []),
        logout: useCallback(() => {
          auth.user = null;
          auth.token = "";
          setSekaiProfile(undefined);
          // localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("userMetaDatum");
          localStorage.removeItem("lastUserCheck");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("sekaiProfile");
          localStorage.removeItem("sekaiCardTeam");
        }, [auth]),
        usermeta: useMemo(() => usermeta, [usermeta]),
        updateUserMeta: useCallback(
          (data) => {
            auth.usermeta = Object.assign({}, auth.usermeta, data);
            setUsermeta((usermeta) => Object.assign({}, usermeta, data));
          },
          [auth]
        ),
        sekaiCardTeam,
        updateSekaiCardTeam: useCallback((data) => {
          setSekaiCardTeam((profile) => {
            const _data = Object.assign({}, profile, data);

            if (data) {
              localStorage.setItem("sekaiCardTeam", JSON.stringify(_data));
              return _data;
            } else {
              localStorage.removeItem("sekaiCardTeam");
              return data;
            }
          });
        }, []),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
