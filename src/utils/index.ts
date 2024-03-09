import Axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
// import PQueue from "p-queue";
// import localforage from "localforage";
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
  IActionSet,
  ServerRegion,
  AssetDomainKey,
  IVersionInfo,
  ISpecialStory,
  IBondsHonor,
  IBondsHonorWord,
  IBond,
  IBondsReward,
  IEventRarityBonusRate,
  IMasterLesson,
  IMasterLessonReward,
  IListBucketResult,
  IEventMusic,
  ICompactResourceBox,
  ICompactResourceBoxDetail,
  IGachaTicket,
} from "./../types.d";
import { useAssetI18n, useCharaName } from "./i18n";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { useSnackbar, VariantType } from "notistack";
import { useTranslation } from "react-i18next";
import { assetUrl, masterUrl } from "./urls";
import { UserModel } from "../strapi-model";
import { IUserInfo } from "../stores/user";
import { useRootStore } from "../stores/root";
import { XMLParser } from "fast-xml-parser";

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
    | IActionSet
    | ISpecialStory
    | IBondsHonor
    | IBondsHonorWord
    | IBond
    | IBondsReward
    | IEventRarityBonusRate
    | IMasterLesson
    | IMasterLessonReward
    | IEventMusic
    | IGachaTicket
>(name: string): [T[] | undefined, boolean, any] {
  // const [cached, cachedRef, setCached] = useRefState<T[]>([]);
  const { region } = useRootStore();

  const fetchCached = useCallback(async (name: string) => {
    const [region, filename] = name.split("|");
    const urlBase = masterUrl["ww"][region as ServerRegion];
    const { data }: { data: T[] } = await Axios.get(
      `${urlBase}/${filename}.json`
    );
    return data;
  }, []);

  const { data, error } = useSWR(`${region}|${name}`, fetchCached);

  return [data, !error && !data, error];
}

export function useCompactData<
  T extends ICompactResourceBox | ICompactResourceBoxDetail
>(name: string): [T | undefined, boolean, any] {
  const { region } = useRootStore();

  const fetchCached = useCallback(async (name: string) => {
    const [region, filename] = name.split("|");
    const urlBase = masterUrl["ww"][region as ServerRegion];
    const { data }: { data: T } = await Axios.get(
      `${urlBase}/${filename}.json`
    );
    return data;
  }, []);

  const { data, error } = useSWR(`${region}|${name}`, fetchCached);

  return [data, !error && !data, error];
}

export function useVersionInfo(): [IVersionInfo | undefined, boolean, any] {
  const { region } = useRootStore();

  const fetchCached = useCallback(async (name: string) => {
    const [region, filename] = name.split("|");
    const urlBase = masterUrl["ww"][region as ServerRegion];
    const { data }: { data: IVersionInfo } = await Axios.get(
      `${urlBase}/${filename}.json`
    );
    return data;
  }, []);

  const { data, error } = useSWR(`${region}|versions`, fetchCached);

  return [data, !error && !data, error];
}

export const musicCategoryToName: { [key: string]: string } = {
  image: "Static Image",
  mv: "3D MV",
  mv_2d: "2D MV",
  original: "Original MV",
  sekai: "Sekai MV",
};

export function useMusicTagName(contentTransMode: ContentTransModeType) {
  const { assetT } = useAssetI18n();

  switch (contentTransMode) {
    case "both": {
      return {
        all: "All",
        idol: `MORE MORE JUMP! | ${assetT(
          `unit_profile:idol.name`,
          "MORE MORE JUMP!"
        )}`,
        light_music_club: `Leo/need | ${assetT(
          `unit_profile:light_sound.name`,
          "Leo/need"
        )}`,
        other: "Other",
        school_refusal: `25時、ナイトコードで。 | ${assetT(
          `unit_profile:school_refusal.name`,
          "25時、ナイトコードで。"
        )}`,
        street: `Vivid BAD SQUAD | ${assetT(
          `unit_profile:street.name`,
          "Vivid BAD SQUAD"
        )}`,
        theme_park: `ワンダーランズ×ショウタイム | ${assetT(
          `unit_profile:theme_park.name`,
          "ワンダーランズ×ショウタイム"
        )}`,
        vocaloid: `バーチャル・シンガー | ${assetT(
          `unit_profile:piapro.name`,
          "バーチャル・シンガー"
        )}`,
      };
    }
    case "original": {
      return {
        all: "All",
        idol: `MORE MORE JUMP!`,
        light_music_club: `Leo/need`,
        other: "Other",
        school_refusal: `25時、ナイトコードで。`,
        street: `Vivid BAD SQUAD`,
        theme_park: `ワンダーランズ×ショウタイム`,
        vocaloid: `バーチャル・シンガー`,
      };
    }
    case "translated": {
      return {
        all: "All",
        idol: assetT(`unit_profile:idol.name`, "MORE MORE JUMP!"),
        light_music_club: assetT(`unit_profile:light_sound.name`, "Leo/need"),
        other: "Other",
        school_refusal: assetT(
          `unit_profile:school_refusal.name`,
          "25時、ナイトコードで。"
        ),
        street: assetT(`unit_profile:street.name`, "Vivid BAD SQUAD"),
        theme_park: assetT(
          `unit_profile:theme_park.name`,
          "ワンダーランズ×ショウタイム"
        ),
        vocaloid: assetT(`unit_profile:piapro.name`, "バーチャル・シンガー"),
      };
    }
  }
}

export function useMusicMeta() {
  const fetchCached = useCallback(async (name: string) => {
    const { data }: { data: IMusicMeta[] } = await Axios.get(
      import.meta.env.VITE_FRONTEND_ASSET_BASE + `/${name}.json`
    );
    //console.log(data.length);
    return data;
  }, []);

  const { data } = useSWR("music_metas", fetchCached);

  return [data];
}

export function filterMusicMeta(metas: IMusicMeta[], musics: IMusicInfo[]) {
  const validIds = musics.map((music) => music.id);

  return metas.filter((meta) => validIds.includes(meta.music_id));
}

export function addLevelToMusicMeta(
  metas: IMusicMeta[],
  musicDifficulties: IMusicDifficultyInfo[]
) {
  return metas.map((meta) => {
    const music = musicDifficulties.find(
      (music) =>
        music.musicId === meta.music_id &&
        music.musicDifficulty === meta.difficulty
    );
    if (music) {
      return {
        ...meta,
        level: music.playLevel,
      };
    }
    return meta;
  });
}

// const queue = new PQueue({ concurrency: 1 });

export async function getRemoteAssetURL(
  endpoint: string,
  setFunc?: CallableFunction,
  domainKey: AssetDomainKey = "minio",
  server: ServerRegion | "comic" | "musicChart" = "jp"
): Promise<string> {
  if (!endpoint) return "";
  // const isWebpSupported = Modernizr.webplossless;
  const url = `${assetUrl[domainKey][server]}/${endpoint}`;

  // if (endpoint.endsWith(".webp") && !isWebpSupported) {
  //   let dataUrl = await localforage.getItem<string>(url);
  //   if (!dataUrl) {
  //     const res = await Axios.get(url, { responseType: "arraybuffer" });
  //     dataUrl = await queue.add<string>(() =>
  //       webpMachine.decode(new Uint8Array(res.data))
  //     );
  //     await localforage.setItem(url, dataUrl);
  //     if (setFunc) setFunc(dataUrl);
  //     return dataUrl;
  //   } else {
  //     // await Axios.head(url);
  //     if (setFunc) setFunc(dataUrl);
  //     return dataUrl;
  //   }
  // } else
  // await Axios.head(url);
  if (setFunc) setFunc(url);
  return url;
}

// export async function getMovieUrl(stringVal: string) {
//   const buildDataUrl = await getRemoteAssetURL(
//     `scenario/movie/${stringVal}_rip/moviebundlebuilddata.asset`,
//     undefined,
//     window.isChinaMainland
//   );
//   const buildData = (await Axios.get(buildDataUrl, { responseType: "json" }))
//     .data;
//   const fileName = buildData.movieBundleDatas[0].usmFileName
//     .replace(/(-\d{3})?\.usm\.bytes/, "")
//     .toLowerCase();
//   return getRemoteAssetURL(
//     `scenario/movie/${stringVal}_rip/${fileName}.mp4`,
//     undefined,
//     window.isChinaMainland
//   );
// }

export function useProcessedScenarioData() {
  const [mobCharas] = useCachedData<IMobCharacter>("mobCharacters");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");

  const getCharaName = useCharaName();
  const { region } = useRootStore();

  return useCallback(
    async (
      scenarioPath: string,
      isCardStory: boolean = false,
      isActionSet: boolean = false
    ) => {
      const ret: {
        characters: { id: number; name: string }[];
        actions: { [key: string]: any }[];
      } = {
        actions: [],
        characters: [],
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
        await getRemoteAssetURL(scenarioPath, undefined, "minio", region),
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
          body: FirstBgm,
          delay: 0,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          resource: await getRemoteAssetURL(
            `scenario/background/${FirstBackground}_rip/${FirstBackground}.webp`,
            undefined,
            "minio"
          ),
          seType: "ChangeBackground",
          type: SnippetAction.SpecialEffect,
        });
      }
      if (FirstBgm) {
        ret.actions.push({
          bgm: await getRemoteAssetURL(
            `sound/scenario/bgm/${FirstBgm}_rip/${FirstBgm}.mp3`,
            undefined,
            "minio"
          ),
          delay: 0,
          hasBgm: true,
          hasSe: false,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          playMode: SoundPlayMode[0],
          se: "",
          type: SnippetAction.Sound,
        });
      }

      // eslint-disable-next-line array-callback-return
      ret.characters = AppearCharacters.map((ap) => {
        const chara2d = chara2Ds.find((ch) => ch.id === ap.Character2dId);
        if (!chara2d)
          return {
            id: ap.Character2dId,
            name: ap.CostumeType,
          };
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
              name:
                mobCharas.find((mc) => mc.id === chara2d.characterId)?.name ||
                "",
            };
          }
        }
      });

      for (const snippet of Snippets) {
        let action: { [key: string]: any } = {};
        switch (snippet.Action) {
          case SnippetAction.Talk:
            {
              const talkData = TalkData[snippet.ReferenceIndex];
              // try get character
              const chara = { id: 0, name: "" };
              if (talkData.TalkCharacters[0].Character2dId) {
                const chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
                chara.id = chara2d.characterId;
              }
              chara.name = talkData.WindowDisplayName;
              let voiceUrl = talkData.Voices.length
                ? `sound/${isCardStory ? "card_" : ""}${
                    isActionSet ? "actionset" : "scenario"
                  }/voice/${ScenarioId}_rip/${talkData.Voices[0].VoiceId}.mp3`
                : "";

              if (
                talkData.Voices.length &&
                talkData.Voices[0].VoiceId.startsWith("partvoice") &&
                !isActionSet
              ) {
                const chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                );
                if (chara2d) {
                  voiceUrl = `sound/scenario/part_voice/${chara2d.assetName}_${chara2d.unit}_rip/${talkData.Voices[0].VoiceId}.mp3`;
                } else {
                  voiceUrl = "";
                }
              }

              action = {
                body: talkData.Body,
                chara,
                delay: snippet.Delay,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                type: snippet.Action,
                voice: talkData.Voices.length
                  ? await getRemoteAssetURL(voiceUrl, undefined, "minio")
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
                body: specialEffect.StringVal,
                delay: snippet.Delay,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                resource:
                  specialEffectType === "FullScreenText"
                    ? await getRemoteAssetURL(
                        `sound/scenario/voice/${ScenarioId}_rip/${specialEffect.StringValSub}.mp3`,
                        undefined,
                        "minio"
                      )
                    : specialEffectType === "ChangeBackground"
                    ? await getRemoteAssetURL(
                        `scenario/background/${specialEffect.StringValSub}_rip/${specialEffect.StringValSub}.webp`,
                        undefined,
                        "minio"
                      )
                    : specialEffectType === "Movie"
                    ? `scenario/movie/${specialEffect.StringVal}_rip`
                    : "",
                seType: specialEffectType,
                type: snippet.Action,
              };
            }
            break;
          case SnippetAction.Sound:
            {
              const soundData = SoundData[snippet.ReferenceIndex];

              action = {
                bgm: soundData.Bgm
                  ? await getRemoteAssetURL(
                      `sound/scenario/bgm/${soundData.Bgm}_rip/${soundData.Bgm}.mp3`,
                      undefined,
                      "minio"
                    )
                  : "",
                delay: snippet.Delay,
                hasBgm: !!soundData.Bgm,
                hasSe: !!soundData.Se,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                playMode: SoundPlayMode[soundData.PlayMode],
                se: soundData.Se
                  ? await getRemoteAssetURL(
                      `sound/scenario/se/se_pack00001_rip/${soundData.Se}.mp3`,
                      undefined,
                      "minio"
                    )
                  : "",
                type: snippet.Action,
              };
            }
            break;
          default: {
            action = {
              delay: snippet.Delay,
              isWait:
                snippet.ProgressBehavior ===
                SnippetProgressBehavior.WaitUnitilFinished,
              type: snippet.Action,
            };
          }
        }

        ret.actions.push(action);
      }

      return ret;
    },
    [chara2Ds, getCharaName, mobCharas, region]
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
      // console.log(key, error);
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
    const showMessage: (type: VariantType) => typeof snackbar.enqueueSnackbar =
      (type: VariantType) => (message, options) =>
        snackbar.enqueueSnackbar(
          message,
          Object.assign({}, options, {
            variant: type,
          })
        );
    return {
      ...snackbar,
      showError: showMessage("error"),
      showInfo: showMessage("info"),
      showMessage: showMessage("default"),
      showSuccess: showMessage("success"),
      showWarning: showMessage("warning"),
    };
  }, [snackbar]);
}

export const realityAreaWorldmap: { [key: string]: number } = {
  1: 3,
  2: 1,
  3: 4,
  4: 5,
  5: 2,
  6: 7,
  7: 6,
};

export function useSkillMapping() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      //skills.json
      {
        descriptionSpriteName: "score_up",
        // name: "スコアＵＰ",
        name: t("filter:skill.score_up"),
      },
      {
        descriptionSpriteName: "judgment_up",
        // name: "判定強化＆スコアＵＰ",
        name: t("filter:skill.judgment_up"),
      },
      {
        descriptionSpriteName: "life_recovery",
        // name: "ライフ回復＆スコアＵＰ",
        name: t("filter:skill.life_recovery"),
      },
      {
        descriptionSpriteName: "perfect_score_up",
        // name: "PERFECTのときのみスコアＵＰ",
        name: t("filter:skill.perfect_score_up"),
      },
      {
        descriptionSpriteName: "life_score_up",
        // name: "発動時ライフがOO未満ならスコアUP",
        name: t("filter:skill.life_score_up"),
      },
    ],
    [t]
  );
}

export function sortWithIndices(toSort: (string | number)[]) {
  const tmp: [string | number, number][] = [];
  for (let i = 0; i < toSort.length; i++) {
    tmp.push([toSort[i], i]);
  }
  tmp.sort(function (left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  const sortIndices: number[] = [];
  for (let j = 0; j < toSort.length; j++) {
    sortIndices.push(tmp[j][1]);
  }
  return sortIndices;
}

export function apiUserInfoToStoreUserInfo(userInfo: UserModel): IUserInfo {
  return {
    avatarUrl: userInfo.avatarUrl,
    blocked: userInfo.blocked || false,
    confirmed: userInfo.confirmed,
    email: userInfo.email,
    id: userInfo.id,
    provider: userInfo.provider,
    role: userInfo.role.type,
    username: userInfo.username,
  };
}

export const specialTrainingRarityTypes = ["rarity_3", "rarity_4"];
export const cardRarityTypeToRarity: {
  [key: string]: number;
} = {
  rarity_1: 1,
  rarity_2: 2,
  rarity_3: 3,
  rarity_4: 4,
  rarity_birthday: 0,
};

export function useCardType(card?: ICardInfo) {
  const isBirthdayCard = useMemo(
    () => card?.cardRarityType === "rarity_birthday",
    [card?.cardRarityType]
  );
  const isTrainableCard = useMemo(
    () =>
      card?.cardRarityType
        ? specialTrainingRarityTypes.includes(card.cardRarityType)
        : false,
    [card?.cardRarityType]
  );

  return { isBirthdayCard, isTrainableCard };
}

export async function getGachaRemoteImages(
  gachaAssetbundleName: string,
  region: ServerRegion
) {
  const baseURL = assetUrl.minio[region];
  const result = (
    await Axios.get<string>(`/`, {
      baseURL,
      params: {
        delimiter: "/",
        "list-type": "2",
        "max-keys": "500",
        prefix: `gacha/${gachaAssetbundleName}/screen_rip/texture/`,
      },
      responseType: "text",
    })
  ).data;

  const parser = new XMLParser({
    isArray: (name) => {
      if (["CommonPrefixes", "Contents"].includes(name)) return true;
      return false;
    },
  });
  const parsed = parser.parse(result).ListBucketResult as IListBucketResult;
  // console.log(parsed);

  const filenames = parsed
    .Contents!.map((content) => content.Key)
    .filter((elem) => elem.endsWith(".webp"));
  // console.log(filenames);

  return {
    bg: filenames.filter((name) => name.includes("bg_gacha")),
    card: filenames.filter((name) => name.includes("card_gacha")),
    cardname: filenames.filter((name) => name.includes("cardname_gacha")),
    img: filenames.filter((name) => name.includes("img_gacha")),
  };
}
