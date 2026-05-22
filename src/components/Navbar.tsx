import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }


  function linkStyle(path: string) {
    return {
      color: isActive(path) ? "#f5a623" : "#fff",
      textDecoration: "none",
      fontWeight: isActive(path) ? 700 : 400,
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    closeMobileMenu();
    navigate("/");
    window.location.reload();
  }

  return (
    <nav
      className="nav-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        background: "rgba(0,0,0,0.97)",
        color: "#fff",
        minHeight: "35px", // dimezza l'altezza
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 20px", // dimezza il padding verticale
        zIndex: 9999,
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 16px #000a",
      }}
    >
      {/* BLOCCO SINISTRO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginRight: 40,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => {
          closeMobileMenu();
          if (user) {
            navigate("/home");
          } else {
            navigate("/");
          }
        }}
      >
        <img
          src="/logo.png"
          alt="Lo Zio del Rum logo"
          className="logo"
          style={{ height: 76, width: 76, objectFit: "contain" }} // raddoppia la dimensione
        />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span style={{ fontWeight: 700, fontSize: 23, color: "#f5a623" }}>DrinkWise</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>by</span>
          <span style={{ fontWeight: 500, fontSize: 15 }}>Lo Zio del Rum</span>
        </div>
      </div>

      {/* BLOCCO DESTRA */}
      <div
        className="navbar-links-desktop"
        style={{
          display: "flex",
          gap: 22,
          alignItems: "center",
          marginLeft: "auto",
        }}
      >
        <Link to="/home" style={linkStyle("/home")}>{t("home")}</Link>
        <Link to="/mappa" style={linkStyle("/mappa")}>{t("map")}</Link>
        <Link to="/drink" style={linkStyle("/drink")}>{t("drink")}</Link>
        <Link to="/vini" style={linkStyle("/vini")}>{t("wines")}</Link>
        <Link to="/magazine" style={linkStyle("/magazine")}>{t("magazine")}</Link>
        <Link to="/community" style={linkStyle("/community")}>{t("community")}</Link>
        <Link to="/crea" style={linkStyle("/crea")}>{t("create")}</Link>
        <button onClick={() => i18n.changeLanguage("it")}>
  IT
</button>

<button onClick={() => i18n.changeLanguage("en")}>
  EN
</button>

        {isAdmin && (
          <Link to="/admin" style={linkStyle("/admin")}> 
            Pannello di Controllo
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* MENU HAMBURGER SOLO MOBILE */}
      <button
        className="navbar-hamburger-mobile"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Apri menu"
        style={{
          background: "none",
          border: "none",
          color: "#f5a623",
          fontSize: "28px",
          cursor: "pointer",
          padding: 0,
          marginLeft: 10,
          display: "none"
        }}
      >
        ☰
      </button>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* MOBILE MENU SOLO MOBILE */}
      <div
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 70,
          right: 0,
          width: "80vw",
          maxWidth: "300px",
          height: "calc(100vh - 70px)",
          background: "rgba(0,0,0,0.97)",
          display: "none",
          flexDirection: "column",
          padding: "18px",
          zIndex: 1100,
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
          overflowY: "auto",
          overflowX: "hidden",
          borderLeft: "1px solid #333",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <Link to="/home" onClick={closeMobileMenu} style={{ ...linkStyle("/home"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("home")}</Link>
        <Link to="/mappa" onClick={closeMobileMenu} style={{ ...linkStyle("/mappa"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("map")}</Link>
        <Link to="/drink" onClick={closeMobileMenu} style={{ ...linkStyle("/drink"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("drink")}</Link>
        <Link to="/vini" onClick={closeMobileMenu} style={{ ...linkStyle("/vini"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("wines")}</Link>
        <Link to="/magazine" onClick={closeMobileMenu} style={{ ...linkStyle("/magazine"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("magazine")}</Link>
        <Link to="/community" onClick={closeMobileMenu} style={{ ...linkStyle("/community"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("community")}</Link>
        <Link to="/crea" onClick={closeMobileMenu} style={{ ...linkStyle("/crea"), padding: "12px 0", borderBottom: "1px solid #333" }}>{t("create")}</Link>

        {isAdmin && (
          <Link to="/admin" onClick={closeMobileMenu} style={{ ...linkStyle("/admin"), padding: "12px 0", borderBottom: "1px solid #333" }}>
            Pannello di Controllo
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginTop: "10px",
              background: "#222",
              border: "1px solid #444",
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* STYLE RESPONSIVE */}
      <style>{`
        html, body, #root {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
        @media (max-width: 900px) {
          .navbar-links-desktop { display: none !important; }
          .navbar-hamburger-mobile { display: block !important; }
          .mobile-menu { display: flex !important; }
        }
        @media (min-width: 901px) {
          .navbar-links-desktop { display: flex !important; }
          .navbar-hamburger-mobile { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}