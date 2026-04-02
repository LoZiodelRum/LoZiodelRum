import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export default function Navbar() {
  const { user, role } = useUser();
  const navigate = useNavigate();

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  }

  function checkAdmin() {
    if (adminPass === "850877") {
      localStorage.setItem("isAdmin", "true");
      setShowAdmin(false);
      setAdminPass("");
      window.location.reload();
    } else {
      alert("Password errata");
    }
  }

  function logoutAdmin() {
    localStorage.removeItem("isAdmin");
    window.location.reload();
  }

  return (
    <nav
      style={{
        background: "#000",
        color: "#fff",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        zIndex: 1000,
      }}
    >
      {/* LOGO */}
      <Link
        to="/"
        style={{
          color: "#f5a623",
          fontWeight: "bold",
          fontSize: "20px",
          textDecoration: "none",
        }}
      >
        DrinkWise by Lo Zio del Rum
      </Link>

      {/* MENU */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/mappa" style={{ color: "#fff", textDecoration: "none" }}>
          Mappa
        </Link>

        <Link to="/drink" style={{ color: "#fff", textDecoration: "none" }}>
          Drink
        </Link>

        <Link to="/magazine" style={{ color: "#fff", textDecoration: "none" }}>
          Magazine
        </Link>

        <Link to="/community" style={{ color: "#fff", textDecoration: "none" }}>
          Community
        </Link>

        <Link to="/crea" style={{ color: "#fff", textDecoration: "none" }}>
          Crea
        </Link>

        {/* ADMIN LINK */}
        {isAdmin && (
          <Link
            to="/admin"
            style={{
              color: "#f5a623",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Pannello di Controllo
          </Link>
        )}

        {/* 🔑 CONTROLLO ADMIN */}
        {!isAdmin ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAdmin(true);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#f5a623",
              fontSize: "20px",
              cursor: "pointer",
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
            }}
          >
            Esci
          </button>
        )}

        {/* LOGOUT UTENTE */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* MODAL ADMIN */}
      {showAdmin && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "30px",
            background: "#111",
            padding: "20px",
            borderRadius: "10px",
            zIndex: 9999,
            boxShadow: "0 0 10px rgba(0,0,0,0.6)",
          }}
        >
          <input
            type="password"
            placeholder="Password admin"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            style={{
              padding: "10px",
              marginBottom: "10px",
              width: "200px",
              borderRadius: "6px",
              border: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
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