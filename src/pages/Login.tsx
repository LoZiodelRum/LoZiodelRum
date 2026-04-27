import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  // Registrazione
  const [showRegister, setShowRegister] = useState(false);
  const [regNome, setRegNome] = useState("");
  const [regCognome, setRegCognome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regMsg, setRegMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    let email = username;
    if (!email.includes("@")) {
      email = `${username}@loziodelrum.it`;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegMsg("");
    if (!regNome || !regCognome || !regEmail || !regUsername || !regPassword) {
      setRegMsg("Compila tutti i campi");
      return;
    }
    if (!regEmail.includes("@")) {
      setRegMsg("Email non valida");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email: regEmail, password: regPassword });
      if (error) {
        setRegMsg(error.message);
        return;
      }
      const user = data.user;
      if (!user) {
        setRegMsg("Errore registrazione");
        return;
      }
      // Crea profilo
      await supabase.from("Profili").insert([
        {
          id: user.id,
          nome: regNome,
          cognome: regCognome,
          username: regUsername,
          email: regEmail,
          ruolo: "utente",
          approvato: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setRegMsg("Registrazione completata! Ora puoi accedere.");
      setTimeout(() => {
        setShowRegister(false);
        setRegNome(""); setRegCognome(""); setRegEmail(""); setRegUsername(""); setRegPassword(""); setRegMsg("");
      }, 1500);
    } catch (err: any) {
      setRegMsg("Errore di rete o server: " + (err?.message || err));
    }
  }

  // Funzione registrazione rimossa

  return (
    <div className="auth-bg" style={{ minHeight: "100vh", background: "#181818", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
      {/* BLOCCO LOGIN PRINCIPALE */}
      <div className="auth-card" style={{ width: "100%", maxWidth: 370, background: "#000", borderRadius: 16, boxShadow: "0 4px 32px #0006", padding: "24px 12px 32px 12px", margin: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img src="/logo-clean.png" alt="Lo Zio del Rum" style={{ width: 128, height: 128, objectFit: "contain", marginBottom: 12 }} />
          <span style={{ color: "#FFD36A", fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 2 }}>DrinkWise</span>
          <span style={{ color: "#fff", fontSize: 16 }}>by Lo Zio del Rum</span>
        </div>
        {showRegister ? (
          <>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 30, marginBottom: 8, textAlign: "center" }}>Registrazione</div>
            <form onSubmit={handleRegister} style={{ width: 320, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 12, margin: "0 auto" }}>
              <input placeholder="Nome" value={regNome} onChange={e => setRegNome(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
              <input placeholder="Cognome" value={regCognome} onChange={e => setRegCognome(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
              <input placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required type="email" style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
              <input placeholder="Username" value={regUsername} onChange={e => setRegUsername(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
              <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
              <button style={{ background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 20, border: "none", borderRadius: 10, padding: "14px 0", marginTop: 8 }}>
                {loading ? "..." : "Registrati"}
              </button>
              <button type="button" style={{ background: "none", color: "#FFD36A", border: "none", fontSize: 16, marginTop: 8, cursor: "pointer" }} onClick={() => { setShowRegister(false); setRegMsg(""); }}>Annulla</button>
              {regMsg && <div style={{ color: "#FFD36A", marginTop: 8, textAlign: "center" }}>{regMsg}</div>}
            </form>
          </>
        ) : (
          <>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 36, marginBottom: 8, textAlign: "center" }}>Bentornato</div>
            <div style={{ color: "#ccc", fontSize: 18, marginBottom: 24, textAlign: "center" }}>Accedi per esplorare i migliori locali.</div>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <input
                  style={{ width: 220, maxWidth: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8, height: 40, boxSizing: "border-box", display: "block", marginLeft: "auto", marginRight: "auto" }}
                  placeholder="Username o Email"
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
            <div style={{ textAlign: "center", color: "#fff", fontSize: 17, marginBottom: 8 }}>
              Non hai un account?
              <span
                style={{ color: "#FFD36A", fontWeight: 700, marginLeft: 4, cursor: "pointer" }}
                onClick={() => { setShowRegister(true); setMsg(""); }}
              >
                Registrati ora
              </span>
            </div>
            {msg && <div style={{ color: "#FFD36A", marginTop: 12, textAlign: "center" }}>{msg}</div>}
          </>
        )}
      </div>

      {/* Registrazione rimossa */}
    </div>
  );
}
