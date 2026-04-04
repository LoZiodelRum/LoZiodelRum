import { useNavigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { useState } from "react";

export default function Layout() {
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
      {/* NAVBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          height: 70,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 9999,
        }}
      >
        {/* LOGO - Responsive */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            maxWidth: "60vw",
            overflow: "hidden",
          }}
          onClick={() => handleNavigation("/")}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            {/* Face circle */}
            <circle cx="20" cy="22" r="14" fill="#ffffff"/>
            {/* Left eye */}
            <circle cx="15" cy="18" r="3" fill="#f5a623"/>
            {/* Right eye */}
            <circle cx="25" cy="18" r="3" fill="#f5a623"/>
            {/* Smile */}
            <path d="M 15 24 Q 20 27 25 24" stroke="#f5a623" strokeWidth="1.5" fill="none"/>
            {/* Hat */}
            <ellipse cx="20" cy="8" rx="16" ry="6" fill="#f5a623"/>
            {/* Hat brim */}
            <rect x="8" y="12" width="24" height="3" fill="#f5a623" rx="1"/>
          </svg>
          <span
            style={{
              fontWeight: "bold",
              color: "#f5a623",
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Lo Zio del Rum
          </span>
        </div>

        {/* MENU DESKTOP (display: flex su 1024px+) */}
        <div 
          className="nav-menu-desktop"
          style={{ display: "flex", gap: 25, alignItems: "center" }}
        >
          <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/")}>
            Home
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/mappa")}>
            Mappa
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/drink")}>
            Drink
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/magazine")}>
            Magazine
          </span>

          {/* SOLO UTENTI LOGGATI */}
          {user && (
            <>
              <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/community")}>
                Community
              </span>

              <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/crea")}>
                Crea
              </span>
            </>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <span style={{ cursor: "pointer" }} onClick={() => handleNavigation("/dashboard")}>
              Dashboard
            </span>
          )}
        </div>

        {/* HAMBURGER ICON (display: none su 1024px+) */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#f5a623",
            fontSize: "28px",
            cursor: "pointer",
            display: "none",
            padding: 0,
          }}
        >
          ☰
        </button>
      </div>

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