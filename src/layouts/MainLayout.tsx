import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#020B1C] overflow-x-hidden">
      <Navbar />
      <main className="pt-20 md:pt-24">
        <Outlet />
      </main>
    </div>
  );
}
