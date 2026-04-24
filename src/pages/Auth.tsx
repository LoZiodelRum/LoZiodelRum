
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import Navbar from "../components/Navbar";

export default function Auth() {
  const navigate = useNavigate();
  const [stepRegistrazione, setStepRegistrazione] = useState<"scelta" | "form" | "ruolo" | null>(null);
  const [ruoloSelezionato, setRuoloSelezionato] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [esperienze, setEsperienze] = useState("");
  const [specialita, setSpecialita] = useState("");
  const [citta, setCitta] = useState("");
  const [social, setSocial] = useState("");
  const [nomeLocale, setNomeLocale] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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
          recoverMessage.includes("row-level") ||
          recoverMessage.includes("violates row-level security");
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

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const email = `${username}@loziodelrum.it`;
    let user: any = null;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered")) {
        const login = await supabase.auth.signInWithPassword({ email, password });
        if (login.error) {
          setMsg("Utente già registrato, password errata");
          setLoading(false);
          return;
        }
        user = login.data.user;
      } else {
        setMsg(error.message);
        setLoading(false);
        return;
      }
    } else {
      user = data.user;
    }
    if (!user) {
      setMsg("Errore registrazione");
      setLoading(false);
      return;
    }
    const ruoloFinale = username === "maurizio" ? "admin" : "utente";
    const { data: existingProfile } = await supabase
      .from("Profili")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!existingProfile) {
      const { error: insertError } = await supabase.from("Profili").insert([
        {
          id: user.id,
          nome,
          cognome,
          username,
          email,
          ruolo: ruoloFinale,
          approvato: false,
          avatar_url: null,
          bio_breve: null,
          telefono: null,
          city: null,
          level: 1,
          points: 0,
          badges: [],
          esperienze_principali: null,
          specialita: null,
          citta_operativa: null,
          social_links: null,
          nome_locale: null,
          indirizzo: null,
          created_at: new Date().toISOString(),
        },
      ]);
      if (insertError) {
        setMsg(insertError.message);
        setLoading(false);
        return;
      }
    }
    setStepRegistrazione("ruolo");
    setLoading(false);
  }

  async function handleRuoloSelect(selectedRuolo: string) {
    setLoading(true);
    setMsg("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setMsg("Errore recupero utente");
      setLoading(false);
      return;
    }
    let updateData: any = { ruolo: selectedRuolo };
    if (selectedRuolo === "bartender") {
      updateData = {
        ...updateData,
        esperienze_principali: esperienze,
        specialita,
        citta_operativa: citta,
        social_links: social,
      };
    }
    if (selectedRuolo === "proprietario") {
      updateData = {
        ...updateData,
        nome_locale: nomeLocale,
        indirizzo,
        telefono,
      };
    }
    const { error } = await supabase
      .from("Profili")
      .update(updateData)
      .eq("id", user.id);
    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
    setMsg("Registrazione completata");
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1000);
  }

  return (
    <>
      <Navbar />
      <div className="auth-bg" style={{ minHeight: "100vh", background: "#181818", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", paddingTop: 90 }}>
        {/* BLOCCO LOGIN PRINCIPALE */}
        <div className="auth-card" style={{ width: 370, background: "#000", borderRadius: 16, boxShadow: "0 4px 32px #0006", padding: 36, display: stepRegistrazione ? "none" : "block" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="Lo Zio del Rum" style={{ width: 180, height: 180, objectFit: "contain", borderRadius: "50%", background: "none", marginBottom: 8, boxShadow: "0 2px 12px #0007" }} />
            <div style={{ color: "#ccc", fontStyle: "italic", fontSize: 16, marginBottom: 24 }}>
              "Lo Zio del Rum approva"
            </div>
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 36, marginBottom: 8 }}>Bentornato</div>
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
            <button style={{ width: "100%", background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 22, border: "none", borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 16, boxShadow: "0 4px 0 #b48a2c" }}>
              {loading ? "..." : "Entra nel Club"}
            </button>
          </form>
          <div style={{ textAlign: "center", color: "#fff", fontSize: 17, marginBottom: 8 }}>
            Non hai un account?
            <span
              style={{ color: "#FFD36A", fontWeight: 700, marginLeft: 4, cursor: "pointer" }}
              onClick={() => setStepRegistrazione("scelta")}
            >
              Registrati ora
            </span>
          </div>
          <div style={{ textAlign: "center", color: "#444", fontSize: 13, letterSpacing: 2, marginTop: 24 }}>
            CRAFTED FOR SPIRITS LOVERS
          </div>
          {msg && <div style={{ color: "#FFD36A", marginTop: 12, textAlign: "center" }}>{msg}</div>}
        </div>

        {/* POPUP SCELTA RUOLO */}
        {stepRegistrazione === "scelta" && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#181818", borderRadius: 18, padding: 36, minWidth: 340, boxShadow: "0 8px 32px #000a", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 30, marginBottom: 8 }}>Registrati</div>
              <div style={{ color: "#ccc", fontSize: 18, marginBottom: 24 }}>Scegli il tuo ruolo</div>
              <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
                <button style={{ background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 20, border: "none", borderRadius: 10, padding: "12px 24px", boxShadow: "0 2px 0 #b48a2c" }}
                  onClick={() => { setRuoloSelezionato("utente"); setStepRegistrazione("form"); }}>
                  Utente
                </button>
                <button style={{ background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 20, border: "none", borderRadius: 10, padding: "12px 24px", boxShadow: "0 2px 0 #b48a2c" }}
                  onClick={() => { setRuoloSelezionato("bartender"); setStepRegistrazione("form"); }}>
                  Bartender
                </button>
                <button style={{ background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 20, border: "none", borderRadius: 10, padding: "12px 24px", boxShadow: "0 2px 0 #b48a2c" }}
                  onClick={() => { setRuoloSelezionato("proprietario"); setStepRegistrazione("form"); }}>
                  Proprietario
                </button>
              </div>
              <button style={{ background: "none", color: "#FFD36A", border: "none", fontSize: 16, marginTop: 8, cursor: "pointer" }} onClick={() => setStepRegistrazione(null)}>Annulla</button>
            </div>
          </div>
        )}

        {/* FORM REGISTRAZIONE */}
        {stepRegistrazione === "form" && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#181818", borderRadius: 18, padding: 36, minWidth: 340, boxShadow: "0 8px 32px #000a", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 30, marginBottom: 8 }}>Registrazione</div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setMsg("");
                const email = `${username}@loziodelrum.it`;
                let user: any = null;
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) {
                  setMsg(error.message);
                  setLoading(false);
                  return;
                }
                user = data.user;
                if (!user) {
                  setMsg("Errore registrazione");
                  setLoading(false);
                  return;
                }
                // Salva profilo con ruolo scelto
                const profilo = {
                  id: user.id,
                  nome,
                  cognome,
                  username,
                  email,
                  ruolo: ruoloSelezionato,
                  approvato: false,
                  avatar_url: null,
                  bio_breve: null,
                  telefono: ruoloSelezionato === "proprietario" ? telefono : null,
                  city: null,
                  level: 1,
                  points: 0,
                  badges: [],
                  esperienze_principali: ruoloSelezionato === "bartender" ? esperienze : null,
                  specialita: ruoloSelezionato === "bartender" ? specialita : null,
                  citta_operativa: ruoloSelezionato === "bartender" ? citta : null,
                  social_links: ruoloSelezionato === "bartender" ? social : null,
                  nome_locale: ruoloSelezionato === "proprietario" ? nomeLocale : null,
                  indirizzo: ruoloSelezionato === "proprietario" ? indirizzo : null,
                  created_at: new Date().toISOString(),
                };
                const { error: insertError } = await supabase.from("Profili").insert([profilo]);
                if (insertError) {
                  setMsg(insertError.message);
                  setLoading(false);
                  return;
                }
                setMsg("Registrazione completata! Ora puoi accedere.");
                setTimeout(() => {
                  setStepRegistrazione(null);
                  setRuoloSelezionato(null);
                }, 1200);
                setLoading(false);
              }} style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
                <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                <input placeholder="Cognome" value={cognome} onChange={e => setCognome(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                {ruoloSelezionato === "bartender" && (
                  <>
                    <input placeholder="Esperienze" value={esperienze} onChange={e => setEsperienze(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                    <input placeholder="Specialità" value={specialita} onChange={e => setSpecialita(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                    <input placeholder="Città" value={citta} onChange={e => setCitta(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                    <input placeholder="Social" value={social} onChange={e => setSocial(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                  </>
                )}
                {ruoloSelezionato === "proprietario" && (
                  <>
                    <input placeholder="Nome locale" value={nomeLocale} onChange={e => setNomeLocale(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                    <input placeholder="Indirizzo" value={indirizzo} onChange={e => setIndirizzo(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                    <input placeholder="Telefono" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "none", background: "#222", color: "#fff", fontSize: 17 }} />
                  </>
                )}
                <button style={{ background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 20, border: "none", borderRadius: 10, padding: "14px 0", marginTop: 8, boxShadow: "0 2px 0 #b48a2c" }}>
                  {loading ? "..." : "Registrati"}
                </button>
                <button type="button" style={{ background: "none", color: "#FFD36A", border: "none", fontSize: 16, marginTop: 8, cursor: "pointer" }} onClick={() => { setStepRegistrazione(null); setRuoloSelezionato(null); }}>Annulla</button>
                {msg && <div style={{ color: "#FFD36A", marginTop: 8, textAlign: "center" }}>{msg}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}