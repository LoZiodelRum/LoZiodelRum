import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminPanelDesktop from "./AdminPanelDesktop";
import AdminPanelMobile from "./AdminPanelMobile";

export default function AdminPanel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

    return (
      <div className="min-h-screen bg-[#020B1C] overflow-x-hidden pt-[140px] md:pt-[120px]">
        <ErrorBoundary>
          {isMobile ? <AdminPanelMobile /> : <AdminPanelDesktop />}
        </ErrorBoundary>
      </div>
  );
}