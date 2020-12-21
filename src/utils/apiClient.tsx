import Axios from "axios";
import {
  LoginLocalApiReturn,
  LoginValues,
  RegisterValues,
  UserModel,
} from "../types";

/**
 * Access Strapi endpoints.
 */
export function useStrapi() {
  const axios = Axios.create({
    baseURL: process.env.REACT_APP_STRAPI_BASE,
  });

  return {
    async postLoginLocal(values: LoginValues): Promise<LoginLocalApiReturn> {
      return (await axios.post<LoginLocalApiReturn>("/auth/local", values))
        .data;
    },
    async postRegisterLocal(
      values: RegisterValues
    ): Promise<LoginLocalApiReturn> {
      return (
        await axios.post<LoginLocalApiReturn>("/auth/local/register", values)
      ).data;
    },
    getRedirectConnectLoginUrl(service: string) {
      return `${axios.getUri({
        url: `${process.env.REACT_APP_STRAPI_BASE}/connect/${service}`,
      })}`;
    },
    async getConnectCallback(
      provider: string,
      accessToken: string
    ): Promise<LoginLocalApiReturn> {
      return (
        await axios.get<LoginLocalApiReturn>(
          `/auth/${provider}/callback?access_token=${accessToken}`
        )
      ).data;
    },
    async getUserMe(token: string): Promise<UserModel> {
      return (
        await axios.get<UserModel>(`/users/me`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
      ).data;
    },
  };
}

/**
 * Access api.sekai.best endpoints.
 */
export function useApi() {
  const axios = Axios.create({
    baseURL: process.env.REACT_APP_API_BACKEND_BASE,
  });
}
