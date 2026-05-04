import { useEffect, useState } from "react";
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
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile ? <AdminPanelMobile /> : <AdminPanelDesktop />;
}