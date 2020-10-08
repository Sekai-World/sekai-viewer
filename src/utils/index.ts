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
  IMusicTagInfo, IReleaseCondition, IMusicDanceMembers
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

export const musicCategoryToName: { [key: string]: string } = {
  mv: "3D MV",
  original: "Original MV",
  sekai: "Sekai MV",
  image: "Static Image",
  mv_2d: "2D MV"
};

export const musicTagToName: { [key: string]: string } = {
  all: "All",
  vocaloid: "Vocaloid",
  light_music_club: "Light Music Club",
  idol: "Idol",
  school_refusal: "School Refusal",
  theme_park: "Theme Park",
  street: "Street"
}
