import Axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { WebpMachine } from "webp-hero";
import PQueue from "p-queue";
import localforage from "localforage";
import {
  IGachaInfo,
  ICardInfo,
  IGameChara,
  IMusicInfo,
  ISkillInfo,
  ICardRarity,
  ICharacterRank,
  IMusicVocalInfo,
  IOutCharaProfile,
  IUserInformationInfo,
  IMusicDifficultyInfo,
  IMusicTagInfo,
  IReleaseCondition,
  IMusicDanceMembers,
  IEventInfo,
  IEventDeckBonus,
  IGameCharaUnit,
  IResourceBoxInfo,
  IHonorInfo,
  ICardEpisode,
  ContentTransModeType,
  ITipInfo,
  ICharaProfile,
  ICharacter2D,
  IMobCharacter,
  IMusicMeta,
  IScenarioData,
  IUnitProfile,
  IUnitStory,
  SnippetAction,
  SpecialEffectType,
  SnippetProgressBehavior,
  SoundPlayMode,
  IEventStory,
  IHonorMission,
  IBeginnerMission,
  ICharacterMission,
  IHonorGroup,
  INormalMission,
  IEventCard,
  IMusicAchievement,
  IGachaCeilItem,
  ICharacter3D,
  ICostume3DModel,
  IAreaItemLevel,
  IAreaItem,
  ICheerfulCarnivalSummary,
  ICheerfulCarnivalTeam,
  IArea,
} from "./../types.d";
import { useAssetI18n, useCharaName } from "./i18n";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { useSnackbar } from "material-ui-snackbar-provider";

const webpMachine = new WebpMachine();

export function useRefState<S>(
  initialValue: S
): [S, React.MutableRefObject<S>, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
}

export function useCachedData<
  T extends
    | IGachaInfo
    | ICardInfo
    | IGameChara
    | IMusicInfo
    | ISkillInfo
    | ICardRarity
    | ICharacterRank
    | IMusicVocalInfo
    | IOutCharaProfile
    | IUserInformationInfo
    | IMusicDifficultyInfo
    | IMusicTagInfo
    | IReleaseCondition
    | IMusicDanceMembers
    | IEventInfo
    | IEventDeckBonus
    | IGameCharaUnit
    | IResourceBoxInfo
    | IHonorInfo
    | ICardEpisode
    | ITipInfo
    | ICharaProfile
    | IUnitProfile
    | IUnitStory
    | IMobCharacter
    | ICharacter2D
    | IEventStory
    | IHonorMission
    | INormalMission
    | IBeginnerMission
    | IHonorGroup
    | ICharacterMission
    | IEventCard
    | IMusicAchievement
    | IGachaCeilItem
    | ICharacter3D
    | ICostume3DModel
    | IAreaItemLevel
    | IAreaItem
    | ICheerfulCarnivalSummary
    | ICheerfulCarnivalTeam
    | IArea
>(name: string): [T[] | undefined, boolean, any] {
  // const [cached, cachedRef, setCached] = useRefState<T[]>([]);

  const fetchCached = useCallback(async (name: string) => {
    const { data }: { data: T[] } = await Axios.get(
      `${
        window.isChinaMainland
          ? process.env.REACT_APP_JSON_DOMAIN_CN + "/master"
          : "https://sekai-world.github.io/sekai-master-db-diff"
      }/${name}.json`
    );
    return data;
  }, []);

  const { data, error } = useSWR(name, fetchCached);

  return [data, !error && !data, error];
}

export const musicCategoryToName: { [key: string]: string } = {
  mv: "3D MV",
  original: "Original MV",
  sekai: "Sekai MV",
  image: "Static Image",
  mv_2d: "2D MV",
};

export function useMusicTagName(contentTransMode: ContentTransModeType) {
  const { assetT } = useAssetI18n();

  switch (contentTransMode) {
    case "both": {
      return {
        all: "All",
        vocaloid: `バーチャル・シンガー | ${assetT(
          `unit_profile:piapro.name`,
          "バーチャル・シンガー"
        )}`,
        light_music_club: `Leo/need | ${assetT(
          `unit_profile:light_sound.name`,
          "Leo/need"
        )}`,
        idol: `MORE MORE JUMP! | ${assetT(
          `unit_profile:idol.name`,
          "MORE MORE JUMP!"
        )}`,
        school_refusal: `25時、ナイトコードで。 | ${assetT(
          `unit_profile:school_refusal.name`,
          "25時、ナイトコードで。"
        )}`,
        theme_park: `ワンダーランズ×ショウタイム | ${assetT(
          `unit_profile:theme_park.name`,
          "ワンダーランズ×ショウタイム"
        )}`,
        street: `Vivid BAD SQUAD | ${assetT(
          `unit_profile:street.name`,
          "Vivid BAD SQUAD"
        )}`,
        other: "Other",
      };
    }
    case "original": {
      return {
        all: "All",
        vocaloid: `バーチャル・シンガー`,
        light_music_club: `Leo/need`,
        idol: `MORE MORE JUMP!`,
        school_refusal: `25時、ナイトコードで。`,
        theme_park: `ワンダーランズ×ショウタイム`,
        street: `Vivid BAD SQUAD`,
        other: "Other",
      };
    }
    case "translated": {
      return {
        all: "All",
        vocaloid: assetT(`unit_profile:piapro.name`, "バーチャル・シンガー"),
        light_music_club: assetT(`unit_profile:light_sound.name`, "Leo/need"),
        idol: assetT(`unit_profile:idol.name`, "MORE MORE JUMP!"),
        school_refusal: assetT(
          `unit_profile:school_refusal.name`,
          "25時、ナイトコードで。"
        ),
        theme_park: assetT(
          `unit_profile:theme_park.name`,
          "ワンダーランズ×ショウタイム"
        ),
        street: assetT(`unit_profile:street.name`, "Vivid BAD SQUAD"),
        other: "Other",
      };
    }
  }
}

export function useMuisicMeta() {
  const fetchCached = useCallback(async (name: string) => {
    const { data }: { data: IMusicMeta[] } = await Axios.get(
      (window.isChinaMainland
        ? process.env.REACT_APP_FRONTEND_ASSET_BASE_CN
        : process.env.REACT_APP_FRONTEND_ASSET_BASE) + `/${name}.json`
    );
    //console.log(data.length);
    return data;
  }, []);

  const { data } = useSWR("music_metas", fetchCached);

  return [data];
}

const queue = new PQueue({ concurrency: 1 });

export async function getRemoteAssetURL(
  endpoint: string,
  setFunc?: CallableFunction,
  cnDomain: boolean = false,
  minioDomain: boolean = false
): Promise<string> {
  const isWebpSupported = Modernizr.webplossless;
  const url = cnDomain
    ? `${process.env.REACT_APP_ASSET_DOMAIN_CN}/${endpoint}`
    : minioDomain
    ? `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets/${endpoint}`
    : `${process.env.REACT_APP_ASSET_DOMAIN_WW}/sekai-assets/${endpoint}`;

  if (endpoint.endsWith(".webp") && !isWebpSupported) {
    let dataUrl = await localforage.getItem<string>(url);
    if (!dataUrl) {
      const res = await Axios.get(url, { responseType: "arraybuffer" });
      dataUrl = await queue.add<string>(() =>
        webpMachine.decode(new Uint8Array(res.data))
      );
      await localforage.setItem(url, dataUrl);
      if (setFunc) setFunc(dataUrl);
      return dataUrl;
    } else {
      // await Axios.head(url);
      if (setFunc) setFunc(dataUrl);
      return dataUrl;
    }
  } else {
    // await Axios.head(url);
    if (setFunc) setFunc(url);
    return url;
  }
}

export function useProcessedScenarioData() {
  const [mobCharas] = useCachedData<IMobCharacter>("mobCharacters");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");

  const getCharaName = useCharaName();

  return useCallback(
    async (scenarioPath: string, isCardStory: boolean) => {
      const ret: {
        characters: { id: number; name: string }[];
        actions: { [key: string]: any }[];
      } = {
        characters: [],
        actions: [],
      };

      if (
        !chara2Ds ||
        !chara2Ds.length ||
        !mobCharas ||
        !mobCharas.length ||
        !scenarioPath
      )
        return ret;

      const { data }: { data: IScenarioData } = await Axios.get(
        await getRemoteAssetURL(scenarioPath),
        {
          responseType: "json",
        }
      );
      const {
        ScenarioId,
        AppearCharacters,
        Snippets,
        TalkData,
        // LayoutData,
        SpecialEffectData,
        SoundData,
        FirstBgm,
        FirstBackground,
      } = data;

      if (FirstBackground) {
        ret.actions.push({
          type: SnippetAction.SpecialEffect,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          delay: 0,
          seType: "ChangeBackground",
          body: FirstBgm,
          resource: await getRemoteAssetURL(
            `scenario/background/${FirstBackground}_rip/${FirstBackground}.webp`
          ),
        });
      }
      if (FirstBgm) {
        ret.actions.push({
          type: SnippetAction.Sound,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          delay: 0,
          playMode: SoundPlayMode[0],
          hasBgm: true,
          hasSe: false,
          bgm: await getRemoteAssetURL(
            `sound/scenario/bgm/${FirstBgm}_rip/${FirstBgm}.mp3`
          ),
          se: "",
        });
      }

      // eslint-disable-next-line array-callback-return
      ret.characters = AppearCharacters.map((ap) => {
        const chara2d = chara2Ds.find((ch) => ch.id === ap.Character2dId)!;
        switch (chara2d.characterType) {
          case "game_character": {
            return {
              id: chara2d.characterId,
              name: getCharaName(chara2d.characterId)!,
            };
          }
          case "mob": {
            return {
              id: chara2d.characterId,
              name: mobCharas.find((mc) => mc.id === chara2d.characterId)!.name,
            };
          }
        }
      });

      for (let snippet of Snippets) {
        let action: { [key: string]: any } = {};
        switch (snippet.Action) {
          case SnippetAction.Talk:
            {
              const talkData = TalkData[snippet.ReferenceIndex];
              // try get character
              let chara = { id: 0, name: "" };
              if (talkData.TalkCharacters[0].Character2dId) {
                const chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
                chara.id = chara2d.characterId;
              }
              chara.name = talkData.WindowDisplayName;
              let voiceUrl = talkData.Voices.length
                ? `sound/${
                    isCardStory ? "card_" : ""
                  }scenario/voice/${ScenarioId}_rip/${
                    talkData.Voices[0].VoiceId
                  }.mp3`
                : "";

              if (
                talkData.Voices.length &&
                talkData.Voices[0].VoiceId.startsWith("partvoice")
              ) {
                const chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
                voiceUrl = `sound/scenario/part_voice/${chara2d.assetName}_${chara2d.unit}_rip/${talkData.Voices[0].VoiceId}.mp3`;
              }

              action = {
                type: snippet.Action,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                delay: snippet.Delay,
                chara,
                body: talkData.Body,
                voice: talkData.Voices.length
                  ? await getRemoteAssetURL(voiceUrl)
                  : "",
              };
            }
            break;
          case SnippetAction.SpecialEffect:
            {
              const specialEffect = SpecialEffectData[snippet.ReferenceIndex];
              const specialEffectType =
                SpecialEffectType[specialEffect.EffectType];

              action = {
                type: snippet.Action,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                delay: snippet.Delay,
                seType: specialEffectType,
                body: specialEffect.StringVal,
                resource:
                  specialEffectType === "FullScreenText"
                    ? await getRemoteAssetURL(
                        `sound/scenario/voice/${ScenarioId}_rip/${specialEffect.StringValSub}.mp3`
                      )
                    : specialEffectType === "ChangeBackground"
                    ? await getRemoteAssetURL(
                        `scenario/background/${specialEffect.StringValSub}_rip/${specialEffect.StringValSub}.webp`
                      )
                    : specialEffectType === "Movie"
                    ? await getRemoteAssetURL(
                        `scenario/movie/${specialEffect.StringVal}_rip/${
                          specialEffect.StringVal.split("_")[0]
                        }.mp4`
                      )
                    : "",
              };
            }
            break;
          case SnippetAction.Sound:
            {
              const soundData = SoundData[snippet.ReferenceIndex];

              action = {
                type: snippet.Action,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                delay: snippet.Delay,
                playMode: SoundPlayMode[soundData.PlayMode],
                hasBgm: !!soundData.Bgm,
                hasSe: !!soundData.Se,
                bgm: soundData.Bgm
                  ? await getRemoteAssetURL(
                      `sound/scenario/bgm/${soundData.Bgm}_rip/${soundData.Bgm}.mp3`
                    )
                  : "",
                se: soundData.Se
                  ? await getRemoteAssetURL(
                      `sound/scenario/se/se_pack00001_rip/${soundData.Se}.mp3`
                    )
                  : "",
              };
            }
            break;
          default: {
            action = {
              type: snippet.Action,
              isWait:
                snippet.ProgressBehavior ===
                SnippetProgressBehavior.WaitUnitilFinished,
              delay: snippet.Delay,
            };
          }
        }

        ret.actions.push(action);
      }

      return ret;
    },
    [chara2Ds, getCharaName, mobCharas]
  );
}

export function getJPTime() {
  return new Date()
    .toLocaleDateString("en-US", { timeZone: "Asia/Tokyo" })
    .split("/")
    .slice(0, 2)
    .join("/");
}

export function useQuery() {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  return query;
}

export function getColorArray(num: number) {
  const result = [];
  for (let i = 0; i < num; i += 1) {
    const letters = "0123456789ABCDEF".split("");
    let color = "#";
    for (let j = 0; j < 6; j += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    result.push(color);
  }
  return result;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  allowNull: boolean = true
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      // return item ? JSON.parse(item) : initialValue;
      if (item) {
        const parsed = JSON.parse(item);
        if (!allowNull && !parsed) {
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          return initialValue;
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(key, error);
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(!allowNull && !valueToStore ? initialValue : valueToStore);
      // Save to local storage
      window.localStorage.setItem(
        key,
        JSON.stringify(
          !allowNull && !valueToStore ? initialValue : valueToStore
        )
      );
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export function useToggle(initialValue = false) {
  // Returns the tuple [state, dispatch]
  // Normally with useReducer you pass a value to dispatch to indicate what action to
  // take on the state, but in this case there's only one action.
  return useReducer((state) => !state, initialValue);
}

export function useAlertSnackbar() {
  const snackbar = useSnackbar();
  return useMemo(() => {
    const showMessage: (
      type: string
    ) => (
      message: string,
      action?: string | undefined,
      handleAction?: (() => void) | undefined,
      customParameters?: any
    ) => any = (type: string) => (
      message,
      action,
      handleAction,
      customParameters
    ) =>
      snackbar.showMessage(message, action, handleAction, {
        ...customParameters,
        type,
      });
    return {
      ...snackbar,
      showMessage: showMessage("info"),
      showInfo: showMessage("info"),
      showWarning: showMessage("warning"),
      showError: showMessage("error"),
      showSuccess: showMessage("success"),
    };
  }, [snackbar]);
}
