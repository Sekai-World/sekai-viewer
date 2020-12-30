import { UserMetadatumModel, UserModel } from "./../strapi-model.d";
// import { useState } from "react";
import { useJwt } from "react-jwt";

export default function useJwtAuth(): {
  decodedToken: any;
  isExpired: boolean;
  token: string;
  user: UserModel | null;
  usermeta: UserMetadatumModel | null;
} {
  return {
    decodedToken: useJwt(localStorage.getItem("authToken") || "").decodedToken,
    isExpired: useJwt(localStorage.getItem("authToken") || "").isExpired,
    set token(token: string) {
      localStorage.setItem("authToken", token);
    },
    get token(): string {
      return localStorage.getItem("authToken") || "";
    },
    set user(userData: UserModel | null) {
      localStorage.setItem("userData", JSON.stringify(userData));
    },
    get user(): UserModel | null {
      return JSON.parse(
        localStorage.getItem("userData") || "null"
      ) as UserModel | null;
    },
    set usermeta(userMetadatum: UserMetadatumModel | null) {
      localStorage.setItem("userMetaDatum", JSON.stringify(userMetadatum));
    },
    get usermeta(): UserMetadatumModel | null {
      return JSON.parse(
        localStorage.getItem("userMetaDatum") || "null"
      ) as UserMetadatumModel;
    },
  };
}
