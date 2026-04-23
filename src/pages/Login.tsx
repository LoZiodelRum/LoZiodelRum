import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  // Registrazione rimossa

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const email = `${username}@loziodelrum.it`;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Login response:", { data, error });
      if (error) {
        setMsg(error.message || "Credenziali non valide");
        setLoading(false);
        return;
      }
      if (!data || !data.session) {
        setMsg("Login fallito: nessuna sessione attiva");
        setLoading(false);
        return;
      }
      setLoading(false);
      navigate("/home");
    } catch (err: any) {
      setMsg("Errore di rete o server: " + (err?.message || err));
      setLoading(false);
      console.error("Login error:", err);
    }
  }

  // Funzione registrazione rimossa

  return (
    <div className="auth-bg" style={{ minHeight: "100vh", background: "#181818", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
      {/* BLOCCO LOGIN PRINCIPALE */}
      <div className="auth-card" style={{ width: "100%", maxWidth: 370, background: "#000", borderRadius: 16, boxShadow: "0 4px 32px #0006", padding: "24px 12px 32px 12px", margin: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="Lo Zio del Rum" style={{ width: 128, height: 128, objectFit: "contain", marginBottom: 12 }} />
            <span style={{ color: "#FFD36A", fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 2 }}>DrinkWise</span>
            <span style={{ color: "#fff", fontSize: 16 }}>by Lo Zio del Rum</span>
          </div>
        </div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 36, marginBottom: 8, textAlign: "center" }}>Bentornato</div>
        <div style={{ color: "#ccc", fontSize: 18, marginBottom: 24, textAlign: "center" }}>Accedi per esplorare i migliori locali.</div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <input
              style={{ width: 220, maxWidth: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8, height: 40, boxSizing: "border-box", display: "block", marginLeft: "auto", marginRight: "auto" }}
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              inputMode="text"
            />
            <div style={{ position: "relative" }}>
              <input
                type="password"
                style={{ width: 220, maxWidth: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 16, height: 40, boxSizing: "border-box", display: "block", marginLeft: "auto", marginRight: "auto" }}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                inputMode="text"
              />
            </div>
          </div>
          <button style={{ width: 200, maxWidth: "100%", background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 18, border: "none", borderRadius: 10, padding: "10px 0", margin: "12px auto 16px auto", display: "block", touchAction: "manipulation" }}>
            {loading ? "..." : "Entra nel Club"}
          </button>
        </form>
        {/* Registrazione rimossa */}
        {msg && <div style={{ color: "#FFD36A", marginTop: 12, textAlign: "center" }}>{msg}</div>}
      </div>

      {/* Registrazione rimossa */}
    </div>
  );
}
