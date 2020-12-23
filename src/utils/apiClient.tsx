import Axios from "axios";
import {
  LoginLocalApiReturn,
  LoginValues,
  RegisterValues,
  UserMetadatumModel,
  UserModel,
} from "../types";

/**
 * Access Strapi endpoints.
 */
export function useStrapi(token?: string) {
  const axios = Axios.create({
    baseURL: process.env.REACT_APP_STRAPI_BASE,
  });

  axios.interceptors.request.use((req) => {
    token && (req.headers.authorization = `Bearer ${token}`);
    return req;
  });

  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      err.id = err.response.data.data[0].messages[0].id;
      throw err;
    }
  );

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
      searchString: string
    ): Promise<LoginLocalApiReturn> {
      return (
        await axios.get<LoginLocalApiReturn>(
          `/auth/${provider}/callback${searchString}`
        )
      ).data;
    },
    async getUserMe(token?: string): Promise<UserModel> {
      return (
        await axios.get<UserModel>(
          "/users/me",
          token
            ? {
                headers: { authorization: `Bearer ${token}` },
              }
            : {}
        )
      ).data;
    },
    async postUpload(formData: FormData) {
      return (
        await axios.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },
    async putUserMetadata(
      userMetaId: number,
      data: Partial<UserMetadatumModel>
    ): Promise<UserMetadatumModel> {
      return (
        await axios.put<UserMetadatumModel>(
          `/user-metadata/${userMetaId}`,
          data
        )
      ).data;
    },
    async postForgotPassword(email: string) {
      return (
        await axios.post(`/auth/forgot-password`, {
          email,
        })
      ).data;
    },
    async postResetPassword(
      code: string,
      password: string,
      passwordConfirmation: string
    ) {
      return (
        await axios.post(`/auth/reset-password`, {
          code,
          password,
          passwordConfirmation,
        })
      ).data;
    },
  };
}

/**
 * Access api.sekai.best endpoints.
 */
// export function useApi() {
//   const axios = Axios.create({
//     baseURL: process.env.REACT_APP_API_BACKEND_BASE,
//   });
// }
