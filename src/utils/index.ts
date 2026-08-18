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
  IUnitProfile,
  IUnitStory,
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
  ICostume2D,
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
  IMusicOriginal,
  IIngameCutinCharacters,
  ISkillPracticeTicket,
  IBoostItem,
  ICompactCostume3DModel,
  ICompactCostume3D,
  IAnother3dmvCutIn,
  IWorldBloom,
  IWorldBloomChapterRankingRewardRange,
  IEventStoryUnit,
  IMysekaiFixtureInfo,
  IMysekaiMaterial,
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
  IMysekaiBlueprint,
  IMysekaiBlueprintMaterialCost,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
  IMysekaiTalk,
  IMysekaiGameCharacterUnitGroups,
  ICardSupply,
  ICardSupplyGroup,
} from "./../types.d";
import { useAssetI18n } from "./i18n";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { useSnackbar, VariantType } from "notistack";
import { useTranslation } from "react-i18next";
import { assetUrl, masterUrl } from "./urls";
import { UserModel } from "../strapi-model";
import { IUserInfo } from "../stores/user";
import { useRootStore } from "../stores/root";
import { XMLParser } from "fast-xml-parser";

type Live2DRequest<T> = () => Promise<T>;

const LIVE2D_MAX_CONCURRENCY = 4;
const LIVE2D_REQUEST_INTERVAL_MS = 1000 / 12;
const LIVE2D_MAX_RETRIES = 4;

class Live2DRequestScheduler {
  private active = 0;
  private lastStart = 0;
  private timer?: number;
  private readonly pending: Array<{
    request: Live2DRequest<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  schedule<T>(request: Live2DRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.pending.push({
        request,
        resolve: (value) => resolve(value as T),
        reject,
      });
      this.pump();
    });
  }

  private pump() {
    if (
      this.active >= LIVE2D_MAX_CONCURRENCY ||
      this.pending.length === 0 ||
      this.timer
    ) {
      return;
    }

    const wait = Math.max(
      0,
      LIVE2D_REQUEST_INTERVAL_MS - (Date.now() - this.lastStart)
    );
    if (wait > 0) {
      this.timer = window.setTimeout(() => {
        this.timer = undefined;
        this.pump();
      }, wait);
      return;
    }

    const next = this.pending.shift()!;
    this.active++;
    this.lastStart = Date.now();
    const finish = () => {
      this.active--;
      this.pump();
    };
    Promise.resolve()
      .then(next.request)
      .then(next.resolve, next.reject)
      .then(finish, finish);
    this.pump();
  }
}

const live2DRequestScheduler = new Live2DRequestScheduler();

/**
 * Determines whether an error represents an HTTP rate-limit response.
 *
 * @param error - The value to inspect
 * @returns `true` if the error has HTTP status 429, `false` otherwise.
 */
function isRateLimited(error: unknown) {
  return (
    (Axios.isAxiosError(error) && error.response?.status === 429) ||
    (error instanceof Response && error.status === 429)
  );
}

export class Live2DRateLimitError extends Error {
  constructor(public readonly response: unknown) {
    super("Live2D request rate limited after retries");
    this.name = "Live2DRateLimitError";
  }
}

/**
 * Identifies errors raised after Live2D rate-limit retries are exhausted.
 *
 * @param error - The value to inspect
 * @returns `true` if the error is a `Live2DRateLimitError`, `false` otherwise.
 */
export function isLive2DRateLimitError(
  error: unknown
): error is Live2DRateLimitError {
  return error instanceof Live2DRateLimitError;
}

/**
 * Parses a server-provided retry delay from an Axios or fetch response error.
 *
 * @param error - The error containing a numeric or date-based `Retry-After` value
 * @returns The retry delay in milliseconds, capped at 30 seconds, or `undefined` when unavailable or invalid
 */
function getRetryAfter(error: unknown) {
  let retryAfter: unknown;
  if (Axios.isAxiosError(error)) {
    retryAfter = error.response?.headers?.["retry-after"];
  } else if (error instanceof Response) {
    retryAfter = error.headers.get("retry-after");
  } else {
    retryAfter = undefined;
  }
  if (Array.isArray(retryAfter)) retryAfter = retryAfter[0];
  if (typeof retryAfter !== "string" && typeof retryAfter !== "number") {
    return undefined;
  }

  const value = typeof retryAfter === "string" ? retryAfter.trim() : retryAfter;
  if (value === "") return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds))
    return Math.min(30000, Math.max(0, seconds * 1000));
  const date = typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isNaN(date)
    ? undefined
    : Math.min(30000, Math.max(0, date - Date.now()));
}

/**
 * Executes a Live2D request with bounded retries for rate-limited failures.
 *
 * @param request - The asynchronous Live2D request to execute
 * @returns The request result
 * @throws The original error when it is not rate-limit related
 * @throws `Live2DRateLimitError` when rate-limit retries are exhausted
 */
export async function live2dRequest<T>(request: Live2DRequest<T>): Promise<T> {
  for (let retry = 0; ; retry++) {
    try {
      return await live2DRequestScheduler.schedule(request);
    } catch (error) {
      if (!isRateLimited(error)) throw error;
      if (retry >= LIVE2D_MAX_RETRIES) throw new Live2DRateLimitError(error);
      const retryAfter = getRetryAfter(error);
      const backoff = Math.min(1000 * 2 ** retry, 8000);
      const deterministicJitter = (retry * 997) % 251;
      const delay = retryAfter ?? backoff + deterministicJitter;
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }
  }
}

/**
 * Fetches a Live2D asset while applying shared rate-limit handling.
 *
 * @param url - The resource URL
 * @param init - Optional fetch options
 * @returns The HTTP response
 */
export async function live2dFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  return live2dRequest(async () => {
    const response = await fetch(url, init);
    if (response.status === 429) throw response;
    return response;
  });
}

/**
 * Provides state, a synchronized mutable reference to its current value, and a state setter.
 *
 * @param initialValue - The initial state value
 * @returns The state value, mutable state reference, and state setter
 */
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
    | ICostume2D
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
    | IMusicOriginal
    | IIngameCutinCharacters
    | ISkillPracticeTicket
    | IBoostItem
    | IAnother3dmvCutIn
    | IWorldBloom
    | IWorldBloomChapterRankingRewardRange
    | IEventStoryUnit
    | IMysekaiFixtureInfo
    | IMysekaiMaterial
    | IMysekaiFixtureGenre
    | IMysekaiFixtureTag
    | IMysekaiBlueprint
    | IMysekaiBlueprintMaterialCost
    | IMysekaiTalkCondition
    | IMysekaiTalkConditionGroup
    | IMysekaiTalk
    | IMysekaiGameCharacterUnitGroups
    | ICardSupply
    | ICardSupplyGroup,
>(name: string): [T[] | undefined, boolean, unknown] {
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
  T extends
    | ICompactResourceBox
    | ICompactResourceBoxDetail
    | ICompactCostume3DModel
    | ICompactCostume3D,
>(name: string): [T | undefined, boolean, unknown] {
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

export function filterMusicMeta(
  metas: IMusicMeta[],
  musicDifficulties: IMusicDifficultyInfo[]
) {
  return metas.filter((meta) =>
    musicDifficulties.some(
      (music) =>
        music.musicId === meta.music_id &&
        music.musicDifficulty === meta.difficulty
    )
  );
}

/**
 * Adds play levels and note counts from music difficulty data to matching metadata entries.
 *
 * @param metas - Music metadata entries to enrich.
 * @param musicDifficulties - Difficulty data keyed by music ID and difficulty.
 * @returns Music metadata with matching play levels and note counts added.
 */
export function addDataToMusicMeta(
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
        note_count: music.totalNoteCount,
      };
    }
    return meta;
  });
}

/**
 * Builds a remote asset URL and optionally verifies that the asset is available.
 *
 * @param endpoint - The asset path.
 * @param setFunc - Optional callback invoked with the URL when it is available.
 * @param domainKey - The asset domain to use.
 * @param server - The server region or asset category hosting the asset.
 * @param verifyStatus - Whether to verify the asset before returning its URL.
 * @returns The asset URL when available, or an empty string otherwise.
 */

export async function getRemoteAssetURL(
  endpoint: string,
  setFunc?: CallableFunction,
  domainKey: AssetDomainKey = "minio",
  server: ServerRegion | "comic" | "musicChart" | "live2d" = "jp",
  verifyStatus: boolean = false
): Promise<string> {
  if (!endpoint) return "";
  // const isWebpSupported = Modernizr.webplossless;
  const url = `${assetUrl[domainKey][server]}/${endpoint}`;

  if (verifyStatus) {
    if (window.AssetTest) {
      // if in test mode, check asset list other than internet
      if (window.AssetTest.assetList!.includes(endpoint)) return url;
      else return "";
    }
    const headRequest = () =>
      Axios.head(url, {
        validateStatus: (status) =>
          status < 500 && (server !== "live2d" || status !== 429),
      });
    let headRes;
    try {
      headRes =
        server === "live2d"
          ? await live2dRequest(headRequest)
          : await headRequest();
    } catch (error) {
      if (server === "live2d" && isLive2DRateLimitError(error)) return "";
      throw error;
    }
    // console.log(headRes.status, url);
    if (headRes.status <= 400) {
      if (setFunc) setFunc(url);
      return url;
    }
    return "";
  } else {
    if (setFunc) setFunc(url);
    return url;
  }
}

// export async function getMovieUrl(stringVal: string) {
//   const buildDataUrl = await getRemoteAssetURL(
//     `scenario/movie/${stringVal}/moviebundlebuilddata.asset`,
//     undefined,
//     window.isChinaMainland
//   );
//   const buildData = (await Axios.get(buildDataUrl, { responseType: "json" }))
//     .data;
//   const fileName = buildData.movieBundleDatas[0].usmFileName
//     .replace(/(-\d{3})?\.usm\.bytes/, "")
//     .toLowerCase();
//   return getRemoteAssetURL(
//     `scenario/movie/${stringVal}/${fileName}.mp4`,
//     undefined,
//     window.isChinaMainland
//   );
// }

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
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Re-export the useIntersectionObserver hook
export { useIntersectionObserver } from "./useIntersectionObserver";

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

export function useCardSupplyTypeMapping() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        type: "normal",
        name: t("filter:card_supply.normal"),
      },
      {
        type: "birthday",
        name: t("filter:card_supply.birthday"),
      },
      {
        type: "term_limited",
        name: t("filter:card_supply.term_limited"),
      },
      {
        type: "colorful_festival_limited",
        name: t("filter:card_supply.colorful_festival_limited"),
      },
      {
        type: "bloom_festival_limited",
        name: t("filter:card_supply.bloom_festival_limited"),
      },
      {
        type: "unit_event_limited",
        name: t("filter:card_supply.unit_event_limited"),
      },
      {
        type: "collaboration_limited",
        name: t("filter:card_supply.collaboration_limited"),
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
  const isTrainedOnlyCard = useMemo(
    () => card?.initialSpecialTrainingStatus === "done" && isTrainableCard,
    [card?.initialSpecialTrainingStatus, isTrainableCard]
  );

  return { isBirthdayCard, isTrainableCard, isTrainedOnlyCard };
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
        prefix: `gacha/${gachaAssetbundleName}/screen/texture/`,
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

export async function getRemoteImageSize(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = url;
  });
}

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    function onResize() {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.maxTouchPoints > 0
      );
    }

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      setIsTouchDevice(false);
    };
  }, []);

  return isTouchDevice;
}
