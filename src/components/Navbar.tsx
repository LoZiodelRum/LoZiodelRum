import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { user, isAdmin, role } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileRoleFallback, setProfileRoleFallback] = useState("");

  const { t, i18n } = useTranslation("navbar");
  const normalizedLanguage = String(i18n.language || "it").toLowerCase();
  const activeLanguage: "it" | "en" | "de" | "es" | "bg" | "fr" =
    normalizedLanguage.startsWith("en")
      ? "en"
      : normalizedLanguage.startsWith("de")
      ? "de"
      : normalizedLanguage.startsWith("es")
      ? "es"
      : normalizedLanguage.startsWith("bg")
      ? "bg"
      : normalizedLanguage.startsWith("fr")
      ? "fr"
      : "it";
  const formatLanguageLabel = (label: string) =>
    label.replace(/\b([A-Z]{2,})\b/g, (code) => code.toLowerCase());

  function closeMobileMenu() {
    setMenuOpen(false);
    setLanguageOpen(false);
  }

  function isActive(path: string | string[]) {
    const paths = Array.isArray(path) ? path : [path];
    return paths.some((entry) => {
      if (entry === "/") return location.pathname === "/";
      return location.pathname.startsWith(entry);
    });
  }

  function linkStyle(path: string | string[]) {
    return {
      color: isActive(path) ? "#f5a623" : "#fff",
      textDecoration: "none",
      fontWeight: isActive(path) ? 700 : 400,
    };
  }

  const normalizeRole = (value: unknown) => String(value || "").trim().toLowerCase();
  const normalizedRole = normalizeRole(
    role ||
    user?.ruolo ||
    user?.role ||
    user?.tipo ||
    user?.userRole ||
    user?.user_metadata?.ruolo ||
    user?.user_metadata?.role ||
    user?.user_metadata?.tipo ||
    user?.user_metadata?.userRole ||
    user?.app_metadata?.ruolo ||
    user?.app_metadata?.role ||
    "",
  );

  const ownerRoles = ["proprietario", "owner", "proprietari", "gestore", "locale", "proprietario locale"];
  const adminRoles = ["admin", "amministratore"];
  const normalizedProfileFallbackRole = normalizeRole(profileRoleFallback);
  const hasOwnerRole =
    ownerRoles.includes(normalizedRole) ||
    ownerRoles.includes(normalizedProfileFallbackRole);
  const hasAdminRole =
    isAdmin ||
    adminRoles.includes(normalizedRole) ||
    adminRoles.includes(normalizedProfileFallbackRole);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileRoleFallback() {
      if (!user) {
        if (!cancelled) setProfileRoleFallback("");
        return;
      }

      try {
        const userId = String(user?.id || "").trim();
        const userEmail = String(user?.email || "").trim().toLowerCase();
        const tableCandidates = ["Profili", "profili"];

        for (const table of tableCandidates) {
          if (userId) {
            const byId = await supabase.from(table).select("*").eq("id", userId).limit(1).maybeSingle();
            if (!byId.error && byId.data) {
              const fallbackRole = normalizeRole(
                byId.data?.ruolo || byId.data?.role || byId.data?.tipo || byId.data?.userRole || "",
              );
              if (!cancelled) setProfileRoleFallback(fallbackRole);
              return;
            }
          }

          if (userEmail) {
            const byEmail = await supabase.from(table).select("*").eq("email", userEmail).limit(1).maybeSingle();
            if (!byEmail.error && byEmail.data) {
              const fallbackRole = normalizeRole(
                byEmail.data?.ruolo || byEmail.data?.role || byEmail.data?.tipo || byEmail.data?.userRole || "",
              );
              if (!cancelled) setProfileRoleFallback(fallbackRole);
              return;
            }
          }
        }

        if (!cancelled) setProfileRoleFallback("");
      } catch (error) {
        console.error("[Navbar] Impossibile leggere ruolo profilo fallback:", error);
        if (!cancelled) setProfileRoleFallback("");
      }
    }

    loadProfileRoleFallback();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  const canAccessOwnerDashboard = hasOwnerRole || (location.pathname.startsWith("/proprietario") && !hasAdminRole);
  const canAccessAdminDashboard = hasAdminRole || location.pathname.startsWith("/admin");

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

        <Link to="/lounge" style={linkStyle(["/lounge", "/community"])}>
          Lounge
        </Link>

        {canAccessOwnerDashboard && (
          <Link to="/proprietario" style={linkStyle("/proprietario")}>
            Dashboard
          </Link>
        )}

        {canAccessAdminDashboard && (
          <Link to="/admin" style={linkStyle("/admin")}>
            Dashboard Admin
          </Link>
        )}

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
          Esci
        </button>

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
                : activeLanguage === "de"
                ? t("language.shortDe")
                : activeLanguage === "es"
                ? t("language.shortEs")
                : activeLanguage === "bg"
                ? t("language.shortBg")
                : activeLanguage === "fr"
                ? t("language.shortFr")
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
                  i18n.changeLanguage("de");
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
                {formatLanguageLabel(t("language.de"))}
              </button>

              <button
                onClick={() => {
                  i18n.changeLanguage("es");
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
                {formatLanguageLabel(t("language.es"))}
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

              <button
                onClick={() => {
                  i18n.changeLanguage("fr");
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
                {formatLanguageLabel(t("language.fr"))}
              </button>
            </div>
          )}
        </div>
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
          to="/lounge"
          onClick={closeMobileMenu}
          style={{
            ...linkStyle(["/lounge", "/community"]),
            padding: "13px 10px",
            borderRadius: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #333",
            transition: "all 0.2s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
            Lounge
        </Link>

        {canAccessOwnerDashboard && (
          <Link
            className="mobile-menu-item"
            to="/proprietario"
            onClick={closeMobileMenu}
            style={{
              ...linkStyle("/proprietario"),
              padding: "13px 10px",
              borderRadius: "10px",
              marginBottom: "4px",
              borderBottom: "1px solid #333",
              transition: "all 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Dashboard
          </Link>
        )}

        {canAccessAdminDashboard && (
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
            Dashboard Admin
          </Link>
        )}

        <div
          style={{
            marginTop: "10px",
            padding: "12px 10px 0",
            borderTop: "1px solid #333",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.62)",
              marginBottom: "10px",
            }}
          >
            Lingua
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => i18n.changeLanguage("it")}
              style={{
                background: activeLanguage === "it" ? "rgba(245,166,35,0.18)" : "#18181b",
                border: activeLanguage === "it" ? "1px solid rgba(245,166,35,0.55)" : "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {formatLanguageLabel(t("language.shortIt"))}
            </button>

            <button
              type="button"
              onClick={() => i18n.changeLanguage("en")}
              style={{
                background: activeLanguage === "en" ? "rgba(245,166,35,0.18)" : "#18181b",
                border: activeLanguage === "en" ? "1px solid rgba(245,166,35,0.55)" : "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {formatLanguageLabel(t("language.shortEn"))}
            </button>

            <button
              type="button"
              onClick={() => i18n.changeLanguage("de")}
              style={{
                background: activeLanguage === "de" ? "rgba(245,166,35,0.18)" : "#18181b",
                border: activeLanguage === "de" ? "1px solid rgba(245,166,35,0.55)" : "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {formatLanguageLabel(t("language.shortDe"))}
            </button>

            <button
              type="button"
              onClick={() => i18n.changeLanguage("es")}
              style={{
                background: activeLanguage === "es" ? "rgba(245,166,35,0.18)" : "#18181b",
                border: activeLanguage === "es" ? "1px solid rgba(245,166,35,0.55)" : "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {formatLanguageLabel(t("language.shortEs"))}
            </button>

            <button
              type="button"
              onClick={() => i18n.changeLanguage("bg")}
              style={{
                background: activeLanguage === "bg" ? "rgba(245,166,35,0.18)" : "#18181b",
                border: activeLanguage === "bg" ? "1px solid rgba(245,166,35,0.55)" : "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {formatLanguageLabel(t("language.shortBg"))}
            </button>

            <button
              type="button"
              onClick={() => i18n.changeLanguage("fr")}
              style={{
                background: activeLanguage === "fr" ? "rgba(245,166,35,0.18)" : "#18181b",
                border: activeLanguage === "fr" ? "1px solid rgba(245,166,35,0.55)" : "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {formatLanguageLabel(t("language.shortFr"))}
            </button>
          </div>
        </div>

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
          Esci
        </button>
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