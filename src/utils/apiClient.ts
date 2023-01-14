import {
  AvatarModel,
  CardModel,
  CommentAbuseReason,
  CommentModel,
  EventModel,
  MusicModel,
  PatronModel,
  SekaiCardTeamModel,
  TranslationModel,
  VirtualLiveModel,
} from "./../strapi-model.d";
import Axios from "axios";
import { useCallback, useMemo, useRef } from "react";
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
import {
  ITeamBuild,
  // ITeamCardState,
  IUserProfile,
  ServerRegion,
  // ServerRegion,
} from "../types";
import useSWR from "swr";
import { useRootStore } from "../stores/root";
import { ISekaiCardState } from "../stores/sekai";

/**
 * Access Strapi endpoints.
 */
export function useStrapi(token?: string, region?: ServerRegion) {
  const _token = useRef(token);
  const root = useRootStore();
  const axios = useMemo(() => {
    const axios = Axios.create({
      baseURL: import.meta.env.VITE_STRAPI_BASE,
      headers: {
        region: region || root.region || "",
      },
    });

    axios.interceptors.request.use((req) => {
      !!_token.current &&
        !!req.headers &&
        (req.headers.authorization = `Bearer ${_token.current}`);
      return req;
    });

    axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response.status === 401) {
          const originalRequest = err.config;
          // _token.current = "";
          const refreshToken = localStorage.getItem("refreshToken") || "";
          if (refreshToken) {
            let {
              data: { jwt, refresh },
            } = await Axios.post<{
              jwt: string;
              refresh: string;
            }>(
              "/auth/refresh",
              { renew: true, token: refreshToken },
              { baseURL: import.meta.env.VITE_STRAPI_BASE }
            );

            localStorage.setItem("refreshToken", refresh);
            localStorage.setItem("authToken", jwt);
            root.setJwtToken(jwt);
            _token.current = jwt;

            originalRequest.headers.authorization = `Bearer ${jwt}`;
            return Axios(originalRequest);
          } else {
            // delete all token
            _token.current = "";
            // localStorage.removeItem("authToken");
            // localStorage.removeItem("userData");
            // localStorage.removeItem("userMetaDatum");
            localStorage.removeItem("lastUserCheck");
            // localStorage.removeItem("refreshToken");
            // localStorage.removeItem("sekaiProfile");
            // localStorage.removeItem("sekaiCardTeam");
            root.logout();
          }
        } else if (err.response.data.message && err.response.status !== 500)
          err.id = err.response.data.message[0].messages[0].id;
        else if (err.response.status === 500) {
          err.id = err.response.data.error;
          err.message = err.response.data.message;
        } else err.id = err.message;

        throw err;
      }
    );

    return axios;
  }, [region, root]);

  return {
    deleteSekaiCards: useCallback(
      async (id: number, cardIds: number[]) => {
        await axios.delete(`/sekai-card-teams/${id}/cards`, {
          params: {
            cards: cardIds,
          },
        });
      },
      [axios]
    ),

    deleteSekaiDecks: useCallback(
      async (id: number, deckIds: number[]) => {
        await axios.delete(`/sekai-card-teams/${id}/decks`, {
          params: {
            decks: deckIds,
          },
        });
      },
      [axios]
    ),

    deleteSekaiProfileById: useCallback(
      async (profileId: number) =>
        (await axios.delete<{ status: string }>(`/sekai-profiles/${profileId}`))
          .data.status,
      [axios]
    ),

    getAnnouncementById: useCallback(
      async (id: string, params?: { [key: string]: any }) =>
        (await axios.get<AnnouncementModel>(`/announcements/${id}`, { params }))
          .data,
      [axios]
    ),

    getAnnouncementByLanguagesCount: useCallback(
      async (languages: number[]) =>
        Number(
          (
            await axios.get("/announcements/language/count", {
              params: { targetLangs: languages },
            })
          ).data
        ),
      [axios]
    ),

    getAnnouncementByLanguagesPage: useCallback(
      async (
        limit: number = 30,
        page: number = 0,
        languages: number[],
        params?: { [key: string]: any }
      ) =>
        (
          await axios.get<AnnouncementModel[]>("/announcements/language", {
            params: {
              _limit: limit,
              _sort: "isPin:DESC,published_at:DESC",
              _start: page * limit,
              targetLangs: languages,
              ...(params || {}),
            },
          })
        ).data,
      [axios]
    ),

    getAnnouncementCount: useCallback(
      async (params?: any) =>
        Number((await axios.get("/announcements/count", { params })).data),
      [axios]
    ),

    getAnnouncementPage: useCallback(
      async (
        limit: number = 30,
        page: number = 0,
        params?: { [key: string]: any }
      ) =>
        (
          await axios.get<AnnouncementModel[]>("/announcements", {
            params: {
              _limit: limit,
              _sort: "isPin:DESC,published_at:DESC",
              _start: page * limit,
              ...(params || {}),
            },
          })
        ).data,
      [axios]
    ),

    // putSekaiCardList: useCallback(
    //   async (id: number, cardList: ITeamCardState[]) =>
    //     (await axios.put(`/sekai-profiles/${id}/cardlist`, cardList)).data,
    //   [axios]
    // ),
    // deleteSekaiCardList: useCallback(
    //   async (id: number, cardIds: number[]) => {
    //     await axios.delete(`/sekai-profiles/${id}/cardlist`, {
    //       params: {
    //         cards: cardIds,
    //       },
    //     });
    //   },
    //   [axios]
    // ),
    // putSekaiDeckList: useCallback(
    //   async (id: number, deckList: ITeamBuild[]) =>
    //     (await axios.put(`/sekai-profiles/${id}/decklist`, deckList)).data,
    //   [axios]
    // ),
    // deleteSekaiDeckList: useCallback(
    //   async (id: number, deckIds: number[]) => {
    //     await axios.delete(`/sekai-profiles/${id}/decklist`, {
    //       params: {
    //         decks: deckIds,
    //       },
    //     });
    //   },
    //   [axios]
    // ),
    getAnnouncements: useCallback(
      async (params?: { [key: string]: any }) =>
        (
          await axios.get<AnnouncementModel[]>("/announcements?", {
            params: {
              _sort: "isPin:DESC,published_at:DESC",
              ...(params || {}),
            },
          })
        ).data,
      [axios]
    ),

    getCard: useCallback(
      async (cardId: number) =>
        (
          await axios.get<CardModel[]>("/cards", {
            params: { _limit: 1, cardId },
          })
        ).data[0],
      [axios]
    ),

    getComments: useCallback(
      async (contentType: string, id: string | number) =>
        (await axios.get(`/comments/${contentType}:${id}`)).data,
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

    getEvent: useCallback(
      async (eventId: number) =>
        (
          await axios.get<EventModel[]>("/events", {
            params: { _limit: 1, eventId },
          })
        ).data[0],
      [axios]
    ),

    getLanguages: useCallback(
      async (): Promise<LanguageModel[]> =>
        (await axios.get<LanguageModel[]>("/languages?_sort=id:ASC")).data,
      [axios]
    ),

    getMusic: useCallback(
      async (musicId: number) =>
        (
          await axios.get<MusicModel[]>("/musics", {
            params: { _limit: 1, musicId },
          })
        ).data[0],
      [axios]
    ),

    getRedirectConnectLoginUrl: useCallback(
      (service: string) =>
        `${axios.getUri({
          url: `${import.meta.env.VITE_STRAPI_BASE}/connect/${service}`,
        })}`,
      [axios]
    ),

    getRefreshToken: useCallback(
      async () =>
        (await axios.get<{ refresh: string }>("/auth/refreshToken")).data,
      [axios]
    ),

    getSekaiCardTeamMe: useCallback(
      async (): Promise<SekaiCardTeamModel> =>
        (await axios.get(`/sekai-card-teams/me`)).data,
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
              params: Object.assign(
                {
                  _limit: 1,
                  _sort: "created_at:DESC",
                },
                eventId
                  ? {
                      eventId,
                    }
                  : {}
              ),
            }
          )
        ).data,
      [axios]
    ),
    getSekaiProfileMe: useCallback(
      async (): Promise<SekaiProfileModel> =>
        (await axios.get<SekaiProfileModel>("/sekai-profiles/me")).data,
      [axios]
    ),
    getTranslationById: useCallback(
      async (id: number) =>
        (await axios.get<TranslationModel>(`/translations/${id}`)).data,
      [axios]
    ),
    getTranslationBySlug: useCallback(
      async (slug: string, type: "source" | "target", params?: any) =>
        (
          await axios.get<TranslationModel[]>(
            `/translations/slug/${type}/${slug}`,
            {
              params,
            }
          )
        ).data,
      [axios]
    ),
    getTranslationBySourceSlug: useCallback(
      async (sourceSlug: string) =>
        (
          await axios.get<TranslationModel[]>("/translations", {
            params: {
              sourceSlug,
            },
          })
        ).data[0],
      [axios]
    ),
    getTranslationCount: useCallback(
      async (params?: any) =>
        (await axios.get<number>("/translations/count", { params })).data,
      [axios]
    ),
    getTranslations: useCallback(
      async (page: number, limit: number, params?: { [key: string]: any }) =>
        (
          await axios.get<TranslationModel[]>("/translations", {
            params: {
              _limit: limit,
              _start: page * limit,
              ...(params || {}),
            },
          })
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
    getUserProfile: useCallback(
      async (id: string | number) =>
        (
          await axios.get<UserMetadatumModel>(
            `/user-metadata/profile/user/${id}`
          )
        ).data,
      [axios]
    ),
    getVirtualLive: useCallback(
      async (virtualLiveId: number) =>
        (
          await axios.get<VirtualLiveModel[]>("/virtual-lives", {
            params: { _limit: 1, virtualLiveId },
          })
        ).data[0],
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
    postComment: useCallback(
      async (
        contentType: string,
        id: string | number,
        userId: number,
        avatar: AvatarModel | null,
        content: string
      ) =>
        (
          await axios.post(`/comments/${contentType}:${id}`, {
            authorAvatar: avatar ? avatar.url : null,
            authorUser: userId,
            content,
            related: [
              {
                field: "comments",
                ref: contentType,
                refId: id,
              },
            ],
          })
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
              content,
              reason,
            }
          )
        ).data,
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
    postSekaiCardTeamMe: useCallback(
      async (cards: ISekaiCardState[], decks: ITeamBuild[]) =>
        (
          await axios.post(`/sekai-card-teams/me`, {
            cards,
            decks,
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
    postSekaiProfileEventRecord: useCallback(
      async (eventId: number) =>
        (await axios.post("/sekai-profile-event-records/record", { eventId }))
          .data,
      [axios]
    ),
    postSekaiProfileTransfer: useCallback(
      async (sekaiUserId: string, username: string) =>
        (
          await axios.post<{ status: string }>(`/sekai-profiles/transfer`, {
            sekaiUserId,
            username,
          })
        ).data.status,
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
    postTranslation: useCallback(
      async (
        user: UserMetadatumModel,
        sourceSlug: string,
        sourceLang: number,
        target: any,
        targetLang: number
      ) =>
        (
          await axios.post<TranslationModel>("/translations", {
            sourceLang,
            sourceSlug,
            target,
            targetLang,
            user: user.id,
          })
        ).data,
      [axios]
    ),
    postUpload: useCallback(
      async (formData: FormData, token?: string) =>
        (
          await axios.post("/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: token ? `Bearer ${token}` : "",
            },
          })
        ).data,
      [axios]
    ),
    putSekaiCards: useCallback(
      async (id: number, cards: ISekaiCardState[]) =>
        (await axios.put(`/sekai-card-teams/${id}/cards`, cards)).data,
      [axios]
    ),
    putSekaiDecks: useCallback(
      async (id: number, decks: ITeamBuild[]) =>
        (await axios.put(`/sekai-card-teams/${id}/decks`, decks)).data,
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
    putTranslationId: useCallback(
      async (
        id: number | string,
        body: { target?: any; targetLang?: number; isFin?: boolean }
      ) =>
        (await axios.put<TranslationModel>(`/translations/${id}`, body)).data,
      [axios]
    ),
    putUserMetadataMe: useCallback(
      async (
        data: Partial<UserMetadatumModel>
      ): Promise<UserMetadatumModel> => {
        return (
          await axios.put<UserMetadatumModel>(
            "/user-metadata/me",
            Object.assign(
              {},
              data,
              data.languages
                ? {
                    languages: data.languages.map((lang) => lang.id),
                  }
                : {}
            )
          )
        ).data;
      },
      [axios]
    ),
  };
}

export async function getLanguages() {
  return (
    await Axios.get<LanguageModel[]>(
      `${import.meta.env.VITE_STRAPI_BASE}/languages?_sort=id:ASC`
    )
  ).data;
}

const axiosFetcher = async (url: string, params?: any) =>
  (await Axios.get(url, { params })).data;

export function useRemoteLanguages() {
  const params = useMemo(() => ({ _sort: "id:ASC" }), []);
  const { data, error } = useSWR(
    [`${import.meta.env.VITE_STRAPI_BASE}/languages`, params],
    axiosFetcher
  );

  return {
    error,
    isLoading: !error && !data,
    languages: data as LanguageModel[],
  };
}

export function useAnnouncements(page = 0, limit = 0, params?: any) {
  const _params = useMemo(
    () => ({
      _limit: limit,
      _sort: "isPin:DESC,published_at:DESC",
      _start: page * limit,
      ...(params || {}),
    }),
    [limit, page, params]
  );
  const { data, error } = useSWR(
    [`${import.meta.env.VITE_STRAPI_BASE}/announcements`, _params],
    axiosFetcher
  );

  return {
    announcements: data as AnnouncementModel[],
    error,
    isLoading: !error && !data,
  };
}

export function useAnnouncementsByLanguages(
  page = 0,
  limit = 0,
  languages: number[],
  params?: any
) {
  const _params = useMemo(
    () => ({
      _limit: limit,
      _sort: "isPin:DESC,published_at:DESC",
      _start: page * limit,
      targetLangs: languages,
      ...(params || {}),
    }),
    [languages, limit, page, params]
  );
  const { data, error } = useSWR(
    [`${import.meta.env.VITE_STRAPI_BASE}/announcements/language`, _params],
    axiosFetcher
  );

  return {
    announcements: data as AnnouncementModel[],
    error,
    isLoading: !error && !data,
  };
}

export function useCurrentEvent() {
  const { region } = useRootStore();
  const { data, error } = useSWR(
    `${import.meta.env.VITE_STRAPI_BASE}/sekai-current-event${
      region === "jp" ? "" : `-${region}`
    }`,
    axiosFetcher
  );

  return {
    currEvent: data as SekaiCurrentEventModel,
    error,
    isLoading: !error && !data,
  };
}

export function useLive2dModelList() {
  const { data, error } = useSWR(
    `${import.meta.env.VITE_FRONTEND_ASSET_BASE}/models.json`,
    axiosFetcher
  );

  return {
    error,
    isLoading: !error && !data,
    modelList: data as string[] | undefined,
  };
}

export function usePatronList(tier?: string) {
  const _params = useMemo(
    () => ({
      tier,
    }),
    [tier]
  );
  const { data, error } = useSWR(
    [`${import.meta.env.VITE_STRAPI_BASE}/patrons`, _params],
    axiosFetcher
  );

  return {
    error,
    isLoading: !error && !data,
    patrons: data as PatronModel[],
  };
}

/**
 * Access api.sekai.best endpoints.
 */
// export function useApi() {
//   const axios = Axios.create({
//     baseURL: import.meta.env.VITE_API_BACKEND_BASE,
//   });
// }
