
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import RegisterModal from "../components/RegisterModal";


function Auth() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);


  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const loginRaw = username.trim();
    const loginValue = loginRaw.toLowerCase();
    const candidateEmails: string[] = [];
    console.log("Tentativo login con:", loginRaw);
    if (loginValue.includes("@")) {
      candidateEmails.push(loginValue);
    } else {
      // Cerca email per username
      const { data: profileByUsername, error } = await supabase
        .from("Profili")
        .select("email")
        .eq("username", loginRaw)
        .maybeSingle();
      console.log("Risultato ricerca username:", profileByUsername, error);
      const resolvedEmail = String(profileByUsername?.email || "").trim().toLowerCase();
      if (resolvedEmail) {
        candidateEmails.push(resolvedEmail);
      }
      candidateEmails.push(`${loginRaw}@loziodelrum.it`);
      candidateEmails.push(`${loginValue}@loziodelrum.it`);
    }
    const uniqueCandidateEmails = [...new Set(candidateEmails.map((value) => value.trim().toLowerCase()).filter(Boolean))];
    let data: any = null;
    let error: any = null;
    for (const email of uniqueCandidateEmails) {
      const attempt = await supabase.auth.signInWithPassword({ email, password });
      if (!attempt.error && attempt.data?.user) {
        data = attempt.data;
        error = null;
        break;
      }
      error = attempt.error;
    }
    console.log("Risposta signInWithPassword:", data, error);
    if (error) {
      const rawError = String(error?.message || "");
      const lowerError = rawError.toLowerCase();
      if (lowerError.includes("email not confirmed")) {
        setMsg("Email non confermata. Apri il link ricevuto via email e riprova.");
      } else if (lowerError.includes("invalid login credentials")) {
        setMsg("Credenziali errate. Prova con email completa oppure username.");
      } else {
        setMsg(rawError || "Errore login");
      }
      setLoading(false);
      return;
    }
    const user = data.user;
    if (!user) {
      setMsg("Errore login");
      setLoading(false);
      return;
    }
    // Login riuscito, redirect
    setLoading(false);
    setMsg("");
    navigate("/home");
    console.log("Login effettuato con successo, reindirizzando a /home");
  }



  return (
    <>
      <style>{`
        .login-fullscreen-container {
          width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          background: #000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          z-index: 1000 !important;
        }
        .login-box {
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          background: #000 !important;
          border-radius: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 0 8px !important;
          box-shadow: none !important;
        }
        .login-input-mobile {
          width: 85vw !important;
          max-width: 420px !important;
        }
        @media (min-width: 601px) {
          .login-fullscreen-container {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            background: #000 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            z-index: 1000 !important;
          }
          .login-box {
            width: 100%;
            max-width: 420px;
            height: 100vh;
            background: #000;
            border-radius: 18px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 0 32px;
            box-shadow: 0 8px 32px #000a;
          }
          .login-input-mobile {
            width: 100% !important;
            max-width: 420px !important;
          }
        }
      `}</style>
      <div className="login-fullscreen-container">
        <div className="login-box">
          <img src="/logo-clean.png" alt="Lo Zio del Rum" style={{ width: 120, height: 120, objectFit: "contain", borderRadius: "50%", background: "none", marginBottom: 8 }} />
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 28, marginBottom: 8, textAlign: "center" }}>DrinkWise</div>
          <div style={{ color: "#ccc", fontSize: 15, marginBottom: 18, textAlign: "center" }}>Accedi per esplorare i migliori locali.</div>
          <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <input
              className="login-input-mobile"
              style={{ background: "#222", color: "#fff", border: "none", borderRadius: 16, padding: 12, fontSize: 18, marginBottom: 22, marginTop: 0, display: "block", textAlign: "center" }}
              placeholder="Email o Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <input
              type="password"
              className="login-input-mobile"
              style={{ background: "#222", color: "#fff", border: "none", borderRadius: 16, padding: 12, fontSize: 18, marginBottom: 28, display: "block", textAlign: "center" }}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div style={{ width: "25%", minWidth: 120, maxWidth: 220, display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#FFD36A", fontSize: 14, cursor: "pointer" }}>Dimenticata?</span>
            </div>
            {!showRegister && (
              <button
                type="submit"
                style={{
                  minWidth: 90,
                  maxWidth: 160,
                  width: "18%",
                  alignSelf: "center",
                  background: "#FFD36A",
                  color: "#181818",
                  fontWeight: 900,
                  fontSize: 18,
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 0",
                  marginTop: 0,
                  marginBottom: 12,
                  boxShadow: "none",
                  letterSpacing: 1,
                  transition: "background 0.2s, color 0.2s",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  display: "block",
                }}
                disabled={loading}
              >
                {loading ? "..." : "Entra"}
              </button>
            )}
          </form>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 15, marginBottom: 8 }}>
            Non hai un account?
            <span
              style={{ color: "#FFD36A", fontWeight: 700, marginLeft: 4, cursor: "pointer" }}
              onClick={() => setShowRegister(true)}
            >
              Registrati ora
            </span>
          </div>
          <div style={{ textAlign: "center", color: "#444", fontSize: 12, letterSpacing: 2, marginTop: 12 }}>
            CRAFTED FOR SPIRITS LOVERS
          </div>
          {msg && <div style={{ color: "#FFD36A", marginTop: 10, textAlign: "center" }}>{msg}</div>}
        </div>
      </div>
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </>
  );
}

export default Auth;