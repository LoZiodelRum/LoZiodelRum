import "../App.css";
import { useState } from "react";

export default function Registrazione() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: any) {
    e.preventDefault();

    console.log("START REGISTER");
    setLoading(true);
    setMessaggio("");

    const isNetlifyHost = window.location.hostname.includes("netlify");
    const endpoints = isNetlifyHost
      ? ["/.netlify/functions/auth-signup-custom", "/api/auth-signup-custom"]
      : ["/api/auth-signup-custom", "/.netlify/functions/auth-signup-custom"];

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
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.ok) {
          setMessaggio(payload.message || "Registrazione completata! Controlla la tua email per confermare l'account.");
          setLoading(false);
          return;
        }

        lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
        if (response.status !== 404 && response.status !== 405) {
          break;
        }
      } catch (err: any) {
        lastMessage = err?.message || `Errore di rete su ${endpoint}`;
      }
    }

    setMessaggio(lastMessage);
    setLoading(false);
    return;
  }

  return (
    <div className="form-page fade-in registration-form-page">
      <form onSubmit={handleRegister} className="form-card registration-form-shell">
        <h1>Registrazione Utente</h1>

        <input placeholder="Nome" onChange={(e: any) => setNome(e.target.value)} required />
        <input placeholder="Cognome" onChange={(e: any) => setCognome(e.target.value)} required />
        <input placeholder="Username" onChange={(e: any) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" onChange={(e: any) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} required />

        <button type="submit" disabled={loading}>{loading ? "Invio in corso..." : "Registrati"}</button>

        {messaggio && <p style={{ marginTop: 10 }}>{messaggio}</p>}
      </form>
    </div>
  );
}