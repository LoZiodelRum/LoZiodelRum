import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
  const { t } = useTranslation("auth");
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

  if (!open) return null;

  const validForm =
    nome.trim() &&
    cognome.trim() &&
    username.trim() &&
    telefono.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const normalizedEmail = email.trim().toLowerCase();
    const payload = {
      nome: nome.trim(),
      cognome: cognome.trim(),
      username: username.trim(),
      telefono: telefono.trim() || null,
      email: normalizedEmail,
      password,
      ruolo: "utente",
    };

    const endpoints = ["/api/auth-signup", "/.netlify/functions/auth-signup"];
    let endpointOk = false;
    let lastEndpointMessage = "";

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => ({}));
        if (response.ok && body?.ok) {
          endpointOk = true;
          break;
        }

        lastEndpointMessage = String(body?.message || "");
      } catch (error: any) {
        lastEndpointMessage = String(error?.message || "");
      }
    }

    if (!endpointOk) {
      const loweredMessage = lastEndpointMessage.toLowerCase();
      if (loweredMessage.includes("gia registrata") || loweredMessage.includes("already")) {
        setMsg(t("messages.emailAlreadyRegistered"));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) {
          setMsg(error.message || t("messages.signupError"));
          setLoading(false);
          return;
        }

        const userId = data.user?.id;
        const sessionUserId = data.session?.user?.id;
        const profileUserId = sessionUserId || userId;

        if (profileUserId) {
          const { error: profileError } = await supabase
            .from("Profili")
            .upsert(
              [
                {
                  id: profileUserId,
                  nome: nome.trim(),
                  cognome: cognome.trim(),
                  username: username.trim(),
                  email: normalizedEmail,
                  telefono: telefono.trim() || null,
                  ruolo: "utente",
                  status: "attivo",
                },
              ],
              { onConflict: "id" }
            );

          if (profileError) {
            setMsg(profileError.message || t("messages.profileNotCreated"));
            setLoading(false);
            return;
          }
        }
      }

      if (lastEndpointMessage && !lastEndpointMessage.toLowerCase().includes("gia registrata") && !lastEndpointMessage.toLowerCase().includes("already")) {
        setMsg(lastEndpointMessage || t("messages.signupError"));
      }

      if (lastEndpointMessage.toLowerCase().includes("gia registrata") || lastEndpointMessage.toLowerCase().includes("already")) {
        setLoading(false);
        return;
      }
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (loginError) {
      const lowerMessage = String(loginError.message || "").toLowerCase();
      if (lowerMessage.includes("email not confirmed")) {
        setMsg(t("messages.registrationCompletedConfirmEmail"));
      } else {
        setMsg(loginError.message || t("messages.loginError"));
      }
      setLoading(false);
      return;
    }

    setMsg(t("messages.registrationCompletedLogin"));
    setTimeout(() => {
      setLoading(false);
      setMsg("");
      onClose();
      navigate("/home");
    }, 800);
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
          aria-label={t("close")}
        >
          ×
        </button>
        <div style={{ color: "#FFD36A", fontWeight: 900, fontSize: 28, marginBottom: 8, textAlign: "center", letterSpacing: 1 }}>
          {t("registerTitle")}
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420, margin: "0 auto" }} autoComplete="off">
          <input
            placeholder={t("firstName")}
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder={t("lastName")}
            value={cognome}
            onChange={e => setCognome(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder={t("username")}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder={t("phone")}
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder={t("passwordMin")}
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
            style={{ marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder={t("confirmPassword")}
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
            {loading ? t("registrationLoading") : t("createAccount")}
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
