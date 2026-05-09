import { useEffect, useState } from "react";
// MainLayout ora solo via router
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
    <>
      {isMobile ? <AdminPanelMobile /> : <AdminPanelDesktop />}
    </>
  );
}