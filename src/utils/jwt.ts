import { useJwt } from "react-jwt";

export default function useJwtAuth(): {
  decodedToken: any;
  isExpired: boolean;
  token: string;
  user: any;
} {
  const token = localStorage.getItem("authToken") || "";

  return {
    ...useJwt(token),
    set token(token: string) {
      localStorage.setItem("authToken", token);
    },
    get token() {
      return token;
    },
    set user(userData: any) {
      localStorage.setItem("userData", JSON.stringify(userData));
    },
    get user() {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    },
  };
}
