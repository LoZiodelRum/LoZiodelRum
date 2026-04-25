import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminPanel from "./pages/AdminPanel.jsx";
import VenueDetail from "./pages/VenueDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/mappa" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/drink" element={<ProtectedRoute><Drink /></ProtectedRoute>} />
      <Route path="/drink/:id" element={<ProtectedRoute><DrinkDetail /></ProtectedRoute>} />
      <Route path="/vini" element={<ProtectedRoute><Vini /></ProtectedRoute>} />
      <Route path="/vini/:id" element={<ProtectedRoute><VinoDetail /></ProtectedRoute>} />
      <Route path="/magazine" element={<ProtectedRoute><Magazine /></ProtectedRoute>} />
      <Route path="/magazine/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
      <Route path="/categoria/:categoria" element={<ProtectedRoute><Category /></ProtectedRoute>} />
      <Route path="/vini/categoria/:categoria" element={<ProtectedRoute><CategoryVini /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/crea" element={<ProtectedRoute><Crea /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/venue/:id" element={<ProtectedRoute><VenueDetail /></ProtectedRoute>} />
    </Routes>
  );
}