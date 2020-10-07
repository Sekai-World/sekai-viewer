import Axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { GahcaRootObject, ICardInfo, ICharaProfile, IMusicInfo, ISkillInfo, ICardRarity, ICharacterRank, IMusicVocalInfo, IOutCharaProfile } from "../types";

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

let cardList: ICardInfo[] = [];

export function useCards(): [ICardInfo[], React.MutableRefObject<ICardInfo[]>] {
  const [cards, cardsRef, setCards] = useRefState<ICardInfo[]>([]);

  const fetchCards = useCallback(async () => {
    const { data: cards }: { data: ICardInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/cards.json"
    );
    return cards;
  }, []);

  useEffect(() => {
    if (cardList.length) setCards(cardList);
    else
    fetchCards().then((fcards) => {
      setCards(fcards.sort((a, b) => a.id - b.id));
      cardList = fcards;
    });
  }, [fetchCards, setCards]);

  return [cards, cardsRef];
}

let cardRaritieList: ICardRarity[] = [];

export function useCardRarities(): [ICardRarity[], React.MutableRefObject<ICardRarity[]>] {
  const [cardRarities, cardRaritiesRef, setCardRarities] = useRefState<ICardRarity[]>([]);

  const fetchCardRarities = useCallback(async () => {
    const { data: cardRarities }: { data: ICardRarity[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/cardRarities.json"
    );
    return cardRarities;
  }, []);

  useEffect(() => {
    if (cardRaritieList.length) setCardRarities(cardRaritieList);
    else
    fetchCardRarities().then((fcardRarities) => {
      setCardRarities(fcardRarities);
      cardRaritieList = fcardRarities;
    });
  }, [fetchCardRarities, setCardRarities]);

  return [cardRarities, cardRaritiesRef];
}

let charaList: ICharaProfile[] = [];

export function useCharas(): [
  ICharaProfile[],
  React.MutableRefObject<ICharaProfile[]>
] {
  const [charas, charasRef, setCharas] = useRefState<ICharaProfile[]>([]);

  const fetchCharas = useCallback(async () => {
    const { data: charas }: { data: ICharaProfile[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/gameCharacters.json"
    );
    return charas;
  }, []);

  useEffect(() => {
    if (charaList.length) setCharas(charaList);
    else
    fetchCharas().then((fcharas) => {
      setCharas(fcharas.sort((a, b) => a.id - b.id));
      charaList = fcharas
    });
  }, [fetchCharas, setCharas]);

  return [charas, charasRef];
}

let outCharaList: IOutCharaProfile[] = [];

export function useOutCharas(): [
  IOutCharaProfile[],
  React.MutableRefObject<IOutCharaProfile[]>
] {
  const [outCharas, outCharasRef, setOutCharas] = useRefState<IOutCharaProfile[]>([]);

  const fetchCharas = useCallback(async () => {
    const { data: outCharas }: { data: IOutCharaProfile[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/outsideCharacters.json"
    );
    return outCharas;
  }, []);

  useEffect(() => {
    if (outCharaList.length) setOutCharas(outCharaList);
    else
    fetchCharas().then((foutCharas) => {
      setOutCharas(foutCharas.sort((a, b) => a.id - b.id));
      outCharaList = foutCharas
    });
  }, [fetchCharas, setOutCharas]);

  return [outCharas, outCharasRef];
}

let charaRankList: ICharacterRank[] = [];

export function useCharaRanks(): [
  ICharacterRank[],
  React.MutableRefObject<ICharacterRank[]>
] {
  const [charaRanks, charaRanksRef, setCharaRanks] = useRefState<ICharacterRank[]>([]);

  const fetchCharaRanks = useCallback(async () => {
    const { data: charaRanks }: { data: ICharacterRank[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/characterRanks.json"
    );
    return charaRanks;
  }, []);

  useEffect(() => {
    if (charaRankList.length) setCharaRanks(charaRankList);
    else
    fetchCharaRanks().then((fcharaRanks) => {
      setCharaRanks(fcharaRanks.sort((a, b) => a.id - b.id));
      charaRankList = fcharaRanks
    });
  }, [fetchCharaRanks, setCharaRanks]);

  return [charaRanks, charaRanksRef];
}

let musicList: IMusicInfo[] = [];

export function useMusics(): [
  IMusicInfo[],
  React.MutableRefObject<IMusicInfo[]>
] {
  const [musics, musicsRef, setMusics] = useRefState<IMusicInfo[]>([]);

  const fetchMusics = useCallback(async () => {
    const { data: musics }: { data: IMusicInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/musics.json"
    );
    return musics;
  }, []);

  useEffect(() => {
    if (musicList.length) setMusics(musicList);
    else
      fetchMusics().then((fmusics) => {
        setMusics(fmusics.sort((a, b) => a.publishedAt - b.publishedAt));
        musicList = fmusics;
      });
  }, [fetchMusics, setMusics]);

  return [musics, musicsRef];
}


let musicVocalList: IMusicVocalInfo[] = [];

export function useMusicVocals(): [
  IMusicVocalInfo[],
  React.MutableRefObject<IMusicVocalInfo[]>
] {
  const [musicVocals, musicVocalsRef, setMusicVocals] = useRefState<IMusicVocalInfo[]>([]);

  const fetchMusicVocals = useCallback(async () => {
    const { data: musicVocals }: { data: IMusicVocalInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/musicVocals.json"
    );
    return musicVocals;
  }, []);

  useEffect(() => {
    if (musicVocalList.length) setMusicVocals(musicVocalList);
    else
      fetchMusicVocals().then((fmusicVocals) => {
        setMusicVocals(fmusicVocals.sort((a, b) => a.musicId - b.musicId));
        musicVocalList = fmusicVocals;
      });
  }, [fetchMusicVocals, setMusicVocals]);

  return [musicVocals, musicVocalsRef];
}
let gachaList: GahcaRootObject[] = [];

export function useGachas(): [GahcaRootObject[], React.MutableRefObject<GahcaRootObject[]>] {
  const [gachas, gachasRef, setGachas] = useRefState<GahcaRootObject[]>([]);

  const fetchGachas = useCallback(async () => {
    const { data: gachas }: { data: GahcaRootObject[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/gachas.json"
    );
    return gachas;
  }, []);

  useEffect(() => {
    if (gachaList.length) setGachas(gachaList);
    else
      fetchGachas().then((fgachas) => {
        setGachas(fgachas.sort((a, b) => a.id - b.id));
        gachaList = fgachas;
      });
  }, [fetchGachas, setGachas]);

  return [gachas, gachasRef];
}

let skillList: ISkillInfo[] = [];

export function useSkills(): [ISkillInfo[], React.MutableRefObject<ISkillInfo[]>] {
  const [skills, skillsRef, setSkills] = useRefState<ISkillInfo[]>([]);

  const fetchSkills = useCallback(async () => {
    const { data: skills }: { data: ISkillInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/skills.json"
    );
    return skills;
  }, []);

  useEffect(() => {
    if (skillList.length) setSkills(skillList);
    else
      fetchSkills().then((fskills) => {
        setSkills(fskills.sort((a, b) => a.id - b.id));
        skillList = fskills;
      });
  }, [fetchSkills, setSkills]);

  return [skills, skillsRef];
}
