import { ITeamBuild } from "../types";

export function characterSelectReducer(
  state: number[],
  action: {
    type: "add" | "remove" | "reset";
    payload: number;
    storeName: string;
  }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem(action.storeName, JSON.stringify([]));
      return [];
    default:
      throw new Error();
  }
}

export function unitSelectReducer(
  state: string[],
  action: {
    type: "add" | "remove" | "reset";
    payload: string;
    storeName: string;
  }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem(action.storeName, JSON.stringify([]));
      return [];
    default:
      throw new Error();
  }
}

export function attrSelectReducer(
  state: string[],
  action: {
    type: "add" | "remove" | "reset";
    payload: string;
    storeName: string;
  }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem(action.storeName, JSON.stringify([]));
      return [];
    default:
      throw new Error();
  }
}

export function supportUnitSelectReducer(
  state: string[],
  action: {
    type: "add" | "remove" | "reset";
    payload: string;
    storeName: string;
  }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem(action.storeName, JSON.stringify([]));
      return [];
    default:
      throw new Error();
  }
}

export function raritySelectReducer(
  state: { rarity: number; cardRarityType: string }[],
  action: {
    type: "add" | "remove" | "reset";
    payload: { rarity: number; cardRarityType: string };
    storeName: string;
  }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "remove": {
      // console.log(state, action.payload);
      const data = [
        ...state.slice(
          0,
          state.findIndex((s) => s.rarity === action.payload.rarity)
        ),
        ...state.slice(
          state.findIndex((s) => s.rarity === action.payload.rarity) + 1
        ),
      ];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem(action.storeName, JSON.stringify([]));
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
  action: {
    type: "add" | "remove" | "reset";
    payload: string;
    storeName: string;
  }
) {
  switch (action.type) {
    case "add": {
      const data = [...state, action.payload];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "remove": {
      const data = [
        ...state.slice(0, state.indexOf(action.payload)),
        ...state.slice(state.indexOf(action.payload) + 1),
      ];
      localStorage.setItem(action.storeName, JSON.stringify(data));
      return data;
    }
    case "reset":
      localStorage.setItem(action.storeName, JSON.stringify([]));
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
