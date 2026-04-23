//
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./pages/ProtectedRoute";

  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      {/* altre rotte protette: <Route path="/altra" element={<ProtectedRoute><Altra /></ProtectedRoute>} /> */}
    </Routes>
  );
}
//