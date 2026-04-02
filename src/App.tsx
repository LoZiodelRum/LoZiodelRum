import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";

import Navbar from "./components/Navbar";

/* PAGINE */
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Crea from "./pages/Crea";
import Drink from "./pages/Drink";
import DrinkDetail from "./pages/DrinkDetail";
import Category from "./pages/Category";
import Magazine from "./pages/Magazine";
import ArticleDetail from "./pages/ArticleDetail";
import MapPage from "./pages/MapPage";
import PannelloControllo from "./pages/PannelloControllo";
import Recensione from "./pages/Recensione";
import SegnalaLocale from "./pages/SegnalaLocale";
import VenueDetail from "./pages/VenueDetail";
import UserProfile from "./pages/UserProfile";

/* NUOVE PAGINE */
import InAttesa from "./pages/InAttesaPage";
import AdminPanel from "./pages/AdminPanel";

/* REGISTRAZIONI */
import SceltaRegistrazione from "./pages/SceltaRegistrazione";
import Registrazione from "./pages/Registrazione";
import RegistrazioneBartender from "./pages/RegistrazioneBartender";
import RegistrazioneProprietario from "./pages/RegistrazioneProprietario";

/* 🔐 PROTECTED ROUTE */
function Protected({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { user, loading, role, status } = useUser();

  if (loading) return null;

  // NON LOGGATO
  if (!user) return <Navigate to="/auth" />;

  // NON APPROVATO
  if (status === "in_attesa") return <Navigate to="/in-attesa" />;

  // RIFIUTATO
  if (status === "rifiutato") return <Navigate to="/auth" />;

  // CONTROLLO RUOLO
  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function PageShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  return <div className={fullBleed ? "page page-full-bleed fade-in" : "page fade-in"}>{children}</div>;
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>

          {/* PUBBLICHE */}
          <Route path="/" element={<PageShell fullBleed><Home /></PageShell>} />
          <Route path="/auth" element={<PageShell><Auth /></PageShell>} />

          {/* REGISTRAZIONE */}
          <Route path="/registrati" element={<PageShell><SceltaRegistrazione /></PageShell>} />
          <Route path="/registrazione" element={<PageShell><Registrazione /></PageShell>} />
          <Route path="/registrazione-bartender" element={<PageShell><RegistrazioneBartender /></PageShell>} />
          <Route path="/registrazione-owner" element={<PageShell><RegistrazioneProprietario /></PageShell>} />

          {/* DRINK */}
          <Route path="/drink" element={<PageShell><Drink /></PageShell>} />
          <Route path="/drink/:id" element={<PageShell><DrinkDetail /></PageShell>} />
          <Route path="/categoria/:categoria" element={<PageShell><Category /></PageShell>} />

          {/* MAGAZINE */}
          <Route path="/magazine" element={<PageShell><Magazine /></PageShell>} />
          <Route path="/magazine/:id" element={<PageShell><ArticleDetail /></PageShell>} />

          {/* BLOCCO UTENTE */}
          <Route path="/in-attesa" element={<PageShell><InAttesa /></PageShell>} />

          {/* 🔴 ADMIN */}
          <Route path="/admin" element={<PageShell fullBleed><PannelloControllo /></PageShell>} />

          {/* 🔥 MAPPA PUBBLICA */}
          <Route path="/mappa" element={<PageShell fullBleed><MapPage /></PageShell>} />

          {/* PROTETTE */}
          <Route
            path="/community"
            element={
              <PageShell>
                <Protected>
                  <Community />
                </Protected>
              </PageShell>
            }
          />

          <Route
            path="/profilo/:id"
            element={
              <PageShell>
                <Protected>
                  <UserProfile />
                </Protected>
              </PageShell>
            }
          />

          <Route
            path="/venue/:id"
            element={
              <PageShell>
                <Protected>
                  <VenueDetail />
                </Protected>
              </PageShell>
            }
          />

          <Route
            path="/recensione"
            element={
              <PageShell>
                <Protected>
                  <Recensione />
                </Protected>
              </PageShell>
            }
          />

          <Route
            path="/segnala-locale"
            element={
              <PageShell>
                <Protected>
                  <SegnalaLocale />
                </Protected>
              </PageShell>
            }
          />

          {/* SOLO BARTENDER + PROPRIETARIO */}
          <Route
            path="/crea"
            element={
              <PageShell>
                <Protected roles={["bartender", "proprietario"]}>
                  <Crea />
                </Protected>
              </PageShell>
            }
          />

          {/* SOLO PROPRIETARIO */}
          <Route
            path="/pannello"
            element={
              <PageShell fullBleed>
                <Protected roles={["proprietario"]}>
                  <PannelloControllo />
                </Protected>
              </PageShell>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}