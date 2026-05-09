import { useEffect, useState } from "react";
// MainLayout ora solo via router
import AdminPanelDesktop from "./AdminPanelDesktop";
import AdminPanelMobile from "./AdminPanelMobile";

// ErrorBoundary semplice
import React from "react";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error("AdminPanel error:", error, info); }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: "#f59e0b", background: "#020617", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>Errore nel Pannello di Controllo</div>;
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      {isMobile ? <AdminPanelMobile /> : <AdminPanelDesktop />}
    </ErrorBoundary>
  );
}