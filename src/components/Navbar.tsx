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
  const [languageOpen, setLanguageOpen] = useState(false);

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
    };
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
        minHeight: "35px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 20px",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 16px #000a",
      }}
    >
      {/* BLOCCO SINISTRO */}
      <div
        className="navbar-brand-block"
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
          className="logo navbar-logo"
          style={{
            height: 76,
            width: 76,
            objectFit: "contain",
          }}
        />

        <div
          className="navbar-brand-text"
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 23,
              color: "#f5a623",
            }}
          >
            DrinkWise
          </span>

          <span
            style={{
              fontSize: 11,
              opacity: 0.7,
            }}
          >
            by
          </span>

          <span
            style={{
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Lo Zio del Rum
          </span>
        </div>
      </div>

      {/* MENU DESKTOP */}
      <div
        className="navbar-links-desktop"
        style={{
          display: "flex",
          gap: 22,
          alignItems: "center",
          marginLeft: "auto",
        }}
      >
        <Link to="/home" style={linkStyle("/home")}>
          {t("home")}
        </Link>

        <Link to="/mappa" style={linkStyle("/mappa")}>
          {t("map")}
        </Link>

        <Link to="/drink" style={linkStyle("/drink")}>
          {t("drink")}
        </Link>

        <Link to="/vini" style={linkStyle("/vini")}>
          {t("wines")}
        </Link>

        <Link to="/magazine" style={linkStyle("/magazine")}>
          {t("magazine")}
        </Link>

        <Link to="/community" style={linkStyle("/community")}>
          {t("community")}
        </Link>

        <Link to="/crea" style={linkStyle("/crea")}>
          {t("create")}
        </Link>

        {/* SELETTORE LINGUA DESKTOP */}
        <div
          style={{
            position: "relative",
          }}
        >
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {i18n.language === "it" ? "🇮🇹 IT" : "🇬🇧 EN"}
          </button>

          {languageOpen && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: 0,
                background: "#111",
                border: "1px solid #333",
                borderRadius: "10px",
                overflow: "hidden",
                minWidth: "110px",
                zIndex: 9999,
              }}
            >
              <button
                onClick={() => {
                  i18n.changeLanguage("it");
                  setLanguageOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                🇮🇹 IT
              </button>

              <button
                onClick={() => {
                  i18n.changeLanguage("en");
                  setLanguageOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                🇬🇧 EN
              </button>
            </div>
          )}
        </div>

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

      <div
        className="mobile-nav-controls"
        style={{
          display: "none",
          marginLeft: "auto",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* BANDIERA MOBILE */}
        <div
          className="mobile-language-selector"
          style={{
            position: "relative",
            display: "none",
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          <div className="mobile-language-trigger-wrapper">
            <button
              className="mobile-language-trigger"
              onClick={() => setLanguageOpen(!languageOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>
                {i18n.language === "it" ? "🇮🇹" : "🇬🇧"}
              </span>
              <span style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
                {i18n.language === "it" ? "IT" : "EN"}
              </span>
            </button>
          </div>

          {languageOpen && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: 0,
                background: "#111",
                border: "1px solid #333",
                borderRadius: "10px",
                overflow: "hidden",
                minWidth: "110px",
                zIndex: 9999,
              }}
            >
              <button
                onClick={() => {
                  i18n.changeLanguage("it");
                  setLanguageOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                🇮🇹 IT
              </button>

              <button
                onClick={() => {
                  i18n.changeLanguage("en");
                  setLanguageOpen(false);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                🇬🇧 EN
              </button>
            </div>
          )}
        </div>

        {/* MENU HAMBURGER MOBILE */}
        <button
          className="navbar-hamburger-mobile"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Apri menu"
          style={{
            background: "none",
            border: "none",
            color: "#f5a623",
            fontSize: "26px",
            cursor: "pointer",
            padding: "6px 8px",
            marginLeft: 2,
            lineHeight: 1,
            borderRadius: "8px",
            display: "none",
          }}
        >
          ☰
        </button>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.36)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            zIndex: 1090,
          }}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 70,
          right: 0,
          width: "80vw",
          maxWidth: "300px",
          height: "calc(100vh - 70px)",
          background: "rgba(10,10,12,0.96)",
          display: "none",
          flexDirection: "column",
          padding: "16px 14px",
          zIndex: 1100,
          transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease",
          overflowY: "auto",
          overflowX: "hidden",
          borderLeft: "1px solid #2f2f36",
          borderTopLeftRadius: "16px",
          borderBottomLeftRadius: "16px",
          boxShadow: "-14px 0 34px rgba(0,0,0,0.42)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen
            ? "translateX(0) translateY(0)"
            : "translateX(100%) translateY(8px)",
        }}
      >
        <Link
          className="mobile-menu-item"
          to="/home"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/home"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("home")}
        </Link>

        <Link
          className="mobile-menu-item"
          to="/mappa"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/mappa"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("map")}
        </Link>

        <Link
          className="mobile-menu-item"
          to="/drink"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/drink"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("drink")}
        </Link>

        <Link
          className="mobile-menu-item"
          to="/vini"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/vini"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("wines")}
        </Link>

        <Link
          className="mobile-menu-item"
          to="/magazine"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/magazine"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("magazine")}
        </Link>

        <Link
          className="mobile-menu-item"
          to="/community"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/community"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("community")}
        </Link>

        <Link
          className="mobile-menu-item"
          to="/crea"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle("/crea"),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("create")}
        </Link>

        {isAdmin && (
          <Link
            className="mobile-menu-item"
            to="/admin"
            onClick={closeMobileMenu}
            style={{
              ...linkStyle("/admin"),
              padding: "13px 10px",
              borderRadius: "10px",
              marginBottom: "4px",
              borderBottom: "1px solid #333",
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Pannello di Controllo
          </Link>
        )}

        {user && (
          <button
            className="mobile-menu-item mobile-logout-btn"
            onClick={handleLogout}
            style={{
              marginTop: "12px",
              background: "#222",
              border: "1px solid #444",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* STYLE RESPONSIVE */}
      <style>{`
        html,
        body,
        #root {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }

        @media (max-width: 900px) {
          .nav-container {
            padding: 4px 12px !important;
            min-height: 32px !important;
          }

          .navbar-brand-block {
            gap: 6px !important;
            margin-right: 0 !important;
            transition: all 0.2s ease;
          }

          .navbar-logo {
            height: 58px !important;
            width: 58px !important;
            transition: all 0.2s ease;
          }

          .navbar-brand-text {
            line-height: 1.04 !important;
            transition: all 0.2s ease;
          }

          .navbar-brand-text span:nth-child(1) {
            font-size: 20px !important;
          }

          .navbar-brand-text span:nth-child(2) {
            font-size: 10px !important;
          }

          .navbar-brand-text span:nth-child(3) {
            font-size: 13px !important;
          }

          .navbar-links-desktop {
            display: none !important;
          }

          .mobile-nav-controls {
            display: flex !important;
            margin-left: auto !important;
            align-items: center !important;
            gap: 6px !important;
            transition: all 0.2s ease;
          }

          .navbar-hamburger-mobile {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-width: 36px !important;
            min-height: 36px !important;
            padding: 6px 8px !important;
            margin-left: 0 !important;
            transition: all 0.2s ease;
          }

          .mobile-language-selector {
            display: flex !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            align-items: center !important;
            transition: all 0.2s ease;
          }

          .mobile-language-trigger-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .mobile-language-trigger {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            font-size: 14px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            padding: 6px 4px !important;
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .mobile-menu {
            display: flex !important;
          }

          .mobile-menu-item:hover,
          .mobile-menu-item:active {
            background: rgba(245, 166, 35, 0.12);
          }

          .mobile-logout-btn:hover,
          .mobile-logout-btn:active {
            border-color: #5d5d69;
            background: #2a2a2d;
          }
        }

        @media (min-width: 901px) {
          .navbar-links-desktop {
            display: flex !important;
          }

          .mobile-nav-controls {
            display: none !important;
          }

          .navbar-hamburger-mobile {
            display: none !important;
          }

          .mobile-language-selector {
            display: none !important;
          }

          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}