import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
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
    // 1. Registrazione utente su Supabase Auth
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
    if (authError || !authData.user) {
      setMsg(authError?.message || "Errore registrazione");
      setLoading(false);
      return;
    }
    const userId = authData.user.id;
    // 2. Inserimento nella tabella Profili
    const { error: profiliError } = await supabase.from("Profili").insert([
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
    ]);
    if (profiliError) {
      setMsg(profiliError.message || "Errore creazione profilo");
      setLoading(false);
      return;
    }
    setMsg("Registrazione completata! Reindirizzamento in corso...");
    setTimeout(() => {
      setLoading(false);
      setMsg("");
      onClose();
      window.location.reload();
    }, 1200);
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
      }}
    >
      <div
        style={{
          background: "#181818",
          borderRadius: 18,
          padding: 24,
          width: "95vw",
          maxWidth: 480,
          minWidth: 0,
          boxShadow: "0 8px 32px #000a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          height: "auto",
          maxHeight: "95vh",
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
              padding: 18px 8px 8px 8px !important;
              box-shadow: none !important;
            }
          }
          @media (min-width: 601px) {
            .register-modal-box {
              width: 480px !important;
              min-width: 320px !important;
              max-width: 540px !important;
              border-radius: 18px !important;
              padding: 32px 32px 24px 32px !important;
            }
          }
        `}</style>
        <div className="register-modal-box" style={{ width: "100%" }}>
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
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 26, marginBottom: 8, textAlign: "center" }}>
          Crea il tuo account
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%" }} autoComplete="off">
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
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              marginTop: 8,
              marginBottom: 4,
              boxShadow: "0 2px 0 #b48a2c",
              opacity: !validForm || loading ? 0.5 : 1,
              cursor: !validForm || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Registrazione..." : "Crea il tuo account"}
          </button>
        </form>
        {msg && (
          <div style={{ color: "#FFD36A", marginTop: 16, textAlign: "center" }}>{msg}</div>
        )}
      </div>
    </div>
  );
}
