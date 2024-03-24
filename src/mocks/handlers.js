import { http, passthrough, HttpResponse } from "msw";

import sekaiUserProfileJsonJP from "./data/sampleSekaiProfileJP.json";
import sekaiUserProfileJsonTW from "./data/sampleSekaiProfileTW.json";
import sekaiUserProfileJsonEN from "./data/sampleSekaiProfileEN.json";

const sekaiUserProfileJsonMap = {
  jp: sekaiUserProfileJsonJP,
  tw: sekaiUserProfileJsonTW,
  en: sekaiUserProfileJsonEN,
};

function checkIsAuthenticated(sessionStorage) {
  return sessionStorage.getItem("is-authenticated") === "true";
}

const getUnauthenticatedResponse = () =>
  HttpResponse.json(
    {
      message: [
        {
          messages: [
            {
              id: "Auth.error.unauthencated",
            },
          ],
        },
      ],
    },
    { status: 403 }
  );

export const handlers = [
  http.post("/strapi/auth/local", () => {
    // Persist user's authentication in the session
    sessionStorage.setItem("is-authenticated", "true");

    return HttpResponse.json({
      jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTZWthaSBWaWV3ZXIiLCJpYXQiOjE2NjM3NTg1OTcsImV4cCI6MTY5NTI5NDU5NywiYXVkIjoibG9jYWxob3N0OjUxNzMiLCJzdWIiOiJ1c2VyIiwiaWQiOiIxIn0._Jw0dGUTGVOX3VivZ7QoE8uKTj8Krzt57kp0X2jvFj4",
      refresh:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTZWthaSBWaWV3ZXIiLCJpYXQiOjE2NjM3NTg1OTcsImV4cCI6MTY5NTI5NDU5NywiYXVkIjoibG9jYWxob3N0OjUxNzMiLCJzdWIiOiIxIiwidGt2IjoiMSJ9.fuyFtp8Og5OGDcNKux51dNA-gM3ORG2tfJ1zS1wPuz4",
      user: {
        avatarUrl: "",
        blocked: false,
        confirmed: true,
        email: "user@sekai.best",
        id: 1,
        provider: "local",
        role: { description: "", name: "Admin", type: "admin" },
        userMetadatum: {
          avatar: null,
          id: 1,
          languages: [
            {
              code: "en",
              enabled: true,
              id: 1,
              name: "English",
            },
          ],
          nickname: "Mock User",
        },
        username: "user",
      },
    });
  }),
  http.get("/strapi/languages", () => {
    return HttpResponse.json([
      {
        code: "en",
        enabled: true,
        id: 1,
        name: "English",
      },
    ]);
  }),
  http.get("/strapi/users/me", () => {
    if (!checkIsAuthenticated(sessionStorage)) {
      return getUnauthenticatedResponse();
    }

    // If authenticated, return a mocked user details
    return HttpResponse.json({
      avatarUrl: "",
      blocked: false,
      confirmed: true,
      email: "user@sekai.best",
      id: 1,
      provider: "local",
      role: { description: "", name: "Admin", type: "admin" },
      username: "user",
    });
  }),
  http.get("/strapi/user-metadata/me", () => {
    if (!checkIsAuthenticated(sessionStorage)) {
      return getUnauthenticatedResponse();
    }

    // If authenticated, return a mocked user details
    return HttpResponse.json({
      avatar: null,
      id: 1,
      languages: [
        {
          code: "en",
          enabled: true,
          id: 1,
          name: "English",
        },
      ],
      nickname: "Mock User",
    });
  }),
  http.get("/strapi/sekai-profiles/me", ({ request: req }) => {
    if (!checkIsAuthenticated(sessionStorage)) {
      return getUnauthenticatedResponse();
    }

    // If authenticated, return a mocked user details
    return HttpResponse.json({
      cardList: [],
      dailySyncEnabled: false,
      deckList: [],
      eventGetAvailable: 10,
      eventGetUsed: 0,
      eventHistorySync: false,
      id: 1,
      region: req.headers.get("region"),
      sekaiUserId: "123456789",
      sekaiUserProfile:
        sekaiUserProfileJsonMap[req.headers.get("region")] ||
        sekaiUserProfileJsonJP,
      sekaiUserToken: null,
      updateAvailable: 3,
      updateUsed: 0,
    });
  }),
  http.get("/strapi/sekai-card-teams/me", () => {
    if (!checkIsAuthenticated(sessionStorage)) {
      return getUnauthenticatedResponse();
    }

    // If authenticated, return a mocked user details
    return HttpResponse.json({
      cards: [],
      decks: [],
      id: 1,
      maxNumOfDecks: 5,
      region: "jp",
    });
  }),
  http.put("/strapi/sekai-profiles/1/update", ({ request }) => {
    if (!checkIsAuthenticated(sessionStorage)) {
      return getUnauthenticatedResponse();
    }

    // If authenticated, return a mocked user details
    return HttpResponse.json({
      profile:
        sekaiUserProfileJsonMap[request.headers.get("region")] ||
        sekaiUserProfileJsonJP,
      status: "success",
    });
  }),
  http.get("/strapi/sekai-current-event*", () => {
    return passthrough();
  }),
];
