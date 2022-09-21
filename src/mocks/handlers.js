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
          id: 1,
          username: "user",
          email: "user@sekai.best",
          provider: "local",
          confirmed: true,
          blocked: false,
          role: { name: "Admin", description: "", type: "admin" },
          userMetadatum: {
            id: 1,
            avatar: null,
            nickname: "Mock User",
            languages: [
              {
                id: 1,
                code: "en",
                name: "English",
                enabled: true,
              },
            ],
          },
          avatarUrl: "",
        },
      })
    );
  }),
  rest.get("/strapi/languages", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          code: "en",
          name: "English",
          enabled: true,
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
        id: 1,
        username: "user",
        email: "user@sekai.best",
        provider: "local",
        confirmed: true,
        blocked: false,
        role: { name: "Admin", description: "", type: "admin" },
        avatarUrl: "",
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
        id: 1,
        avatar: null,
        nickname: "Mock User",
        languages: [
          {
            id: 1,
            code: "en",
            name: "English",
            enabled: true,
          },
        ],
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
        id: 1,
        sekaiUserId: "123456789",
        sekaiUserProfile: sekaiUserProfileJson,
        sekaiUserToken: null,
        updateAvailable: 3,
        updateUsed: 0,
        eventGetAvailable: 10,
        eventGetUsed: 0,
        eventHistorySync: false,
        dailySyncEnabled: false,
        region: "jp",
        cardList: [],
        deckList: [],
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
        id: 1,
        region: "jp",
        cards: [],
        decks: [],
        maxNumOfDecks: 5,
      })
    );
  }),
];
