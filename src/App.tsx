import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";

import Navbar from "./components/Navbar";

/* PAGINE */
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Baretto from "./pages/Baretto";
import Crea from "./pages/Crea";
import CreaVino from "./pages/CreaVino";
import Drink from "./pages/Drink";
import Vini from "./pages/Vini";
import VinoDetail from "./pages/VinoDetail";
import DrinkDetail from "./pages/DrinkDetail";
import Category from "./pages/Category";
import Magazine from "./pages/Magazine";
import ArticleDetail from "./pages/ArticleDetail";
import MapPage from "./pages/MapPage";
import Venues from "./pages/Venues";
import PannelloControllo from "./pages/PannelloControllo";
import Recensione from "./pages/Recensione";
import RecensioneDetail from "./pages/RecensioneDetail";
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
  const { user, loading, role, status, isAuthenticated, isAdmin } = useUser();

  if (loading) return null;

  // NON LOGGATO
  if (!isAuthenticated) return <Navigate to="/auth" />;

  const effectiveRole = isAdmin ? "admin" : role;

  // NON APPROVATO
  if (!isAdmin && user && status === "in_attesa") return <Navigate to="/in-attesa" />;

  // RIFIUTATO
  if (!isAdmin && user && status === "rifiutato") return <Navigate to="/auth" />;

  // CONTROLLO RUOLO
  if (roles && (!effectiveRole || !roles.includes(effectiveRole))) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function PageShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  return <div className={fullBleed ? "page page-full-bleed fade-in" : "page fade-in"}>{children}</div>;
}

function AppContent() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* PUBBLICHE */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<PageShell><Auth /></PageShell>} />

        {/* REGISTRAZIONE */}
        <Route path="/registrati" element={<PageShell><SceltaRegistrazione /></PageShell>} />
        <Route path="/registrazione" element={<PageShell><Registrazione /></PageShell>} />
        <Route path="/registrazione-bartender" element={<PageShell><RegistrazioneBartender /></PageShell>} />
        <Route path="/registrazione-owner" element={<PageShell><RegistrazioneProprietario /></PageShell>} />

        {/* DRINK */}
        <Route path="/drink" element={<PageShell><Drink /></PageShell>} />
        <Route path="/drinks" element={<PageShell><Drink /></PageShell>} />
        <Route path="/vini" element={<PageShell><Vini /></PageShell>} />
        <Route path="/vini/categoria/:categoria" element={<PageShell><Vini /></PageShell>} />
        <Route path="/vini/:id" element={<PageShell><VinoDetail /></PageShell>} />
        <Route path="/drink/:id" element={<PageShell><DrinkDetail /></PageShell>} />
        <Route path="/categoria/:categoria" element={<PageShell><Category /></PageShell>} />

        {/* MAGAZINE */}
        <Route path="/magazine" element={<PageShell fullBleed><Magazine /></PageShell>} />
        <Route path="/magazine/:id" element={<PageShell fullBleed><ArticleDetail /></PageShell>} />

        {/* BLOCCO UTENTE */}
        <Route path="/in-attesa" element={<PageShell><InAttesa /></PageShell>} />

        {/* 🔴 ADMIN */}
        <Route
          path="/admin"
          element={
            <PageShell fullBleed>
              <Protected roles={["admin"]}>
                <PannelloControllo />
              </Protected>
            </PageShell>
          }
        />

        {/* 🔥 MAPPA PUBBLICA */}
        <Route path="/mappa" element={<MapPage />} />
        <Route path="/venues" element={<PageShell><Venues /></PageShell>} />

        {/* PUBBLICHE */}
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
          path="/community/baretto"
          element={
            <PageShell fullBleed>
              <Protected>
                <Baretto />
              </Protected>
            </PageShell>
          }
        />

        <Route
          path="/profilo/:id"
          element={
            <PageShell>
              <UserProfile />
            </PageShell>
          }
        />

        <Route
          path="/venue/:id"
          element={
            <PageShell fullBleed>
              <VenueDetail />
            </PageShell>
          }
        />

        {/* PROTETTE */}

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
          path="/recensione/:id"
          element={
            <PageShell fullBleed>
              <RecensioneDetail />
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
              <Protected>
                <Crea />
              </Protected>
            </PageShell>
          }
        />
        <Route
          path="/crea/vino"
          element={
            <PageShell>
              <Protected>
                <CreaVino />
              </Protected>
            </PageShell>
          }
        />
        <Route
          path="/crea-vino"
          element={
            <PageShell>
              <Protected>
                <CreaVino />
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
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}