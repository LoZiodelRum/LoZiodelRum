import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  // Altezza navbar: 47px (minHeight + padding verticale)
  const NAVBAR_HEIGHT = 47;
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: NAVBAR_HEIGHT, minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
        <Outlet />
      </main>
    </>
  );
}
