import "../App.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Registrazione() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");

  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  async function registerWithSupabaseDirect() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { nome, cognome, username, telefono: telefono || null, ruolo: "utente" },
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

    const userId = data.user.id;
    const { error: profileError } = await supabase.from("Profili").upsert([
      {
        id: userId,
        nome,
        cognome,
        username,
        email,
        telefono: telefono || null,
        ruolo: "utente",
        status: "attivo",
      },
    ], { onConflict: "id" });

    if (profileError) {
      console.warn("Profilo upsert fallback non riuscito:", profileError.message);
    }

    if (data.session) {
      await supabase.auth.signOut();
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      const lowerMessage = String(loginError.message || "").toLowerCase();
      if (lowerMessage.includes("email not confirmed")) {
        setMessaggio("Registrazione completata. Conferma la tua email prima di accedere.");
      } else {
        setMessaggio(loginError.message || "Errore login automatico");
      }
      return;
    }

    setMessaggio("Registrazione completata! Accesso effettuato.");
  }

  async function handleRegister(e: any) {
    e.preventDefault();

    setLoading(true);
    setMessaggio("");

    const isNetlifyHost = window.location.hostname.includes("netlify");
    const endpoints = isNetlifyHost
      ? ["/.netlify/functions/auth-signup", "/api/auth-signup"]
      : ["/api/auth-signup", "/.netlify/functions/auth-signup"];

    let lastMessage = "Registrazione fallita";

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            cognome,
            username,
            email,
            password,
            ruolo: "utente",
            telefono: telefono || null,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.ok) {
          setMessaggio(payload.message || "Registrazione completata! Controlla la tua email per confermare l'account.");
          setLoading(false);
          return;
        }

        lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
        if ((payload?.message || "").toLowerCase().includes("server env not configured")) {
          await registerWithSupabaseDirect();
          setLoading(false);
          return;
        }
        if (response.status !== 404 && response.status !== 405) {
          break;
        }
      } catch (err: any) {
        lastMessage = err?.message || `Errore di rete su ${endpoint}`;
      }
    }

    if (lastMessage.toLowerCase().includes("server env not configured")) {
      await registerWithSupabaseDirect();
      setLoading(false);
      return;
    }

    setMessaggio(lastMessage);
    setLoading(false);
  }

  return (
    <div className="form-page fade-in registration-form-page">
      <form onSubmit={handleRegister} className="form-card registration-form-shell">
        <h1 translate="no">Registrazione Utente</h1>

        <input placeholder="Nome" onChange={(e: any) => setNome(e.target.value)} required />
        <input placeholder="Cognome" onChange={(e: any) => setCognome(e.target.value)} required />
        <input placeholder="Username" onChange={(e: any) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" onChange={(e: any) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} required />
        <input type="tel" placeholder="Cellulare (opzionale)" onChange={(e: any) => setTelefono(e.target.value)} />

        <button type="submit" disabled={loading}>{loading ? "Invio in corso..." : "Registrati"}</button>

        {messaggio && <p style={{ marginTop: 10 }}>{messaggio}</p>}
      </form>
    </div>
  );
}