import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { useState } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div
      style={{
        background: "#0b0b0b",
        minHeight: "100vh",
        color: "#fff",
      }}
    >

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9998,
            display: "none",
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU SLIDE-IN */}
      <div
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 70,
          right: menuOpen ? 0 : "-100%",
          width: "100%",
          maxWidth: "300px",
          height: "calc(100vh - 70px)",
          background: "rgba(0,0,0,0.95)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: "20px",
          zIndex: 9999,
          transition: "right 0.3s ease",
          overflowY: "auto",
          borderLeft: "1px solid #333",
        }}
      >
        <span 
          style={{ 
            cursor: "pointer", 
            padding: "12px 0", 
            borderBottom: "1px solid #333",
            fontSize: "16px"
          }} 
          onClick={() => handleNavigation("/")}
        >
          Home
        </span>

        <span 
          style={{ 
            cursor: "pointer", 
            padding: "12px 0", 
            borderBottom: "1px solid #333",
            fontSize: "16px"
          }} 
          onClick={() => handleNavigation("/mappa")}
        >
          Mappa
        </span>

        <span 
          style={{ 
            cursor: "pointer", 
            padding: "12px 0", 
            borderBottom: "1px solid #333",
            fontSize: "16px"
          }} 
          onClick={() => handleNavigation("/drink")}
        >
          Drink
        </span>

        <span 
          style={{ 
            cursor: "pointer", 
            padding: "12px 0", 
            borderBottom: "1px solid #333",
            fontSize: "16px"
          }} 
          onClick={() => handleNavigation("/magazine")}
        >
          Magazine
        </span>

        {/* SOLO UTENTI LOGGATI */}
        {user && (
          <>
            <span 
              style={{ 
                cursor: "pointer", 
                padding: "12px 0", 
                borderBottom: "1px solid #333",
                fontSize: "16px"
              }} 
              onClick={() => handleNavigation("/community")}
            >
              Community
            </span>

            <span 
              style={{ 
                cursor: "pointer", 
                padding: "12px 0", 
                borderBottom: "1px solid #333",
                fontSize: "16px",
                color: "#f5a623",
                fontWeight: "bold"
              }} 
              onClick={() => handleNavigation("/crea")}
            >
              ✨ Crea
            </span>
          </>
        )}

        {/* ADMIN */}
        {role === "admin" && (
          <span 
            style={{ 
              cursor: "pointer", 
              padding: "12px 0", 
              borderBottom: "1px solid #333",
              fontSize: "16px",
              color: "#f5a623"
            }} 
            onClick={() => handleNavigation("/dashboard")}
          >
            🔧 Dashboard
          </span>
        )}
      </div>

      {/* CONTENUTO */}
      <div style={{ paddingTop: 70 }}>
        <Outlet />
      </div>
    </div>
  );
}