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

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>

          {/* PUBBLICHE */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* REGISTRAZIONE */}
          <Route path="/registrati" element={<SceltaRegistrazione />} />
          <Route path="/registrazione" element={<Registrazione />} />
          <Route path="/registrazione-bartender" element={<RegistrazioneBartender />} />
          <Route path="/registrazione-owner" element={<RegistrazioneProprietario />} />

          {/* DRINK */}
          <Route path="/drink" element={<Drink />} />
          <Route path="/drink/:id" element={<DrinkDetail />} />
          <Route path="/categoria/:categoria" element={<Category />} />

          {/* MAGAZINE */}
          <Route path="/magazine" element={<Magazine />} />
          <Route path="/magazine/:id" element={<ArticleDetail />} />

          {/* BLOCCO UTENTE */}
          <Route path="/in-attesa" element={<InAttesa />} />

          {/* 🔴 ADMIN */}
          <Route path="/admin" element={<PannelloControllo />} />

          {/* 🔥 MAPPA PUBBLICA */}
          <Route path="/mappa" element={<MapPage />} />

          {/* PROTETTE */}
          <Route
            path="/community"
            element={
              <Protected>
                <Community />
              </Protected>
            }
          />

          <Route
            path="/profilo/:id"
            element={
              <Protected>
                <UserProfile />
              </Protected>
            }
          />

          <Route
            path="/venue/:id"
            element={
              <Protected>
                <VenueDetail />
              </Protected>
            }
          />

          <Route
            path="/recensione"
            element={
              <Protected>
                <Recensione />
              </Protected>
            }
          />

          <Route
            path="/segnala-locale"
            element={
              <Protected>
                <SegnalaLocale />
              </Protected>
            }
          />

          {/* SOLO BARTENDER + PROPRIETARIO */}
          <Route
            path="/crea"
            element={
              <Protected roles={["bartender", "proprietario"]}>
                <Crea />
              </Protected>
            }
          />

          {/* SOLO PROPRIETARIO */}
          <Route
            path="/pannello"
            element={
              <Protected roles={["proprietario"]}>
                <PannelloControllo />
              </Protected>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}