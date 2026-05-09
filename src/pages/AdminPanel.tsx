import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminPanelDesktop from "./AdminPanelDesktop";
import AdminPanelMobile from "./AdminPanelMobile";

export default function AdminPanel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleResize();

    mediaQuery.addEventListener("change", handleResize);

    // cleanup corretto
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020B1C",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      <main
        style={{
          paddingTop: isMobile ? "170px" : "120px",
          minHeight: "100vh",
        }}
      >
        {isMobile ? <AdminPanelMobile /> : <AdminPanelDesktop />}
      </main>
    </div>
  );
}