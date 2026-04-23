import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import "./index.css";

const APP_VERSION = "2026-04-17-01";

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


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UserProvider>
          <App />
        </UserProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);