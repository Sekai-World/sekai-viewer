import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import TagManager from "react-gtm-module";

import App from "./pages/App";
// import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router } from "react-router-dom";
import "./modernizr-custom";
import { initGlobalI18n } from "./utils/i18n";
import "./index.css";
import Axios from "axios";
import localforage from "localforage";
// import { UserMetadatumModel, UserModel } from "./strapi-model";
import AppSkeleton from "./pages/AppSkeleton";
import { rootStore, RootStoreProvider } from "./stores/root";

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

  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    worker.start();
  }

  ReactDOM.render(
    <React.StrictMode>
      <Router>
        <Suspense fallback={<AppSkeleton />}>
          <RootStoreProvider value={rootStore}>
            <App />
          </RootStoreProvider>
        </Suspense>
      </Router>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
