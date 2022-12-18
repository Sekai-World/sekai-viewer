import { types, Instance } from "mobx-state-tree";

export const LanguageModel = types.model({
  code: types.string,
  enabled: types.boolean,
  id: types.number,
  name: types.string,
});
export interface ILanguageModel extends Instance<typeof LanguageModel> {}

export const UserAvatar = types.model({
  url: types.string,
});
export interface IUserAvatar extends Instance<typeof UserAvatar> {}

export const UserMetadata = types.model({
  avatar: types.maybeNull(UserAvatar),
  id: types.number,
  languages: types.array(LanguageModel),
  nickname: types.string,
});
export interface IUserMetadata extends Instance<typeof UserMetadata> {}

export const UserInfo = types.model({
  avatarUrl: types.maybe(types.string),
  blocked: types.boolean,
  confirmed: types.boolean,
  email: types.string,
  id: types.number,
  provider: types.string,
  role: types.string,
  username: types.string,
});
export interface IUserInfo extends Instance<typeof UserInfo> {}

export const User = types
  .model({
    metadata: types.maybeNull(UserMetadata),
    token: types.optional(types.string, ""),
    userinfo: types.maybeNull(UserInfo),
  })
  .actions((self) => ({
    logout() {
      self.token = "";
      self.userinfo = null;
      self.metadata = null;
    },
    setMetadata(metadata: IUserMetadata) {
      self.metadata = metadata;
    },
    setToken(newToken: string) {
      self.token = newToken;
    },
    setUserInfo(newUserInfo: IUserInfo) {
      self.userinfo = newUserInfo;
    },
  }));
export interface IUser extends Instance<typeof User> {}
