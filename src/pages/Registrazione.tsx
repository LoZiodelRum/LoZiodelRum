import "../App.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Registrazione() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [messaggio, setMessaggio] = useState("");

  async function handleRegister(e: any) {
    e.preventDefault();

    console.log("START REGISTER");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("AUTH:", data, error);

    if (error) {
      setMessaggio(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setMessaggio("Utente non creato");
      return;
    }

    const { error: profiloError } = await supabase.from("Profili").insert([
      {
        id: user.id,
        nome,
        cognome,
        username,
        email,
        ruolo: "utente",
        status: "attivo",
      },
    ]);

    console.log("PROFILO:", profiloError);

    if (profiloError) {
      setMessaggio(profiloError.message);
      return;
    }

    setMessaggio("Registrazione completata");
  }

  return (
    <div className="form-page fade-in registration-form-page">
      <form onSubmit={handleRegister} className="form-card registration-form-shell">
        <h1>Registrazione Utente</h1>

        <input placeholder="Nome" onChange={(e: any) => setNome(e.target.value)} />
        <input placeholder="Cognome" onChange={(e: any) => setCognome(e.target.value)} />
        <input placeholder="Username" onChange={(e: any) => setUsername(e.target.value)} />
        <input placeholder="Email" onChange={(e: any) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} />

        <button type="submit">Registrati</button>

        {messaggio && <p style={{ marginTop: 10 }}>{messaggio}</p>}
      </form>
    </div>
  );
}