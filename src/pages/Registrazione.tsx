import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Registrazione() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [metodo, setMetodo] = useState<"sms" | "email">("sms");

  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  function normalizePhone(raw: string) {
    const cleaned = raw.replace(/[\s()-]/g, "").trim();
    if (!cleaned) return "";
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
    return `+39${cleaned}`;
  }

  async function handleEmailRegister() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, cognome, username },
      },
    });

    if (error) {
      setMessaggio(error.message);
      return;
    }

    if (!data.user) {
      setMessaggio("Utente non creato");
      return;
    }

    setMessaggio("Registrazione completata! Controlla la tua email per confermare l'account.");
  }

  async function handleSmsSendOtp() {
    const normalizedPhone = normalizePhone(phone);
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setMessaggio("Numero non valido. Inserisci il prefisso, es: +393331234567");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: true,
        data: { nome, cognome, username },
      },
    });

    if (error) {
      setMessaggio(error.message);
      return;
    }

    setOtpSent(true);
    setMessaggio("Codice SMS inviato. Inserisci l'OTP per completare la registrazione.");
  }

  async function handleSmsVerifyOtp() {
    const normalizedPhone = normalizePhone(phone);
    const code = otpCode.trim();

    if (!code) {
      setMessaggio("Inserisci il codice OTP ricevuto via SMS");
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: code,
      type: "sms",
    });

    if (error) {
      setMessaggio(error.message);
      return;
    }

    setMessaggio("Registrazione completata con SMS");
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 500);
  }

  async function handleRegister(e: any) {
    e.preventDefault();

    setLoading(true);
    setMessaggio("");

    if (!nome.trim() || !cognome.trim() || !username.trim()) {
      setMessaggio("Compila nome, cognome e username");
      setLoading(false);
      return;
    }

    if (metodo === "email") {
      await handleEmailRegister();
    } else {
      if (!otpSent) {
        await handleSmsSendOtp();
      } else {
        await handleSmsVerifyOtp();
      }
    }

    setLoading(false);
  }

  return (
    <div className="form-page fade-in registration-form-page">
      <form onSubmit={handleRegister} className="form-card registration-form-shell">
        <h1>Registrazione Utente</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setMetodo("sms");
              setOtpSent(false);
              setOtpCode("");
              setMessaggio("");
            }}
            style={{ opacity: metodo === "sms" ? 1 : 0.7 }}
          >
            SMS
          </button>
          <button
            type="button"
            onClick={() => {
              setMetodo("email");
              setOtpSent(false);
              setOtpCode("");
              setMessaggio("");
            }}
            style={{ opacity: metodo === "email" ? 1 : 0.7 }}
          >
            Email
          </button>
        </div>

        <input placeholder="Nome" value={nome} onChange={(e: any) => setNome(e.target.value)} required />
        <input placeholder="Cognome" value={cognome} onChange={(e: any) => setCognome(e.target.value)} required />
        <input placeholder="Username" value={username} onChange={(e: any) => setUsername(e.target.value)} required />

        {metodo === "email" && (
          <>
            <input type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
          </>
        )}

        {metodo === "sms" && (
          <>
            <input
              type="tel"
              placeholder="Cellulare (+393331234567)"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              required
            />

            {otpSent && (
              <input
                type="text"
                placeholder="Codice OTP"
                value={otpCode}
                onChange={(e: any) => setOtpCode(e.target.value)}
                required
              />
            )}
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Invio in corso..."
            : metodo === "sms"
              ? otpSent
                ? "Verifica Codice SMS"
                : "Invia Codice SMS"
              : "Registrati"}
        </button>

        {messaggio && <p style={{ marginTop: 10 }}>{messaggio}</p>}
      </form>
    </div>
  );
}