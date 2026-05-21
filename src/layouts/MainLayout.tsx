import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#020B1C] overflow-x-hidden">
      <Navbar />
      <main className="pt-6 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
