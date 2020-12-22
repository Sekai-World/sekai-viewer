import { useState } from "react";
import { useJwt } from "react-jwt";
import { UserModel } from "../types";

export default function useJwtAuth(): {
  decodedToken: any;
  isExpired: boolean;
  token: string;
  user: any;
} {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [user, setUser] = useState<UserModel>(
    JSON.parse(localStorage.getItem("userData") || "{}") as UserModel
  );

  return {
    ...useJwt(token),
    set token(token: string) {
      setToken(token);
      localStorage.setItem("authToken", token);
    },
    get token(): string {
      return token;
    },
    set user(userData: UserModel) {
      setUser(userData);
      localStorage.setItem("userData", JSON.stringify(userData));
    },
    get user(): UserModel {
      return user;
    },
  };
}
