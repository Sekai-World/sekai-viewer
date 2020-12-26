import { IUserProfile } from "./types.d";

export interface LanguageModel {
  id: number;
  code: string;
  name: string;
  enabled: boolean;
}

export interface UserRoleModel {
  name: string;
  description: string;
  type: string;
}

export interface UserMetadatumModel {
  id: number;
  avatar: {
    url: string;
  };
  nickname: string;
  languages: LanguageModel;
}

export interface UserModel {
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: UserRoleModel;
  userMetadatum: UserMetadatumModel;
}
export interface LoginValues {
  identifier: string;
  password: string;
}

export interface LoginLocalApiReturn {
  user: UserModel;
  jwt: string;
}

export interface RegisterValues {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  languages: number[];
}

export interface SekaiProfileModel {
  id: number;
  user: UserModel;
  sekaiUserId: string | null;
  sekaiUserProfile: IUserProfile | null;
  sekaiUserToken: string | null;
  updateAvailable: number;
  updateUsed: number;
  eventGetAvailable: number;
  eventGetUsed: number;
  eventHistorySync: boolean;
  dailySyncEnabled: boolean;
}
