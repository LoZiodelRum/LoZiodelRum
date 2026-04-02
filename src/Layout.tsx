import { useNavigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext";

export default function Layout() {
  const navigate = useNavigate();
  const { user, role, loading } = useUser();

  if (loading) return null;

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
          padding: "0 40px",
          zIndex: 9999,
        }}
      >
        {/* LOGO */}
        <div
          style={{
            fontWeight: "bold",
            color: "#f5a623",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          Lo Zio del Rum
        </div>

        {/* MENU */}
        <div style={{ display: "flex", gap: 25 }}>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            Home
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => navigate("/mappa")}>
            Mappa
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => navigate("/drink")}>
            Drink
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => navigate("/magazine")}>
            Magazine
          </span>

          {/* SOLO UTENTI LOGGATI */}
          {user && (
            <>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/community")}>
                Community
              </span>

              <span style={{ cursor: "pointer" }} onClick={() => navigate("/crea")}>
                Crea
              </span>
            </>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
              Dashboard
            </span>
          )}
        </div>
      </div>

      {/* CONTENUTO */}
      <div style={{ paddingTop: 70 }}>
        <Outlet />
      </div>
    </div>
  );
}