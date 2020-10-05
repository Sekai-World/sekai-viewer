import Axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { GahcaRootObject, ICardInfo, ICharaProfile, IMusicInfo } from "../types";

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
    if (musicList.length) setGachas(gachaList);
    else
      fetchGachas().then((fgachas) => {
        setGachas(fgachas.sort((a, b) => a.id - b.id));
        gachaList = fgachas;
      });
  }, [fetchGachas, setGachas]);

  return [gachas, gachasRef];
}
