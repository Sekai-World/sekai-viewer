import { CommentAbuseReason, CommentModel } from "./../strapi-model.d";
import Axios from "axios";
import { useCallback, useMemo } from "react";
import {
  AnnouncementModel,
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
        if (err.response.data.message)
          err.id = err.response.data.message[0].messages[0].id;
        else err.id = err.message;
        throw err;
      }
    );

    return axios;
  }, [token]);

  return {
    postLoginLocal: useCallback(
      async (values: LoginValues): Promise<LoginLocalApiReturn> =>
        (await axios.post<LoginLocalApiReturn>("/auth/local", values)).data,
      [axios]
    ),
    postRegisterLocal: useCallback(
      async (values: RegisterValues): Promise<LoginLocalApiReturn> =>
        (await axios.post<LoginLocalApiReturn>("/auth/local/register", values))
          .data,
      [axios]
    ),
    getRedirectConnectLoginUrl: useCallback(
      (service: string) =>
        `${axios.getUri({
          url: `${process.env.REACT_APP_STRAPI_BASE}/connect/${service}`,
        })}`,
      [axios]
    ),
    getConnectCallback: useCallback(
      async (
        provider: string,
        searchString: string
      ): Promise<LoginLocalApiReturn> =>
        (
          await axios.get<LoginLocalApiReturn>(
            `/auth/${provider}/callback${searchString}`
          )
        ).data,
      [axios]
    ),
    getUserMe: useCallback(
      async (token?: string): Promise<UserModel> =>
        (
          await axios.get<UserModel>(
            "/users/me",
            token
              ? {
                  headers: { authorization: `Bearer ${token}` },
                }
              : {}
          )
        ).data,
      [axios]
    ),
    postUpload: useCallback(
      async (formData: FormData, token?: string) =>
        (
          await axios.post("/upload", formData, {
            headers: Object.assign(
              {
                "Content-Type": "multipart/form-data",
              },
              token
                ? {
                    authorization: `Bearer ${token}`,
                  }
                : {}
            ),
          })
        ).data,
      [axios]
    ),
    putUserMetadataMe: useCallback(
      async (
        userMetaId: number,
        data: Partial<UserMetadatumModel>
      ): Promise<UserMetadatumModel> =>
        (await axios.put<UserMetadatumModel>("/user-metadata/me", data)).data,
      [axios]
    ),
    postForgotPassword: useCallback(
      async (email: string) =>
        (
          await axios.post(`/auth/forgot-password`, {
            email,
          })
        ).data,
      [axios]
    ),
    postResetPassword: useCallback(
      async (code: string, password: string, passwordConfirmation: string) =>
        (
          await axios.post(`/auth/reset-password`, {
            code,
            password,
            passwordConfirmation,
          })
        ).data,
      [axios]
    ),
    getSekaiProfileMe: useCallback(
      async (token?: string): Promise<SekaiProfileModel> =>
        (
          await axios.get<SekaiProfileModel>(
            "/sekai-profiles/me",
            token
              ? {
                  headers: { authorization: `Bearer ${token}` },
                }
              : {}
          )
        ).data,
      [axios]
    ),
    postSekaiProfileVerify: useCallback(
      async (
        userid: string
      ): Promise<{
        id: number;
        token: string;
      }> =>
        (
          await axios.post<{
            id: number;
            token: string;
          }>("/sekai-profiles/verify", {
            userid,
          })
        ).data,
      [axios]
    ),
    postSekaiProfileConfirm: useCallback(
      async (id: number, userid: string): Promise<{ profile: IUserProfile }> =>
        (
          await axios.post<{ profile: IUserProfile }>(
            `/sekai-profiles/${id}/confirm`,
            {
              userid,
            }
          )
        ).data,
      [axios]
    ),
    putSekaiProfileUpdate: useCallback(
      async (id: number): Promise<{ profile: IUserProfile }> =>
        (
          await axios.put<{ profile: IUserProfile }>(
            `/sekai-profiles/${id}/update`
          )
        ).data,
      [axios]
    ),
    getLanguages: useCallback(
      async (): Promise<LanguageModel[]> =>
        (await axios.get<LanguageModel[]>("/languages")).data,
      [axios]
    ),
    getUserMetadataMe: useCallback(
      async (token?: string): Promise<UserMetadatumModel> =>
        (
          await axios.get<UserMetadatumModel>(
            "/user-metadata/me",
            token
              ? {
                  headers: { authorization: `Bearer ${token}` },
                }
              : {}
          )
        ).data,
      [axios]
    ),
    getSekaiCurrentEvent: useCallback(
      async (): Promise<SekaiCurrentEventModel> =>
        (await axios.get<SekaiCurrentEventModel>("/sekai-current-event")).data,
      [axios]
    ),
    getSekaiProfileEventRecordMe: useCallback(
      async (eventId?: number): Promise<SekaiProfileEventRecordModel[]> =>
        (
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
        ).data,
      [axios]
    ),
    postSekaiProfileEventRecord: useCallback(
      async (eventId: number) =>
        (await axios.post("/sekai-profile-event-records/record", { eventId }))
          .data,
      [axios]
    ),
    getAnnouncements: useCallback(
      async () =>
        (
          await axios.get<AnnouncementModel[]>("/announcements?", {
            params: {
              _sort: "isPin:DESC,published_at:DESC",
            },
          })
        ).data,
      [axios]
    ),
    getAnnouncementById: useCallback(
      async (id: string) =>
        (await axios.get<AnnouncementModel>(`/announcements/${id}`)).data,
      [axios]
    ),
    getAnnouncementPage: useCallback(
      async (limit: number = 30, page: number = 0) =>
        (
          await axios.get<AnnouncementModel[]>("/announcements", {
            params: {
              _limit: limit,
              _start: page * limit,
              _sort: "isPin:DESC,published_at:DESC",
            },
          })
        ).data,
      [axios]
    ),
    getAnnouncementCount: useCallback(
      async () => Number((await axios.get("/announcements/count")).data),
      [axios]
    ),
    getComments: useCallback(
      async (contentType: string, id: string | number) =>
        (await axios.get(`/comments/${contentType}:${id}`)).data,
      [axios]
    ),
    postComment: useCallback(
      async (
        contentType: string,
        id: string | number,
        userId: number,
        content: string
      ) =>
        (
          await axios.post(`/comments/${contentType}:${id}`, {
            authorUser: userId,
            content,
            related: [
              {
                refId: id,
                ref: contentType,
                field: "comments",
              },
            ],
          })
        ).data,
      [axios]
    ),
    getUserInfo: useCallback(
      async (id: string | number) =>
        (await axios.get<UserModel>(`/users/${id}`)).data,
      [axios]
    ),
    patchCommentLike: useCallback(
      async (
        contentType: string,
        contentId: string | number,
        commentId: string | number
      ) =>
        (
          await axios.patch<CommentModel>(
            `/comments/${contentType}:${contentId}/comment/${commentId}/like`
          )
        ).data,
      [axios]
    ),
    postCommentAbuse: useCallback(
      async (
        contentType: string,
        contentId: string | number,
        commentId: string | number,
        reason: CommentAbuseReason,
        content: string
      ) =>
        (
          await axios.post(
            `/comments/${contentType}:${contentId}/comment/${commentId}/report-abuse`,
            {
              reason,
              content,
            }
          )
        ).data,
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
