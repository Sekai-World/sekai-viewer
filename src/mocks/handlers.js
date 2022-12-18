import { rest } from "msw";

import sekaiUserProfileJson from "./data/sampleSekaiProfile.json";

export const handlers = [
  rest.post("/strapi/auth/local", (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem("is-authenticated", "true");

    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  rest.get("/strapi/languages", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          code: "en",
          enabled: true,
          id: 1,
          name: "English",
        },
      ])
    );
  }),
  rest.get("/strapi/users/me", (req, res, ctx) => {
    // Check if the user is authenticated in this session
    const isAuthenticated = sessionStorage.getItem("is-authenticated");

    if (!isAuthenticated) {
      // If not authenticated, respond with a 403 error
      return res(
        ctx.status(403),
        ctx.json({
          message: [
            {
              messages: [
                {
                  id: "Auth.error.unauthencated",
                },
              ],
            },
          ],
        })
      );
    }

    // If authenticated, return a mocked user details
    return res(
      ctx.status(200),
      ctx.json({
        avatarUrl: "",
        blocked: false,
        confirmed: true,
        email: "user@sekai.best",
        id: 1,
        provider: "local",
        role: { description: "", name: "Admin", type: "admin" },
        username: "user",
      })
    );
  }),
  rest.get("/strapi/user-metadata/me", (req, res, ctx) => {
    // Check if the user is authenticated in this session
    const isAuthenticated = sessionStorage.getItem("is-authenticated");

    if (!isAuthenticated) {
      // If not authenticated, respond with a 403 error
      return res(
        ctx.status(403),
        ctx.json({
          message: [
            {
              messages: [
                {
                  id: "Auth.error.unauthencated",
                },
              ],
            },
          ],
        })
      );
    }

    // If authenticated, return a mocked user details
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),
  rest.get("/strapi/sekai-profiles/me", (req, res, ctx) => {
    const isAuthenticated = sessionStorage.getItem("is-authenticated");

    if (!isAuthenticated) {
      // If not authenticated, respond with a 403 error
      return res(
        ctx.status(403),
        ctx.json({
          message: [
            {
              messages: [
                {
                  id: "Auth.error.unauthencated",
                },
              ],
            },
          ],
        })
      );
    }

    // If authenticated, return a mocked user details
    return res(
      ctx.status(200),
      ctx.json({
        cardList: [],
        dailySyncEnabled: false,
        deckList: [],
        eventGetAvailable: 10,
        eventGetUsed: 0,
        eventHistorySync: false,
        id: 1,
        region: "jp",
        sekaiUserId: "123456789",
        sekaiUserProfile: sekaiUserProfileJson,
        sekaiUserToken: null,
        updateAvailable: 3,
        updateUsed: 0,
      })
    );
  }),
  rest.get("/strapi/sekai-card-teams/me", (req, res, ctx) => {
    const isAuthenticated = sessionStorage.getItem("is-authenticated");

    if (!isAuthenticated) {
      // If not authenticated, respond with a 403 error
      return res(
        ctx.status(403),
        ctx.json({
          message: [
            {
              messages: [
                {
                  id: "Auth.error.unauthencated",
                },
              ],
            },
          ],
        })
      );
    }

    // If authenticated, return a mocked user details
    return res(
      ctx.status(200),
      ctx.json({
        cards: [],
        decks: [],
        id: 1,
        maxNumOfDecks: 5,
        region: "jp",
      })
    );
  }),
];
