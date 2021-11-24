import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import TagManager from "react-gtm-module";

import App from "./pages/App";
// import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router } from "react-router-dom";
import "./modernizr-custom";
import { initGlobalI18n } from "./utils/i18n";
import "./index.css";
import { SettingProvider } from "./context";
import Axios from "axios";
import localforage from "localforage";
import {
  SekaiProfileModel,
  UserMetadatumModel,
  UserModel,
} from "./strapi-model";
import AppSkeleton from "./pages/AppSkeleton";
import { string } from "prop-types";

TagManager.initialize({
  gtmId: "GTM-NFC6SW2",
});

window.isChinaMainland = false;
(async () => {
  let country = await localforage.getItem<string>("country");
  if (!country) {
    country =
      (
        await Axios.get<{ data: { country: string } }>(
          `${import.meta.env.VITE_API_BACKEND_BASE}/country`
        )
      ).data.data.country || "unknown";
    localforage.setItem<string>("country", country);
  }

  window.isChinaMainland = country === "CN";
  await initGlobalI18n();

  ReactDOM.render(
    <React.StrictMode>
      <Router>
        <Suspense fallback={<AppSkeleton />}>
          <SettingProvider>
            <App />
          </SettingProvider>
        </Suspense>
      </Router>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();

// check user info
(async () => {
  const lastCheck = Number(localStorage.getItem("lastUserCheck") || "0");

  if (import.meta.env.DEV || new Date().getTime() - lastCheck > 3600 * 1000) {
    // recheck user info
    const userData = JSON.parse(
      localStorage.getItem("userData") || "null"
    ) as UserModel | null;
    const token = localStorage.getItem("authToken") || "";

    // test token
    if (userData && token) {
      const axios = Axios.create({
        baseURL: import.meta.env.VITE_STRAPI_BASE,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      axios.interceptors.response.use(
        (res) => res,
        async (err) => {
          const originalRequest = err.config;
          if (err.response.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem("refreshToken") || "";
            if (refreshToken) {
              let {
                data: { jwt, refresh },
              } = await Axios.post<{
                jwt: string;
                refresh: string;
              }>(
                "/auth/refresh",
                { token: refreshToken, renew: true },
                {
                  baseURL: import.meta.env.VITE_STRAPI_BASE,
                }
              );

              localStorage.setItem("refreshToken", refresh);
              localStorage.setItem("authToken", jwt);

              originalRequest.headers.authorization = `Bearer ${jwt}`;
              return Axios(originalRequest);
            } else {
              // delete all token
              // localStorage.removeItem("authToken");
              localStorage.removeItem("userData");
              localStorage.removeItem("userMetaDatum");
              localStorage.removeItem("lastUserCheck");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("sekaiProfile");
              localStorage.removeItem("sekaiCardTeam");
            }
          }
          throw err;
        }
      );

      let { data: userData } = await axios.get<UserModel>("/users/me");
      localStorage.setItem("userData", JSON.stringify(userData));

      let { data: userMetaDatum } = await axios.get<UserMetadatumModel>(
        "/user-metadata/me"
      );
      localStorage.setItem("userMetaDatum", JSON.stringify(userMetaDatum));

      if (!localStorage.getItem("refreshToken")) {
        let {
          data: { refresh },
        } = await axios.get<{ refresh: string }>("/auth/refreshToken");
        localStorage.setItem("refreshToken", refresh);
      }

      try {
        let { data: sekaiProfile } = await axios.get<SekaiProfileModel>(
          "/sekai-profiles/me"
        );
        localStorage.setItem("sekaiProfile", JSON.stringify(sekaiProfile));

        let { data: sekaiCardTeam } = await axios.get<SekaiProfileModel>(
          "/sekai-card-teams/me"
        );
        localStorage.setItem("sekaiCardTeam", JSON.stringify(sekaiCardTeam));
      } catch (error) {}

      localStorage.setItem("lastUserCheck", String(new Date().getTime()));
    }
  }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
