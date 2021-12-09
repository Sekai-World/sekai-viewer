import { types, Instance, onSnapshot } from "mobx-state-tree";
import makeInspectable from "mobx-devtools-mst";
import { createContext, useContext } from "react";
import { ISekaiProfileMap, SekaiProfileMap } from "./sekai";
import { IUser, User } from "./user";
import { ISettings, Settings } from "./setting";
import { decodeToken } from "react-jwt";

const Root = types
  .model({
    user: User,
    sekai: SekaiProfileMap,
    settings: Settings,
  })
  .views((self) => ({
    get jwtToken() {
      return self.user.token;
    },
    get decodedToken() {
      return decodeToken(self.user.token);
    },
    get region() {
      return self.settings.region;
    },
  }))
  .actions((self) => ({
    logout() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      self.user.logout();
      self.sekai.logout();
    },
  }));
export interface IRoot extends Instance<typeof Root> {}

const userJson = JSON.parse(
  localStorage.getItem("user") || "null"
) as IUser | null;
const sekaiJson = JSON.parse(
  localStorage.getItem("sekai") || "null"
) as ISekaiProfileMap | null;
const settingsJson = JSON.parse(
  localStorage.getItem("settings") || "null"
) as ISettings | null;

const initialState: IRoot = {
  //@ts-ignore
  user: User.is(userJson)
    ? userJson!
    : {
        token: localStorage.getItem("authToken") || "",
        userinfo: null,
        metadata: null,
      },
  //@ts-ignore
  sekai: SekaiProfileMap.is(sekaiJson)
    ? sekaiJson!
    : {
        //@ts-ignore
        sekaiProfileMap: {},
        isFetchingSekaiProfile: false,
        //@ts-ignore
        sekaiCardTeamMap: {},
        isFetchingSekaiCardTeam: false,
      },
  //@ts-ignore
  settings: Settings.is(settingsJson)
    ? settingsJson!
    : {
        lang: "",
        displayMode: "auto",
        contentTransMode: "both",
        languages: [],
        isShowSpoiler: false,
        region: "jp",
      },
};

//@ts-ignore
export const rootStore = Root.create(initialState);
onSnapshot(rootStore.user, (snapshot) => {
  localStorage.setItem("authToken", snapshot.token);
  localStorage.setItem("user", JSON.stringify(snapshot));
});
onSnapshot(rootStore.sekai, (snapshot) =>
  localStorage.setItem("sekai", JSON.stringify(snapshot))
);
onSnapshot(rootStore.settings, (snapshot) =>
  localStorage.setItem("settings", JSON.stringify(snapshot))
);
makeInspectable(rootStore);

const RootStoreContext = createContext<null | IRoot>(null);
export const RootStoreProvider = RootStoreContext.Provider;

export function useRootStore() {
  const store = useContext(RootStoreContext);
  if (!store)
    throw new Error("Please add root store context provider before using it");

  return store;
}
