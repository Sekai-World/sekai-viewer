import Axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IGachaInfo,
  ICardInfo,
  ICharaProfile,
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
  IEventRealtimeRank,
  IResourceBoxInfo,
  IHonorInfo,
  ICardEpisode,
  ContentTransModeType,
  ITipInfo,
} from "../types";
import { useAssetI18n } from "./i18n";

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

let masterDataCache: { [key: string]: any[] } = {};

export function useCachedData<
  T extends
    | IGachaInfo
    | ICardInfo
    | ICharaProfile
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
>(name: string): [T[], React.MutableRefObject<T[]>] {
  const [cached, cachedRef, setCached] = useRefState<T[]>([]);

  const fetchCached = useCallback(async () => {
    const { data }: { data: T[] } = await Axios.get(
      `https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/${name}.json`
    );
    return data;
  }, [name]);

  useEffect(() => {
    if (masterDataCache[name] && masterDataCache[name].length)
      setCached(masterDataCache[name]);
    else
      fetchCached().then((data) => {
        setCached(data);
        masterDataCache[name] = data;
      });
  }, [fetchCached, name, setCached]);

  return [cached, cachedRef];
}

export function useRealtimeEventData(
  eventId: number
): [
  () => Promise<IEventRealtimeRank>,
  IEventRealtimeRank,
  React.MutableRefObject<IEventRealtimeRank>
] {
  const [
    eventRealtimeData,
    eventRealtimeDataRef,
    setEventRealtimeData,
  ] = useRefState<IEventRealtimeRank>({
    time: 0,
    first10: [],
    rank20: [],
    rank30: [],
    rank40: [],
    rank50: [],
    rank100: [],
    rank200: [],
    rank300: [],
    rank400: [],
    rank500: [],
    rank1000: [],
    rank2000: [],
    rank3000: [],
    rank4000: [],
    rank5000: [],
    rank10000: [],
    rank20000: [],
    rank30000: [],
    rank40000: [],
    rank50000: [],
    rank100000: [],
  });

  const refreshData = useCallback(async () => {
    const { data }: { data: IEventRealtimeRank } = await Axios.get(
      `https://bitbucket.org/sekai-world/sekai-event-track/raw/main/event${eventId}.json?t=${Date.now()}`
    );

    setEventRealtimeData(data);
    return data;
  }, [eventId, setEventRealtimeData]);

  return [refreshData, eventRealtimeData, eventRealtimeDataRef];
}

export const musicCategoryToName: { [key: string]: string } = {
  mv: "3D MV",
  original: "Original MV",
  sekai: "Sekai MV",
  image: "Static Image",
  mv_2d: "2D MV",
};

export const musicTagToName: { [key: string]: string } = {
  all: "All",
  vocaloid: "Vocaloid",
  light_music_club: "Light Music Club",
  idol: "Idol",
  school_refusal: "School Refusal",
  theme_park: "Theme Park",
  street: "Street",
};

export function useCharaName(contentTransMode: ContentTransModeType) {
  const [charas] = useCachedData<ICharaProfile>("gameCharacters");
  const { assetT, assetI18n } = useAssetI18n();
  return useCallback(
    (charaId: number): string | undefined => {
      const chara = charas.find((chara) => chara.id === charaId);
      if (chara?.firstName) {
        switch (contentTransMode) {
          case "original":
            return `${chara.firstName} ${chara.givenName}`;
          case "translated":
            return ["zh-CN", "zh-TW", "ko", "ja"].includes(assetI18n.language)
              ? `${assetT(
                  `character_name:${charaId}.firstName`,
                  chara.firstName
                )} ${assetT(
                  `character_name:${charaId}.givenName`,
                  chara.givenName
                )}`
              : `${assetT(
                  `character_name:${charaId}.givenName`,
                  chara.givenName
                )} ${assetT(
                  `character_name:${charaId}.firstName`,
                  chara.firstName
                )}`;
        }
      }
      return chara?.givenName;
    },
    [assetI18n.language, assetT, charas, contentTransMode]
  );
}
