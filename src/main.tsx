import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import "./index.css";

const APP_VERSION = "2026-04-15-10";

try {
  const previousVersion = window.localStorage.getItem("app-version");
  if (previousVersion !== APP_VERSION) {
    window.localStorage.setItem("app-version", APP_VERSION);
    if (previousVersion) {
      const url = new URL(window.location.href);
      url.searchParams.set("v", APP_VERSION);
      window.location.replace(url.toString());
    }
  }
} catch {
  // ignore storage access issues
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);