import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminPanelDesktop from "./AdminPanelDesktop";
import AdminPanelMobile from "./AdminPanelMobile";

export default function AdminPanel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleChange = (e?: MediaQueryListEvent) => {
      setIsMobile(e ? e.matches : mediaQuery.matches);
    };

    // inizializzazione
    handleChange();

    // listener responsive
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // cleanup corretto
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020B1C]">
      {/* Navbar ufficiale */}
      <Navbar />

      {/* Contenuto admin */}
      <div className="pt-[110px]">
        {isMobile ? <AdminPanelMobile /> : <AdminPanelDesktop />}
      </div>
    </div>
  );
}