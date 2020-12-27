import Axios from "axios";
import { useCallback, useMemo } from "react";
import {
  LanguageModel,
  LoginLocalApiReturn,
  LoginValues,
  RegisterValues,
  SekaiCurrentEventModel,
  SekaiProfileEventRecordModel,
  SekaiProfileModel,
  UserMetadatumModel,
  UserModel,
} from "../strapi-model";
import { IUserProfile } from "../types";

/**
 * Access Strapi endpoints.
 */
export function useStrapi(token?: string) {
  const axios = useMemo(() => {
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
        err.id = err.response.data.message[0].messages[0].id;
        throw err;
      }
    );

    return axios;
  }, [token]);

  return {
    postLoginLocal: useCallback(
      async (values: LoginValues): Promise<LoginLocalApiReturn> => {
        return (await axios.post<LoginLocalApiReturn>("/auth/local", values))
          .data;
      },
      [axios]
    ),
    postRegisterLocal: useCallback(
      async (values: RegisterValues): Promise<LoginLocalApiReturn> => {
        return (
          await axios.post<LoginLocalApiReturn>("/auth/local/register", values)
        ).data;
      },
      [axios]
    ),
    getRedirectConnectLoginUrl: useCallback(
      (service: string) => {
        return `${axios.getUri({
          url: `${process.env.REACT_APP_STRAPI_BASE}/connect/${service}`,
        })}`;
      },
      [axios]
    ),
    getConnectCallback: useCallback(
      async (
        provider: string,
        searchString: string
      ): Promise<LoginLocalApiReturn> => {
        return (
          await axios.get<LoginLocalApiReturn>(
            `/auth/${provider}/callback${searchString}`
          )
        ).data;
      },
      [axios]
    ),
    getUserMe: useCallback(
      async (token?: string): Promise<UserModel> => {
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
      [axios]
    ),
    postUpload: useCallback(
      async (formData: FormData) => {
        return (
          await axios.post("/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        ).data;
      },
      [axios]
    ),
    putUserMetadataMe: useCallback(
      async (
        userMetaId: number,
        data: Partial<UserMetadatumModel>
      ): Promise<UserMetadatumModel> => {
        return (await axios.put<UserMetadatumModel>("/user-metadata/me", data))
          .data;
      },
      [axios]
    ),
    postForgotPassword: useCallback(
      async (email: string) => {
        return (
          await axios.post(`/auth/forgot-password`, {
            email,
          })
        ).data;
      },
      [axios]
    ),
    postResetPassword: useCallback(
      async (code: string, password: string, passwordConfirmation: string) => {
        return (
          await axios.post(`/auth/reset-password`, {
            code,
            password,
            passwordConfirmation,
          })
        ).data;
      },
      [axios]
    ),
    getSekaiProfileMe: useCallback(
      async (token?: string): Promise<SekaiProfileModel> => {
        return (
          await axios.get<SekaiProfileModel>(
            "/sekai-profiles/me",
            token
              ? {
                  headers: { authorization: `Bearer ${token}` },
                }
              : {}
          )
        ).data;
      },
      [axios]
    ),
    postSekaiProfileVerify: useCallback(
      async (
        userid: string
      ): Promise<{
        id: number;
        token: string;
      }> => {
        return (
          await axios.post<{
            id: number;
            token: string;
          }>("/sekai-profiles/verify", {
            userid,
          })
        ).data;
      },
      [axios]
    ),
    postSekaiProfileConfirm: useCallback(
      async (
        id: number,
        userid: string
      ): Promise<{ profile: IUserProfile }> => {
        return (
          await axios.post<{ profile: IUserProfile }>(
            `/sekai-profiles/${id}/confirm`,
            {
              userid,
            }
          )
        ).data;
      },
      [axios]
    ),
    putSekaiProfileUpdate: useCallback(
      async (id: number): Promise<{ profile: IUserProfile }> => {
        return (
          await axios.put<{ profile: IUserProfile }>(
            `/sekai-profiles/${id}/update`
          )
        ).data;
      },
      [axios]
    ),
    getLanguages: useCallback(async (): Promise<LanguageModel[]> => {
      return (await axios.get<LanguageModel[]>("/languages")).data;
    }, [axios]),
    getUserMetadataMe: useCallback(
      async (token?: string): Promise<UserMetadatumModel> => {
        return (
          await axios.get<UserMetadatumModel>(
            "/user-metadata/me",
            token
              ? {
                  headers: { authorization: `Bearer ${token}` },
                }
              : {}
          )
        ).data;
      },
      [axios]
    ),
    getSekaiCurrentEvent: useCallback(async (): Promise<
      SekaiCurrentEventModel
    > => {
      return (await axios.get<SekaiCurrentEventModel>("/sekai-current-event"))
        .data;
    }, [axios]),
    getSekaiProfileEventRecordMe: useCallback(
      async (eventId?: number): Promise<SekaiProfileEventRecordModel[]> => {
        return (
          await axios.get<SekaiProfileEventRecordModel[]>(
            "/sekai-profile-event-records/me",
            {
              params: eventId
                ? {
                    eventId,
                  }
                : {},
            }
          )
        ).data;
      },
      [axios]
    ),
    postSekaiProfileEventRecord: useCallback(
      async (eventId: number) => {
        return (
          await axios.post("/sekai-profile-event-records/record", { eventId })
        ).data;
      },
      [axios]
    ),
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
