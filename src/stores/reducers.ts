import { ITeamBuild } from "../types";

export function characterSelectReducer(
  state: number[],
  action: { type: "add" | "remove" | "reset"; payload: number }
) {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
    case "reset":
      return [];
    default:
      throw new Error();
  }
}

export function attrSelectReducer(
  state: string[],
  action: { type: "add" | "remove" | "reset"; payload: string }
) {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
    case "reset":
      return [];
    default:
      throw new Error();
  }
}

export function missionTypeReducer(
  state: string[],
  action: { type: "add" | "remove" | "reset"; payload: string }
) {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
    case "reset":
      return [];
    default:
      throw new Error();
  }
}

export function teamBuildReducer(
  state: ITeamBuild[],
  action:
    | { type: "add"; payload: ITeamBuild }
    | { type: "remove"; payload: number }
    | { type: "replace"; payload: { id: number; data: ITeamBuild } }
) {
  switch (action.type) {
    case "add": {
      const teams = [...state, action.payload];
      localStorage.setItem("team-build-array", JSON.stringify(teams));
      return teams;
    }
    case "remove": {
      const teams = [
        ...state.slice(0, action.payload),
        ...state.slice(action.payload + 1),
      ];
      localStorage.setItem("team-build-array", JSON.stringify(teams));
      return teams;
    }
    case "replace": {
      const teams = [
        ...state.slice(0, action.payload.id),
        action.payload.data,
        ...state.slice(action.payload.id + 1),
      ];
      localStorage.setItem("team-build-array", JSON.stringify(teams));
      return teams;
    }
    default:
      throw new Error();
  }
}
