import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#020B1C] overflow-x-hidden">
      <Navbar />
      <main className="global-page-content">
        <Outlet />
      </main>
      <style>{`
      .global-page-content {
  padding-top: 0;
}

        .global-page-content .nav-container {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
