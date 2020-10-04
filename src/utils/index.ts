import { useEffect, useRef, useState } from "react";

export function useRefState<S>(initialValue: S): [S, React.MutableRefObject<S>, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
};
