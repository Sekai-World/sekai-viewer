import { types, Instance } from "mobx-state-tree";

export const LanguageModel = types.model({
  id: types.number,
  code: types.string,
  name: types.string,
  enabled: types.boolean,
});
export interface ILanguageModel extends Instance<typeof LanguageModel> {}

export const UserAvatar = types.model({
  url: types.string,
});
export interface IUserAvatar extends Instance<typeof UserAvatar> {}

export const UserMetadata = types.model({
  id: types.number,
  avatar: types.maybeNull(UserAvatar),
  nickname: types.string,
  languages: types.array(LanguageModel),
});
export interface IUserMetadata extends Instance<typeof UserMetadata> {}

export const UserInfo = types.model({
  id: types.number,
  username: types.string,
  email: types.string,
  provider: types.string,
  confirmed: types.boolean,
  blocked: types.boolean,
  role: types.string,
  avatarUrl: types.maybe(types.string),
});
export interface IUserInfo extends Instance<typeof UserInfo> {}

export const User = types
  .model({
    token: types.optional(types.string, ""),
    userinfo: types.maybeNull(UserInfo),
    metadata: types.maybeNull(UserMetadata),
  })
  .actions((self) => ({
    setToken(newToken: string) {
      self.token = newToken;
    },
    setUserInfo(newUserInfo: IUserInfo) {
      self.userinfo = newUserInfo;
    },
    setMetadata(metadata: IUserMetadata) {
      self.metadata = metadata;
    },
    logout() {
      self.token = "";
      self.userinfo = null;
      self.metadata = null;
    },
  }));
export interface IUser extends Instance<typeof User> {}
