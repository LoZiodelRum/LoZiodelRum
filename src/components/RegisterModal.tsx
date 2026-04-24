import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  if (!open) return null;

  const validForm =
    nome.trim() &&
    cognome.trim() &&
    username.trim() &&
    telefono.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === confirmPassword &&
    usernameAvailable === true;

  async function checkUsername(val: string) {
    setUsername(val);
    if (val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const { data } = await supabase
      .from("Profili")
      .select("id")
      .eq("username", val)
      .maybeSingle();
    setUsernameAvailable(!data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    // 1. Prova registrazione utente su Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          cognome,
          username,
          telefono,
        },
      },
    });
    let userId = authData?.user?.id;
    if (authError && !authError.message.toLowerCase().includes("already registered") && !authError.message.toLowerCase().includes("esiste già")) {
      setMsg(authError?.message || "Errore registrazione");
      setLoading(false);
      return;
    }
    // Se già registrato, recupera userId tramite login
    if (!userId) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !loginData.user) {
        setMsg(loginError?.message || "Errore login");
        setLoading(false);
        return;
      }
      userId = loginData.user.id;
    }
    // 2. Inserimento/upsert nella tabella Profili
    const { error: profiliError } = await supabase.from("Profili").upsert([
      {
        id: userId,
        nome,
        cognome,
        username,
        telefono,
        email,
        ruolo: "utente",
        status: "attivo",
        created_at: new Date().toISOString(),
      },
    ], { onConflict: "id" });
    if (profiliError) {
      setMsg(profiliError.message || "Errore creazione profilo");
      setLoading(false);
      return;
    }
    // Login automatico
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setMsg(loginError.message || "Errore login automatico");
      setLoading(false);
      return;
    }
    setMsg("Registrazione completata! Accesso in corso...");
    setTimeout(() => {
      setLoading(false);
      setMsg("");
      onClose();
      navigate("/home");
    }, 1000);
  }

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 2000,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 0,
      }}
    >
      <style>{`
        @media (max-width: 600px) {
          .register-modal-box {
            width: 100vw !important;
            min-width: 0 !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }
        }
        @media (min-width: 601px) {
          .register-modal-box {
            width: 800px !important;
            min-width: 320px !important;
            max-width: 1000px !important;
            border-radius: 18px !important;
            padding: 48px 48px 32px 48px !important;
            box-shadow: 0 8px 32px #000a !important;
            border: none !important;
            align-items: center !important;
          }
        }
      `}</style>
      <div
        className="register-modal-box"
        style={{
          background: "#181818",
          borderRadius: 0,
          padding: 0,
          width: "100vw",
          maxWidth: "100vw",
          minWidth: 0,
          boxShadow: "none",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          maxHeight: "100vh",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            background: "none",
            border: "none",
            color: "#FFD36A",
            fontSize: 28,
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Chiudi"
        >
          ×
        </button>
        <div style={{ color: "#FFD36A", fontWeight: 900, fontSize: 28, marginBottom: 8, textAlign: "center", letterSpacing: 1 }}>
          Crea il tuo account
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420, margin: "0 auto" }} autoComplete="off">
          <input
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder="Cognome"
            value={cognome}
            onChange={e => setCognome(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder="Username"
            value={username}
            onChange={e => checkUsername(e.target.value)}
            required
            style={{
              marginBottom: 6,
              borderColor:
                username.length > 2
                  ? usernameAvailable === false
                    ? "red"
                    : usernameAvailable === true
                    ? "green"
                    : "#333"
                  : "#333",
            }}
          />
          {username.length > 2 && usernameAvailable === false && (
            <div style={{ color: "red", fontSize: 13, marginBottom: 6 }}>
              Username già in uso
            </div>
          )}
          <input
            placeholder="Cellulare"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Password (min 6 caratteri)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="Conferma password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            minLength={6}
            required
            style={{ marginBottom: 10 }}
          />
          <button
            type="submit"
            disabled={!validForm || loading}
            style={{
              width: "100%",
              background: "#FFD36A",
              color: "#181818",
              fontWeight: 900,
              fontSize: 20,
              border: "none",
              borderRadius: 12,
              padding: "14px 0",
              marginTop: 12,
              marginBottom: 8,
              boxShadow: "none",
              opacity: !validForm || loading ? 0.5 : 1,
              cursor: !validForm || loading ? "not-allowed" : "pointer",
              letterSpacing: 1,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {loading ? "Registrazione..." : "Crea il tuo account"}
          </button>
        </form>
        {msg && (
          <div style={{
            color: msg.toLowerCase().includes("errore") ? "#ff4d4f" : "#FFD36A",
            marginTop: 16,
            textAlign: "center",
            fontWeight: 700,
            fontSize: 16,
            background: msg.toLowerCase().includes("errore") ? "#fff2f0" : "none",
            borderRadius: 8,
            padding: msg.toLowerCase().includes("errore") ? "8px 0" : 0,
          }}>{msg}</div>
        )}
      </div>
    </div>
  );
}
