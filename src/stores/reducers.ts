import { EventFilterData } from "../pages/event/EventListFilter";
import { ITeamBuild } from "../types";

// 通用数组操作reducer，支持基本类型数组的add、remove、reset操作
export function createArrayReducer<T>() {
  return function arrayReducer(
    state: T[],
    action: {
      type: "add" | "remove" | "reset";
      payload: T;
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
        const index = state.indexOf(action.payload);
        if (index === -1) return state;
        const data = [...state.slice(0, index), ...state.slice(index + 1)];
        localStorage.setItem(action.storeName, JSON.stringify(data));
        return data;
      }
      case "reset":
        localStorage.setItem(action.storeName, JSON.stringify([]));
        return [];
      default:
        throw new Error();
    }
  };
}

// 为向后兼容性保留的导出函数
export const characterSelectReducer = createArrayReducer<number>();
export const unitSelectReducer = createArrayReducer<string>();
export const attrSelectReducer = createArrayReducer<string>();
export const supportUnitSelectReducer = createArrayReducer<string>();

// 为对象数组操作创建通用reducer，支持自定义比较函数
export function createArrayReducerWithCompareFn<T>(
  compareFn: (item: T, target: T) => boolean
) {
  return function arrayReducer(
    state: T[],
    action: {
      type: "add" | "remove" | "reset";
      payload: T;
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
        const index = state.findIndex((item) =>
          compareFn(item, action.payload)
        );
        if (index === -1) return state;
        const data = [...state.slice(0, index), ...state.slice(index + 1)];
        localStorage.setItem(action.storeName, JSON.stringify(data));
        return data;
      }
      case "reset":
        localStorage.setItem(action.storeName, JSON.stringify([]));
        return [];
      default:
        throw new Error();
    }
  };
}

export const raritySelectReducer = createArrayReducerWithCompareFn<{
  rarity: number;
  cardRarityType: string;
}>((item, target) => item.rarity === target.rarity);

export const skillSelectReducer = createArrayReducer<string>();

export const missionTypeReducer = createArrayReducer<string>();

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

export function eventListFilterReducer(
  state: EventFilterData,
  action: { type: "update"; payload: EventFilterData }
) {
  switch (action.type) {
    case "update":
      const newState = { ...action.payload };
      localStorage.setItem("event-list-filter-data", JSON.stringify(newState));
      return newState;
    default:
      throw new Error();
  }
}

export function has3dmvCutInReducer(
  state: boolean,
  action: { type: "set"; payload: boolean }
) {
  switch (action.type) {
    case "set":
      localStorage.setItem(
        "card-list-filter-has-3dmv",
        JSON.stringify(action.payload)
      );
      return action.payload;
    default:
      throw new Error();
  }
}

export const cardSupplySelectReducer = createArrayReducer<number>();
