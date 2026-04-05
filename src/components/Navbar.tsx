import "../App.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export default function Navbar() {
  const { user, isAdmin, loginAdminWithKey, logoutAdminKey } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    } as const;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    closeMobileMenu();
    navigate("/");
    window.location.reload();
  }

  function checkAdmin() {
    if (loginAdminWithKey(adminPass)) {
      setShowAdmin(false);
      closeMobileMenu();
      setAdminPass("");
      navigate("/admin");
    } else {
      alert("Password errata");
    }
  }

  function logoutAdmin() {
    logoutAdminKey();
    closeMobileMenu();
    navigate("/");
  }

  return (
    <nav
      className="nav-container"
      style={{
        position: "sticky",
        top: 0,
        background: "rgba(0,0,0,0.9)",
        color: "#fff",
        minHeight: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        zIndex: 1000,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="nav-logo"
        onClick={() => {
          closeMobileMenu();
          navigate("/");
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <img src="/logo.png" alt="Logo" className="logo" />
        <span
          style={{
            fontWeight: "bold",
            color: "#f5a623",
            fontSize: "clamp(1rem, 2.6vw, 1.25rem)",
            whiteSpace: "nowrap",
          }}
        >
          DrinkWise <span style={{ color: "#fff" }}>by</span> Lo Zio del Rum
        </span>
      </div>

      <div
        className="nav-menu-desktop"
        style={{
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/mappa" style={linkStyle("/mappa")}>Mappa</Link>
        <Link to="/drink" style={linkStyle("/drink")}>Drink</Link>
        <Link to="/vini" style={linkStyle("/vini")}>Vini</Link>
        <Link to="/magazine" style={linkStyle("/magazine")}>Magazine</Link>
        <Link to="/community" style={linkStyle("/community")}>Community</Link>
        <Link to="/crea" style={linkStyle("/crea")}>Crea</Link>

        {isAdmin && (
          <Link to="/admin" style={{ ...linkStyle("/admin"), color: "#f5a623", fontWeight: 700 }}>
            Pannello di Controllo
          </Link>
        )}

        {!isAdmin ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAdmin(true);
              closeMobileMenu();
            }}
            style={{
              background: "none",
              border: "none",
              color: "#f5a623",
              fontSize: "20px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            🔑
          </button>
        ) : (
          <button
            onClick={logoutAdmin}
            style={{
              background: "#f5a623",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#111",
            }}
          >
            Esci
          </button>
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
            }}
          >
            Logout
          </button>
        )}
      </div>

      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Apri menu"
        style={{
          background: "none",
          border: "none",
          color: "#f5a623",
          fontSize: "28px",
          cursor: "pointer",
          padding: 0,
        }}
      >
        ☰
      </button>

      {menuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu} />}

      <div
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 70,
          right: menuOpen ? 0 : "-100%",
          width: "100%",
          maxWidth: "320px",
          height: "calc(100vh - 70px)",
          background: "rgba(0,0,0,0.97)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: "18px",
          zIndex: 1100,
          transition: "right 0.3s ease",
          overflowY: "auto",
          borderLeft: "1px solid #333",
        }}
      >
        <Link to="/" onClick={closeMobileMenu} style={{ ...linkStyle("/"), padding: "12px 0", borderBottom: "1px solid #333" }}>Home</Link>
        <Link to="/mappa" onClick={closeMobileMenu} style={{ ...linkStyle("/mappa"), padding: "12px 0", borderBottom: "1px solid #333" }}>Mappa</Link>
        <Link to="/drink" onClick={closeMobileMenu} style={{ ...linkStyle("/drink"), padding: "12px 0", borderBottom: "1px solid #333" }}>Drink</Link>
        <Link to="/vini" onClick={closeMobileMenu} style={{ ...linkStyle("/vini"), padding: "12px 0", borderBottom: "1px solid #333" }}>Vini</Link>
        <Link to="/magazine" onClick={closeMobileMenu} style={{ ...linkStyle("/magazine"), padding: "12px 0", borderBottom: "1px solid #333" }}>Magazine</Link>
        <Link to="/community" onClick={closeMobileMenu} style={{ ...linkStyle("/community"), padding: "12px 0", borderBottom: "1px solid #333" }}>Community</Link>
        <Link to="/crea" onClick={closeMobileMenu} style={{ ...linkStyle("/crea"), padding: "12px 0", borderBottom: "1px solid #333" }}>Crea</Link>

        {isAdmin && (
          <Link to="/admin" onClick={closeMobileMenu} style={{ color: "#f5a623", fontWeight: 700, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid #333" }}>
            Pannello di Controllo
          </Link>
        )}

        {!isAdmin ? (
          <button
            onClick={() => {
              setShowAdmin(true);
              closeMobileMenu();
            }}
            style={{
              marginTop: "14px",
              background: "none",
              border: "1px solid #f5a623",
              color: "#f5a623",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Accesso Admin
          </button>
        ) : (
          <button
            onClick={logoutAdmin}
            style={{
              marginTop: "14px",
              background: "#f5a623",
              border: "none",
              color: "#111",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Esci Admin
          </button>
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

      {showAdmin && (
        <div
          className="admin-modal"
          style={{
            position: "absolute",
            top: "70px",
            right: "max(16px, 3vw)",
            width: "min(92vw, 200px)",
            background: "#111",
            padding: "20px",
            borderRadius: "10px",
            zIndex: 1200,
            boxShadow: "0 0 10px rgba(0,0,0,0.6)",
          }}
        >
          <input
            type="password"
            placeholder="Password Amministratore"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            style={{
              padding: "10px",
              marginBottom: "10px",
              width: "100%",
              borderRadius: "6px",
              border: "none",
              display: "block",
              margin: "0 auto 10px auto",
              fontSize: "12px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setShowAdmin(false)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Annulla
            </button>

            <button
              onClick={checkAdmin}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                background: "#f5a623",
                color: "#111",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}