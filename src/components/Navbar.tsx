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

  const { t, i18n } = useTranslation("navbar");
  const normalizedLanguage = String(i18n.language || "it").toLowerCase();
  const activeLanguage = normalizedLanguage.startsWith("en")
    ? "en"
    : normalizedLanguage.startsWith("bg")
    ? "bg"
    : "it";
  const formatLanguageLabel = (label: string) =>
    label.replace(/\b([A-Z]{2,})\b/g, (code) => code.toLowerCase());

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
          alt={t("brand.logoAlt")}
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
            {t("brand.appName")}
          </span>

          <span
            style={{
              fontSize: 11,
              opacity: 0.7,
            }}
          >
            {t("brand.by")}
          </span>

          <span
            style={{
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            {t("brand.signature")}
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
              fontWeight: 400,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {formatLanguageLabel(
              activeLanguage === "en"
                ? t("language.shortEn")
                : activeLanguage === "bg"
                ? t("language.shortBg")
                : t("language.shortIt")
            )}
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
                {formatLanguageLabel(t("language.it"))}
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
                {formatLanguageLabel(t("language.en"))}
              </button>

              <button
                onClick={() => {
                  i18n.changeLanguage("bg");
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
                {formatLanguageLabel(t("language.bg"))}
              </button>
            </div>
          )}
        </div>

        {isAdmin && (
          <Link to="/admin" style={linkStyle("/admin")}>
            {t("controlPanel")}
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
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t("logout")}
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
        <div className="mobile-language-zone">
          {/* BANDIERA MOBILE */}
          <div
            className="mobile-language-selector languageSelectorWrapper"
            style={{
              position: "relative",
              display: "none",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            <div className="mobile-language-trigger-wrapper">
              <button
                className="mobile-language-trigger languageButton"
                onClick={() => setLanguageOpen(!languageOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 400,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                <span className="languageButtonContent">
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>
                    {activeLanguage === "en"
                      ? "🇬🇧"
                      : activeLanguage === "bg"
                      ? "🇧🇬"
                      : "🇮🇹"}
                  </span>
                  <span style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
                    {(activeLanguage === "en"
                      ? t("language.codeEn")
                      : activeLanguage === "bg"
                      ? t("language.codeBg")
                      : t("language.codeIt")
                    ).toLowerCase()}
                  </span>
                </span>
              </button>
            </div>

            {languageOpen && (
              <div
                className="futureDropdownContainer"
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
                  {formatLanguageLabel(t("language.it"))}
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
                  {formatLanguageLabel(t("language.en"))}
                </button>

                <button
                  onClick={() => {
                    i18n.changeLanguage("bg");
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
                  {formatLanguageLabel(t("language.bg"))}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mobile-menu-trigger-zone">
          {/* MENU HAMBURGER MOBILE */}
          <button
            className="navbar-hamburger-mobile"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t("aria.openMenu")}
            style={{
              background: "none",
              border: "none",
              color: "#f5a623",
              fontSize: "26px",
              cursor: "pointer",
              padding: "6px 8px",
              marginLeft: 0,
              lineHeight: 1,
              borderRadius: "8px",
              display: "none",
            }}
          >
            ☰
          </button>
        </div>
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
            {t("controlPanel")}
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
            {t("logout")}
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
            width: 100% !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            padding: 4px 9px !important;
            min-height: 32px !important;
            background: rgba(8, 11, 18, 0.7) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px) saturate(130%);
            -webkit-backdrop-filter: blur(12px) saturate(130%);
            transform: translateZ(0);
            will-change: transform;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            z-index: 1200 !important;
          }

          .navbar-brand-block {
            gap: 6px !important;
            margin-right: 0 !important;
            align-items: center !important;
            transition: all 0.2s ease;
          }

          .navbar-logo {
            height: 56px !important;
            width: 56px !important;
            min-width: 56px !important;
            object-fit: contain !important;
            object-position: center !important;
            transform: translateY(0.5px);
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
            gap: 4px !important;
            flex-shrink: 0;
            transition: all 0.2s ease;
          }

          .mobile-language-zone,
          .mobile-menu-trigger-zone {
            display: flex;
            align-items: center;
          }

          .navbar-hamburger-mobile {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-width: 38px !important;
            min-height: 38px !important;
            padding: 7px 9px !important;
            margin-left: 0 !important;
            transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .mobile-language-selector {
            display: flex !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            align-items: center !important;
            transform: translateX(2px);
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
            gap: 6px !important;
            font-size: 14px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            padding: 8px 8px !important;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.03);
            transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .languageSelectorWrapper {
            overflow: visible;
          }

          .languageButton {
            min-height: 34px;
            min-width: 64px;
            justify-content: center;
          }

          .languageButtonContent {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            overflow: hidden;
          }

          .futureDropdownContainer {
            margin-top: 2px;
          }

          .mobile-menu {
            display: flex !important;
            z-index: 1300 !important;
            will-change: transform, opacity;
            contain: paint;
          }

          .mobile-menu-overlay {
            z-index: 1290 !important;
            transition: opacity 0.25s ease;
            will-change: opacity;
          }

          .mobile-menu-item:hover,
          .mobile-menu-item:active {
            background: rgba(245, 166, 35, 0.12);
          }

          .navbar-hamburger-mobile:active,
          .mobile-language-trigger:active {
            transform: scale(0.97);
            background: rgba(245, 166, 35, 0.12);
          }

          .mobile-language-trigger:hover {
            background: rgba(245, 166, 35, 0.08);
            border-color: rgba(245, 166, 35, 0.28);
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