import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  // Responsive padding-top: 95px mobile, 110px desktop
  // Navbar fixed, main sempre con padding-top
  return (
    <div className="min-h-screen bg-[#020B1C] overflow-x-hidden">
      <Navbar />
      <main
        className="pt-[95px] md:pt-[110px]"
        style={{ minHeight: "calc(100vh - 95px)" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
