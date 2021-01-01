import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import TagManager from "react-gtm-module";

import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router } from "react-router-dom";
import "./modernizr-custom";
import { initGlobalI18n } from "./utils/i18n";
import "./index.css";
import { SettingProvider } from "./context";
import Axios from "axios";
import localforage from "localforage";
import { UserMetadatumModel, UserModel } from "./strapi-model";

TagManager.initialize({
  gtmId: "GTM-NFC6SW2",
});

window.isChinaMainland = false;
localforage
  .getItem<string>("country")
  .then((country) => {
    if (!country)
      return Axios.get<{ data: { country: string } }>(
        `${process.env.REACT_APP_API_BACKEND_BASE}/country`
      );
    else {
      window.isChinaMainland = country === "CN";
      initGlobalI18n();
      return null;
    }
  })
  .then((res) => {
    if (res) {
      window.isChinaMainland = res.data.data.country === "CN";
      initGlobalI18n();
      localforage.setItem<string>("country", res.data.data.country);
    }

    ReactDOM.render(
      <React.StrictMode>
        <Router>
          <Suspense fallback="loading">
            <SettingProvider>
              <App />
            </SettingProvider>
          </Suspense>
        </Router>
      </React.StrictMode>,
      document.getElementById("root")
    );
  });

// check user info
(async () => {
  const lastCheck = Number(localStorage.getItem("lastUserCheck") || "0");

  if (
    process.env.NODE_ENV === "development" ||
    new Date().getTime() - lastCheck > 3600 * 1000
  ) {
    // recheck user info
    const userData = JSON.parse(
      localStorage.getItem("userData") || "null"
    ) as UserModel | null;
    const token = localStorage.getItem("authToken") || "";
    if (userData && token) {
      const axios = Axios.create({
        baseURL: process.env.REACT_APP_STRAPI_BASE,
      });
      let { data: userData } = await axios.get<UserModel>(`/users/me`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem("userData", JSON.stringify(userData));
      let { data: userMetaDatum } = await axios.get<UserMetadatumModel>(
        `/user-metadata/me`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.setItem("userMetaDatum", JSON.stringify(userMetaDatum));

      localStorage.setItem("lastUserCheck", String(new Date().getTime()));
    }
  }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
