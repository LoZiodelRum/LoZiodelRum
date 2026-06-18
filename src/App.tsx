import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RuntimeErrorBoundary from "./components/RuntimeErrorBoundary";
import ScannerQR from "./pages/ScannerQR";
import GestioneQR from "./pages/GestioneQR";
import ControlCenter from "./pages/ControlCenter";
import LocaliDashboard from "./pages/LocaliDashboard";
import LocaliElenco from "./pages/LocaliElenco";

// Scroll automatico top pagina
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// PAGINE BASE
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./pages/ProtectedRoute";
import MapPage from "./pages/MapPage";
import Progetto from "./pages/Progetto";

// DRINK
import Drink from "./pages/Drink";
import DrinkDetail from "./pages/DrinkDetail";

// VINI
import Vini from "./pages/Vini";
import VinoDetail from "./pages/VinoDetail";
import CategoryVini from "./pages/CategoryVini";

// MAGAZINE
import Magazine from "./pages/Magazine";
import ArticleDetail from "./pages/ArticleDetail";

// CATEGORIE
import Category from "./pages/Category";

// NUOVE PAGINE
import EventiPage from "./pages/EventiPage";
import LocaliVicini from "./pages/LocaliVicini";
import DiscoverPage from "./pages/DiscoverPage";
import ProfilePage, {
  EditProfilePage,
  EventDetailPlaceholderPage,
  ProfileBadgesPage,
  ProfilePreferencesPage,
} from "./pages/ProfilePage";

// LOUNGE
import LoungeHome from "./pages/lounge/LoungeHome";

// ALTRE PAGINE
import Crea from "./pages/Crea";
import AdminPanel from "./pages/AdminPanel";
import Bancone from "./pages/Bancone";
import VenueDetail from "./pages/VenueDetail";
import Venues from "./pages/Venues";
import ProprietarioDashboard from "./pages/ProprietarioDashboard";

// BARETTO
import Baretto from "./pages/Baretto";
import BarettoMobile from "./pages/BarettoMobile";
import BarettoChat from "./pages/BarettoChat";
import BarettoCreate from "./pages/BarettoCreate";
export default function App() {
  // FIX SSR / MOBILE
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ScrollToTop />

      <RuntimeErrorBoundary>
        <Routes>

          {/* AUTH */}
          <Route path="/" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* PAGINE CON NAVBAR */}
          <Route element={<MainLayout />}>

            {/* HOME */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
<Route path="/progetto" element={<Progetto />} />
            {/* DISCOVER */}
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <DiscoverPage />
                </ProtectedRoute>
              }
            />

            {/* PROFILO */}
            <Route
              path="/profilo"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profilo/preferenze"
              element={
                <ProtectedRoute>
                  <ProfilePreferencesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profilo/badge"
              element={
                <ProtectedRoute>
                  <ProfileBadgesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/modifica-profilo"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/evento/:id"
              element={
                <ProtectedRoute>
                  <EventDetailPlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* MAPPA */}
            <Route
              path="/mappa"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />

            {/* DRINK */}
            <Route
              path="/drink"
              element={
                <ProtectedRoute>
                  <Drink />
                </ProtectedRoute>
              }
            />

            <Route
              path="/drink/:id"
              element={
                <ProtectedRoute>
                  <DrinkDetail />
                </ProtectedRoute>
              }
            />

            {/* VINI */}
            <Route
              path="/vini"
              element={
                <ProtectedRoute>
                  <Vini />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vini/:id"
              element={
                <ProtectedRoute>
                  <VinoDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vini/categoria/:categoria"
              element={
                <ProtectedRoute>
                  <CategoryVini />
                </ProtectedRoute>
              }
            />

            {/* MAGAZINE */}
            <Route
              path="/magazine"
              element={
                <ProtectedRoute>
                  <Magazine />
                </ProtectedRoute>
              }
            />

            <Route
              path="/magazine/:id"
              element={
                <ProtectedRoute>
                  <ArticleDetail />
                </ProtectedRoute>
              }
            />

            {/* CATEGORIE */}
            <Route
              path="/categoria/:categoria"
              element={
                <ProtectedRoute>
                  <Category />
                </ProtectedRoute>
              }
            />

            {/* COMMUNITY / LOUNGE */}
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <LoungeHome />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lounge"
              element={
                <ProtectedRoute>
                  <LoungeHome />
                </ProtectedRoute>
              }
            />
<Route
  path="/scanner"
  element={
    <ProtectedRoute>
      <ScannerQR />
    </ProtectedRoute>
  }
/>
<Route
  path="/proprietario/qr"
  element={
    <ProtectedRoute>
      <GestioneQR />
    </ProtectedRoute>
  }
/>
            {/* EVENTI */}
            <Route
              path="/eventi"
              element={
                <ProtectedRoute>
                  <EventiPage />
                </ProtectedRoute>
              }
            />

            {/* LOCALI VICINI */}
            <Route
              path="/locali-vicini"
              element={
                <ProtectedRoute>
                  <LocaliVicini />
                </ProtectedRoute>
              }
            />

            {/* BANCONE */}
            <Route
              path="/bancone"
              element={
                <ProtectedRoute>
                  <Bancone />
                </ProtectedRoute>
              }
            />

            {/* BARETTO */}
            <Route
              path="/baretto"
              element={
                <ProtectedRoute>
                  {isMobile ? <BarettoMobile /> : <Baretto />}
                </ProtectedRoute>
              }
            />

            {/* CHAT BARETTO */}
            <Route
              path="/baretto/chat/:room"
              element={
                <ProtectedRoute>
                  <BarettoChat />
                </ProtectedRoute>
              }
            />
<Route
  path="/baretto/create"
  element={
    <ProtectedRoute>
      <BarettoCreate />
    </ProtectedRoute>
  }
/>
            {/* FALLBACK BARETTO */}
            <Route
              path="/baretto/*"
              element={
                <ProtectedRoute>
                  {isMobile ? <BarettoMobile /> : <Baretto />}
                </ProtectedRoute>
              }
            />

            {/* VENUES */}
            <Route
              path="/venues"
              element={
                <ProtectedRoute>
                  <Venues />
                </ProtectedRoute>
              }
            />

            {/* CREA */}
            <Route
              path="/crea"
              element={
                <ProtectedRoute>
                  <Crea />
                </ProtectedRoute>
              }
            />

            {/* DASHBOARD PROPRIETARIO */}
            <Route
              path="/proprietario"
              element={
                <ProtectedRoute>
                  <ProprietarioDashboard />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
<Route
  path="/control-center"
  element={
    <ProtectedRoute>
      <ControlCenter />
    </ProtectedRoute>
  }
/>
<Route
  path="/locali-dashboard"
  element={
    <ProtectedRoute>
      <LocaliDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/locali-elenco"
  element={
    <ProtectedRoute>
      <LocaliElenco />
    </ProtectedRoute>
  }
/>
            {/* DETTAGLIO LOCALE */}
            <Route
              path="/venue/:id"
              element={
                <ProtectedRoute>
                  <VenueDetail />
                </ProtectedRoute>
              }
            />

          </Route>
        </Routes>
      </RuntimeErrorBoundary>
    </>
  );
}