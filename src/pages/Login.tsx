import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [stepRegistrazione, setStepRegistrazione] = useState<"scelta" | "form" | null>(null);
  const [ruoloSelezionato, setRuoloSelezionato] = useState<string | null>(null);
  // Registrazione fields
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [esperienze, setEsperienze] = useState("");
  const [specialita, setSpecialita] = useState("");
  const [citta, setCitta] = useState("");
  const [social, setSocial] = useState("");
  const [nomeLocale, setNomeLocale] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [telefono, setTelefono] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const email = `${username}@loziodelrum.it`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg("Credenziali non valide");
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate("/home");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const email = `${username}@loziodelrum.it`;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }
    const user = data.user;
    if (!user) {
      setMsg("Errore registrazione");
      setLoading(false);
      return;
    }
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
  }

  return (
    <div className="auth-bg" style={{ minHeight: "100vh", background: "#181818", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* BLOCCO LOGIN PRINCIPALE */}
      <div className="auth-card" style={{ width: 370, background: "#000", borderRadius: 16, boxShadow: "0 4px 32px #0006", padding: 36, display: stepRegistrazione ? "none" : "block" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo.png" alt="Lo Zio del Rum" style={{ width: 128, height: 128, objectFit: "contain" }} />
          </div>
          <div style={{ color: "#ccc", fontStyle: "italic", fontSize: 16, marginBottom: 24 }}>
            "Lo Zio del Rum approva"
          </div>
        </div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 36, marginBottom: 8 }}>Bentornato</div>
        <div style={{ color: "#ccc", fontSize: 18, marginBottom: 24 }}>Accedi per esplorare i migliori locali.</div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <input
              style={{ width: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 8, fontSize: 15, marginBottom: 8, height: 36 }}
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <div style={{ position: "relative" }}>
              <input
                type="password"
                style={{ width: "100%", background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: 8, fontSize: 15, height: 36 }}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <button style={{ width: "100%", background: "#FFD36A", color: "#181818", fontWeight: 700, fontSize: 18, border: "none", borderRadius: 10, padding: "10px 0", marginTop: 12, marginBottom: 16 }}>
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
            <form onSubmit={handleRegister} style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
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
  );
}
