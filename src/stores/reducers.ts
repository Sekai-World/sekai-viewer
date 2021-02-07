import { ITeamBuild } from "../types";

export function characterSelectReducer(
  state: number[],
  action: { type: "add" | "remove" | "reset"; payload: number }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem("card-list-filter-charas", JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem("card-list-filter-charas", JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem("card-list-filter-charas", JSON.stringify([]));
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
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem("card-list-filter-attrs", JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem("card-list-filter-attrs", JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem("card-list-filter-attrs", JSON.stringify([]));
      return [];
    default:
      throw new Error();
  }
}

export function raritySelectReducer(
  state: number[],
  action: { type: "add" | "remove" | "reset"; payload: number }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem("card-list-filter-rarities", JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem("card-list-filter-rarities", JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem("card-list-filter-rarities", JSON.stringify([]));
      return [];
    default:
      throw new Error();
  }
}

export function skillSelectReducer(
  state: string[],
  action: { type: "add" | "remove" | "reset"; payload: string }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem("card-list-filter-skills", JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem("card-list-filter-skills", JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem("card-list-filter-skills", JSON.stringify([]));
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
  state: {
    teams: ITeamBuild[];
    localKey: string;
    storageLocation: "local" | "cloud";
  },
  action:
    | { type: "add"; payload: ITeamBuild }
    | { type: "remove"; payload: number }
    | { type: "replace"; payload: { id: number; data: ITeamBuild } }
    | {
        type: "reload";
        payload: { location: "local" | "cloud"; teams: ITeamBuild[] };
      }
) {
  switch (action.type) {
    case "add": {
      const teams = [...state.teams, action.payload];
      if (state.storageLocation === "local")
        localStorage.setItem(state.localKey, JSON.stringify(teams));
      return Object.assign({}, state, { teams });
    }
    case "remove": {
      const teams = [
        ...state.teams.slice(0, action.payload),
        ...state.teams.slice(action.payload + 1),
      ];
      if (state.storageLocation === "local")
        localStorage.setItem(state.localKey, JSON.stringify(teams));
      return Object.assign({}, state, { teams });
    }
    case "replace": {
      const teams = [
        ...state.teams.slice(0, action.payload.id),
        action.payload.data,
        ...state.teams.slice(action.payload.id + 1),
      ];
      if (state.storageLocation === "local")
        localStorage.setItem(state.localKey, JSON.stringify(teams));
      return Object.assign({}, state, { teams });
    }
    case "reload": {
      return Object.assign({}, state, {
        storageLocation: action.payload.location,
        teams: action.payload.teams,
      });
    }
    default:
      throw new Error();
  }
}
