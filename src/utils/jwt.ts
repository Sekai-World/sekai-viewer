// import { useState } from "react";
import { useJwt } from "react-jwt";
import { UserModel } from "../types";

export default function useJwtAuth(): {
  decodedToken: any;
  isExpired: boolean;
  token: string;
  user: any;
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
    set user(userData: UserModel) {
      localStorage.setItem("userData", JSON.stringify(userData));
    },
    get user(): UserModel {
      return JSON.parse(localStorage.getItem("userData") || "{}") as UserModel;
    },
  };
}
