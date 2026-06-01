import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function LogoutSymbol({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const LANGUAGE_OPTIONS = [
  { code: "it", shortLabel: "it", desktopLabel: "🇮🇹 it", mobileLabel: "🇮🇹 IT" },
  { code: "en", shortLabel: "en", desktopLabel: "🇬🇧 en", mobileLabel: "🇬🇧 EN" },
  { code: "de", shortLabel: "de", desktopLabel: "🇩🇪 de", mobileLabel: "🇩🇪 DE" },
  { code: "es", shortLabel: "es", desktopLabel: "🇪🇸 es", mobileLabel: "🇪🇸 ES" },
  { code: "bg", shortLabel: "bg", desktopLabel: "🇧🇬 bg", mobileLabel: "🇧🇬 BG" },
  { code: "fr", shortLabel: "fr", desktopLabel: "🇫🇷 fr", mobileLabel: "🇫🇷 FR" },
] as const;

export default function Navbar() {
  const { user, isAdmin, role } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [languageOpen, setLanguageOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [profileRoleFallback, setProfileRoleFallback] = useState("");

  const { t, i18n } = useTranslation("navbar");
  const normalizedLanguage = String(i18n.language || "it").toLowerCase();
  const activeLanguage = normalizedLanguage.startsWith("en")
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
  const activeLanguageOption = LANGUAGE_OPTIONS.find((option) => option.code === activeLanguage) || LANGUAGE_OPTIONS[0];

  function closeLanguageMenu() {
    setLanguageOpen(false);
  }

  function closeDashboardMenu() {
    setDashboardOpen(false);
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
  const bartenderRoles = ["bartender"];
  const adminRoles = ["admin", "amministratore"];
  const normalizedProfileFallbackRole = normalizeRole(profileRoleFallback);
  const hasOwnerRole =
    ownerRoles.includes(normalizedRole) ||
    ownerRoles.includes(normalizedProfileFallbackRole);
  const hasBartenderRole =
    bartenderRoles.includes(normalizedRole) ||
    bartenderRoles.includes(normalizedProfileFallbackRole);
  const hasAdminRole =
    isAdmin ||
    adminRoles.includes(normalizedRole) ||
    adminRoles.includes(normalizedProfileFallbackRole);

  const OWNER_DASHBOARD_PATH = "/proprietario";
  // Keep configured path explicit; if project adds this route later, navbar is already wired.
  const BARTENDER_DASHBOARD_PATH = "/dashboard-bartender";
  const ADMIN_DASHBOARD_PATH = "/admin";

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

  const dashboardItems = hasAdminRole
    ? [
        { id: "admin", label: "Dashboard Admin", path: ADMIN_DASHBOARD_PATH },
        { id: "owner", label: "Dashboard Proprietario", path: OWNER_DASHBOARD_PATH },
        { id: "bartender", label: "Dashboard Bartender", path: BARTENDER_DASHBOARD_PATH },
      ]
    : hasOwnerRole
    ? [{ id: "owner", label: "Dashboard Proprietario", path: OWNER_DASHBOARD_PATH }]
    : hasBartenderRole
    ? [{ id: "bartender", label: "Dashboard Bartender", path: BARTENDER_DASHBOARD_PATH }]
    : [];

  const shouldShowDashboard = dashboardItems.length > 0;
  const isAnyDashboardActive = dashboardItems.some((item) => isActive(item.path));

  function handleDashboardNavigate(path: string) {
    closeLanguageMenu();
    closeDashboardMenu();
    navigate(path);
  }

  async function handleLogout() {
    closeLanguageMenu();
    closeDashboardMenu();
    await supabase.auth.signOut();
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
          closeLanguageMenu();
          closeDashboardMenu();

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
        {shouldShowDashboard && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setDashboardOpen((prev) => !prev);
                setLanguageOpen(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: isAnyDashboardActive ? "#f5a623" : "#fff",
                cursor: "pointer",
                fontWeight: isAnyDashboardActive ? 700 : 400,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: 0,
              }}
            >
              Dashboard {hasAdminRole ? "▼" : ""}
            </button>

            {hasAdminRole && dashboardOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  right: 0,
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: "10px",
                  overflow: "hidden",
                  minWidth: "220px",
                  zIndex: 9999,
                }}
              >
                {dashboardItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDashboardNavigate(item.path)}
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
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SELETTORE LINGUA DESKTOP */}
        <div
          style={{
            position: "relative",
          }}
        >
          <button
            onClick={() => {
              setDashboardOpen(false);
              setLanguageOpen(!languageOpen);
            }}
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
            {activeLanguageOption.desktopLabel}
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
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  onClick={() => {
                    i18n.changeLanguage(option.code);
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
                  {option.desktopLabel}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label={t("logout")}
          title={t("logout")}
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            border: "1px solid rgba(245,166,35,0.28)",
            background: "rgba(245,166,35,0.08)",
            color: "#f5a623",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LogoutSymbol size={28} />
        </button>
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
        <div className="mobile-language-zone" style={{ display: "flex", alignItems: "center", marginRight: 0 }}>
          <div className="mobile-language-selector">
            <div className="mobile-language-trigger-wrapper">
              <button
                className="mobile-language-trigger"
                aria-label={t("aria.languageSelector")}
                onClick={() => {
                  setDashboardOpen(false);
                  setLanguageOpen((prev) => !prev);
                }}
                style={{
                  background: "rgba(0,0,0,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  borderRadius: "10px",
                  fontSize: 13,
                  padding: "6px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  minWidth: 68,
                  zIndex: 1201,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>
                  {activeLanguage === "it"
                    ? "🇮🇹"
                    : activeLanguage === "en"
                    ? "🇬🇧"
                    : activeLanguage === "de"
                    ? "🇩🇪"
                    : activeLanguage === "es"
                    ? "🇪🇸"
                    : activeLanguage === "bg"
                    ? "🇧🇬"
                    : activeLanguage === "fr"
                    ? "🇫🇷"
                    : "🌐"}
                </span>
                <span style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.3 }}>{activeLanguage}</span>
                <span style={{ fontSize: 10, marginLeft: 1, opacity: 0.8 }}>▼</span>
              </button>
              {languageOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 42,
                    right: 0,
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 10,
                    overflow: "hidden",
                    minWidth: 104,
                    zIndex: 2000,
                    boxShadow: "0 6px 32px #000b",
                  }}
                >
                  {LANGUAGE_OPTIONS.map(({ code, mobileLabel: label }) => (
                    <button
                      key={code}
                      onClick={() => {
                        i18n.changeLanguage(code);
                        setLanguageOpen(false);
                      }}
                      style={{
                        width: "100%",
                        background: activeLanguage === code ? "rgba(245,166,35,0.18)" : "transparent",
                        border: "none",
                        color: "#fff",
                        padding: "9px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: activeLanguage === code ? 700 : 400,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderLeft: activeLanguage === code ? "3px solid #f5a623" : "3px solid transparent",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mobile-logout-zone">
          <button
            type="button"
            className="navbar-logout-mobile"
            onClick={handleLogout}
            aria-label={t("logout")}
            title={t("logout")}
            style={{
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.28)",
              color: "#f5a623",
              cursor: "pointer",
              padding: 0,
              marginLeft: 0,
              lineHeight: 1,
              borderRadius: "10px",
              display: "none",
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogoutSymbol size={16} />
          </button>
        </div>
      </div>

      {shouldShowDashboard && (
        <div className="mobile-dashboard-floating">
          <button
            type="button"
            className="mobile-dashboard-trigger"
            aria-label="Dashboard menu"
            onClick={() => {
              setLanguageOpen(false);
              setDashboardOpen((prev) => !prev);
            }}
          >
            Dashboard ▼
          </button>

          {dashboardOpen && (
            <div className="mobile-dashboard-dropdown">
              {dashboardItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDashboardNavigate(item.path)}
                  className="mobile-dashboard-item"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STYLE RESPONSIVE */}
      <style>{`
        html,
        body,
        #root {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }

        .mobile-dashboard-floating {
          display: none;
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
            gap: 8px !important;
            flex-shrink: 0;
            transition: all 0.2s ease;
          }

          .mobile-dashboard-floating {
            display: block;
            position: absolute;
            top: calc(100% + 6px);
            right: 0;
            z-index: 1305;
          }

          .mobile-dashboard-trigger {
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(7, 11, 18, 0.9);
            color: #fff;
            border-radius: 10px;
            padding: 6px 10px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
          }

          .mobile-dashboard-dropdown {
            position: absolute;
            top: 40px;
            right: 0;
            min-width: 220px;
            background: #111;
            border: 1px solid rgba(255,255,255,0.10);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 6px 32px #000b;
            z-index: 2000;
          }

          .mobile-dashboard-item {
            width: 100%;
            background: transparent;
            border: none;
            color: #fff;
            padding: 10px 12px;
            text-align: left;
            cursor: pointer;
            font-size: 13px;
          }

          .mobile-language-zone,
          .mobile-logout-zone {
            display: flex;
            align-items: center;
          }

          .mobile-language-zone {
            position: relative;
          }

          .navbar-logout-mobile {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 34px !important;
            height: 34px !important;
            padding: 0 !important;
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
            font-size: 13px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            padding: 6px 8px !important;
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

          .navbar-logout-mobile:active,
          .mobile-language-trigger:active {
            transform: scale(0.97);
            background: rgba(245, 166, 35, 0.12);
          }

          .mobile-language-trigger:hover {
            background: rgba(245, 166, 35, 0.08);
            border-color: rgba(245, 166, 35, 0.28);
          }
        }

        @media (min-width: 901px) {
          .navbar-links-desktop {
            display: flex !important;
          }

          .mobile-nav-controls {
            display: none !important;
          }

          .mobile-dashboard-floating {
            display: none !important;
          }

          .navbar-logout-mobile {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}