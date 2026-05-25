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

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessaggio("");

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setMessaggio(error.message || "Registrazione fallita");
      setLoading(false);
      return;
    }

    const profileUserId = data.session?.user?.id || data.user?.id;
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
        setMessaggio(profileError.message || "Profilo non creato");
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
        setMessaggio("Registrazione completata. Conferma la tua email prima di accedere.");
      } else {
        setMessaggio(loginError.message || "Errore login");
      }
      setLoading(false);
      return;
    }

    setMessaggio("Registrazione completata! Accesso effettuato.");
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