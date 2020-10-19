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
} from "../types";

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

  const refrershData = useCallback(async () => {
    const { data }: { data: IEventRealtimeRank } = await Axios.get(
      `https://raw.githubusercontent.com/Sekai-World/sekai-event-track/main/event${eventId}.json`
    );

    setEventRealtimeData(data);
    return data;
  }, [eventId, setEventRealtimeData]);

  return [refrershData, eventRealtimeData, eventRealtimeDataRef];
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
