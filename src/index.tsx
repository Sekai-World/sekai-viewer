import React, { Suspense } from "react";
import ReactDOM from "react-dom";

import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import { HashRouter as Router } from "react-router-dom";
import "./modernizr-custom";
import { initGlobalI18n } from "./utils/i18n";
import "./index.css";
import { SettingProvider } from "./context";

initGlobalI18n();

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
