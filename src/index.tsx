import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fetchBackend from "i18next-fetch-backend";
import detector from "i18next-browser-languagedetector";

import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { HashRouter as Router } from "react-router-dom";
import "./modernizr-custom";

i18n
  .use(initReactI18next)
  .use(fetchBackend)
  .use(detector)
  .init({
    supportedLngs: ["en", "zh-CN", "zh-TW", "ja", "ko", "es", "de"],
    ns: ["common", "home", "card", "music", "gacha", "event", "unit", "member"],
    fallbackLng: "en",
    fallbackNS: "common",
    backend: {
      loadPath: process.env.PUBLIC_URL + "/locales/{{lng}}/{{ns}}.json",
    },
    returnEmptyString: false,
  });

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Suspense fallback="loading">
        <App />
      </Suspense>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
