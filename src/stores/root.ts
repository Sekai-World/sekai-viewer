import { types, Instance, onSnapshot } from "mobx-state-tree";
// import makeInspectable from "mobx-devtools-mst";
import { createContext, useContext } from "react";
import { ISekaiProfileMap, SekaiProfileMap } from "./sekai";
import { IUser, User } from "./user";
import { ISettings, Settings } from "./setting";
import { decodeToken } from "react-jwt";

const Root = types
  .model({
    sekai: SekaiProfileMap,
    settings: Settings,
    user: User,
  })
  .views((self) => ({
    get decodedToken() {
      return decodeToken(self.user.token);
    },
    get jwtToken() {
      return self.user.token;
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
    setJwtToken(newToken: string) {
      self.user.setToken(newToken);
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
  sekai: SekaiProfileMap.is(sekaiJson)
    ? sekaiJson!
    : {
        isFetchingSekaiCardTeam: false,

        isFetchingSekaiProfile: false,

        //@ts-ignore
        sekaiCardTeamMap: {},

        //@ts-ignore
        sekaiProfileMap: {},
      },

  //@ts-ignore
  settings: Settings.is(settingsJson)
    ? settingsJson!
    : {
        contentTransMode: "both",
        displayMode: "auto",
        isShowSpoiler: false,
        lang: "",
        languages: [],
        region: "jp",
      },

  //@ts-ignore
  user: User.is(userJson)
    ? userJson!
    : {
        metadata: null,
        token: localStorage.getItem("authToken") || "",
        userinfo: null,
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
// makeInspectable(rootStore);

const RootStoreContext = createContext<null | IRoot>(null);
export const RootStoreProvider = RootStoreContext.Provider;

export function useRootStore() {
  const store = useContext(RootStoreContext);
  if (!store)
    throw new Error("Please add root store context provider before using it");

  return store;
}
