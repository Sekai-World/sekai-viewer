import Axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { ICardInfo } from "../types";

export function useRefState<S>(initialValue: S): [S, React.MutableRefObject<S>, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
};

export function useCards(): ICardInfo[] {
  const [cards, setCards] = useState<ICardInfo[]>([])

  const fetchCards = useCallback(async () => {
    const { data: cards }: { data: ICardInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/cards.json"
    );
    return cards;
  }, []);

  useEffect(() => {
    fetchCards().then((fcards) => {
      setCards(fcards.sort(
        (a, b) => a.id - b.id
      ));
    })
  }, [fetchCards]);

  return cards
}
