import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./Layout";
// Scroll to top ad ogni cambio pagina
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./pages/ProtectedRoute";
import MapPage from "./pages/MapPage";
import Drink from "./pages/Drink";
import DrinkDetail from "./pages/DrinkDetail";
import Vini from "./pages/Vini";
import VinoDetail from "./pages/VinoDetail";
import Magazine from "./pages/Magazine";
import CategoryVini from "./pages/CategoryVini";
import Category from "./pages/Category";
import ArticleDetail from "./pages/ArticleDetail";
import Community from "./pages/Community";
import Crea from "./pages/Crea";
import AdminPanel from "./pages/AdminPanel";
import VenueDetail from "./pages/VenueDetail";
import Venues from "./pages/Venues";

// 🔥 BARETTO
import Baretto from "./pages/Baretto";
import BarettoMobile from "./pages/BarettoMobile";
import BarettoChat from "./pages/BarettoChat";

export default function App() {

  // 🔥 FIX SSR / VERCEL
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // 🔥 FONDAMENTALE

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* AUTH SENZA NAVBAR */}
        <Route path="/" element={<Auth />} />
        {/* Tutte le altre pagine wrappate da Layout che contiene la Navbar */}
        <Route element={<Layout />}>
          {/* MAIN */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/mappa" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />

          {/* DRINK */}
          <Route path="/drink" element={<ProtectedRoute><Drink /></ProtectedRoute>} />
          <Route path="/drink/:id" element={<ProtectedRoute><DrinkDetail /></ProtectedRoute>} />

          {/* VINI */}
          <Route path="/vini" element={<ProtectedRoute><Vini /></ProtectedRoute>} />
          <Route path="/vini/:id" element={<ProtectedRoute><VinoDetail /></ProtectedRoute>} />
          <Route path="/vini/categoria/:categoria" element={<ProtectedRoute><CategoryVini /></ProtectedRoute>} />

          {/* MAGAZINE */}
          <Route path="/magazine" element={<ProtectedRoute><Magazine /></ProtectedRoute>} />
          <Route path="/magazine/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />

          {/* CATEGORIE */}
          <Route path="/categoria/:categoria" element={<ProtectedRoute><Category /></ProtectedRoute>} />

          {/* COMMUNITY */}
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />

          {/* 🔥 BARETTO SWITCH */}
          <Route
            path="/baretto"
            element={
              <ProtectedRoute>
                {isMobile ? <BarettoMobile /> : <Baretto />}
              </ProtectedRoute>
            }
          />

          {/* 🔥 CHAT */}
          <Route
            path="/baretto/chat/:room"
            element={
              <ProtectedRoute>
                <BarettoChat />
              </ProtectedRoute>
            }
          />

          {/* 🔥 FALLBACK BARETTO */}
          <Route
            path="/baretto/*"
            element={
              <ProtectedRoute>
                {isMobile ? <BarettoMobile /> : <Baretto />}
              </ProtectedRoute>
            }
          />

          {/* ALTRO */}
          <Route path="/venues" element={<ProtectedRoute><Venues /></ProtectedRoute>} />
          <Route path="/crea" element={<ProtectedRoute><Crea /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/venue/:id" element={<ProtectedRoute><VenueDetail /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}