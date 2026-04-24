
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import RegisterModal from "../components/RegisterModal";

function Auth() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);


  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const loginRaw = username.trim();
    const loginValue = loginRaw.toLowerCase();
    const candidateEmails: string[] = [];
    if (loginValue.includes("@")) {
      candidateEmails.push(loginValue);
    } else {
      const { data: profileByUsername } = await supabase
        .from("Profili")
        .select("email")
        .ilike("username", loginRaw)
        .maybeSingle();
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
    const { data: profilo, error: profiloError } = await supabase
      .from("Profili")
      .select("ruolo")
      .eq("id", user.id)
      .maybeSingle();
    const profiloErrorMessage = String(profiloError?.message || "").toLowerCase();
    const profiloErrorCode = String((profiloError as any)?.code || "");
    const profileReadBlocked =
      profiloErrorCode === "42501" ||
      profiloErrorMessage.includes("permission") ||
      profiloErrorMessage.includes("row-level") ||
      profiloErrorMessage.includes("violates row-level security");
    const profileMissing = profiloErrorCode === "PGRST116";
    if (profiloError && !profileReadBlocked && !profileMissing) {
      setMsg("Errore verifica profilo");
      setLoading(false);
      return;
    }
    let effectiveProfile = profilo;
    if (!effectiveProfile) {
      const metadata = (user.user_metadata || {}) as Record<string, any>;
      const fallbackRuolo = String(metadata.ruolo || "utente");
      const fallbackProfile = {
        id: user.id,
        nome: String(metadata.nome || "").trim() || null,
        cognome: String(metadata.cognome || "").trim() || null,
        username: String(metadata.username || loginRaw || user.email?.split("@")[0] || "").trim() || null,
        email: String(user.email || "").trim().toLowerCase() || null,
        telefono: String(metadata.telefono || "").trim() || null,
        ruolo: fallbackRuolo,
      };
      const { data: recoveredProfile, error: recoverError } = await supabase
        .from("Profili")
        .upsert([fallbackProfile], { onConflict: "id" })
        .select("ruolo")
        .maybeSingle();
      if (recoverError) {
        const recoverMessage = String(recoverError?.message || "").toLowerCase();
        const recoverCode = String((recoverError as any)?.code || "");
        const recoverBlocked =
          recoverCode === "42501" ||
          recoverMessage.includes("permission") ||
          recoverMessage.includes("row-level");
        if (!recoverBlocked) {
          setMsg("Errore verifica profilo");
          setLoading(false);
          return;
        }
      }
      effectiveProfile = recoveredProfile || fallbackProfile;
    }
    navigate("/");
    window.location.reload();
  }



  return (
    <>
      <Navbar />
      <div className="auth-bg" style={{ minHeight: "100vh", background: "#181818", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", paddingTop: 90 }}>
        <div className="auth-card" style={{ width: 320, maxWidth: "90vw", background: "#000", borderRadius: 16, boxShadow: "0 4px 32px #0006", padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="Lo Zio del Rum" style={{ width: 180, height: 180, objectFit: "contain", borderRadius: "50%", background: "none", marginBottom: 8, boxShadow: "0 2px 12px #0007" }} />
            <div style={{ color: "#ccc", fontStyle: "italic", fontSize: 16, marginBottom: 24, textAlign: "center" }}>
              "Lo Zio del Rum ti aspetta"
            </div>
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 36, marginBottom: 8, textAlign: "center" }}>DrinkWise</div>
          <div style={{ color: "#ccc", fontSize: 18, marginBottom: 24 }}>Accedi per esplorare i migliori locali.</div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <input
                style={{ width: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 14, fontSize: 18, marginBottom: 8 }}
                placeholder="Email o Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  style={{ width: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 14, fontSize: 18 }}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <span style={{ position: "absolute", right: 16, top: 16, color: "#888", cursor: "pointer" }} title="Mostra password">👁️</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}>
                <span style={{ color: "#FFD36A", fontSize: 15, cursor: "pointer" }}>Dimenticata?</span>
              </div>
            </div>
            {!showRegister && (
              <button style={{ width: "100%", background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 22, border: "none", borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 16, boxShadow: "0 4px 0 #b48a2c" }}>
                {loading ? "..." : "Entra nel Club"}
              </button>
            )}
          </form>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 17, marginBottom: 8 }}>
            Non hai un account?
            <span
              style={{ color: "#FFD36A", fontWeight: 700, marginLeft: 4, cursor: "pointer" }}
              onClick={() => setShowRegister(true)}
            >
              Registrati ora
            </span>
          </div>
          <div style={{ textAlign: "center", color: "#444", fontSize: 13, letterSpacing: 2, marginTop: 24 }}>
            CRAFTED FOR SPIRITS LOVERS
          </div>
          {msg && <div style={{ color: "#FFD36A", marginTop: 12, textAlign: "center" }}>{msg}</div>}
        </div>
      </div>
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </>
  );
}

export default Auth;