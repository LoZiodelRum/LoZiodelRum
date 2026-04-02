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
    <div style={container}>
      <form onSubmit={handleRegister} style={card}>
        <h1>Registrazione Utente</h1>

        <input placeholder="Nome" onChange={(e: any) => setNome(e.target.value)} style={input} />
        <input placeholder="Cognome" onChange={(e: any) => setCognome(e.target.value)} style={input} />
        <input placeholder="Username" onChange={(e: any) => setUsername(e.target.value)} style={input} />
        <input placeholder="Email" onChange={(e: any) => setEmail(e.target.value)} style={input} />
        <input type="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} style={input} />

        <button type="submit" style={btn}>
          Registrati
        </button>

        {messaggio && <p style={{ marginTop: 10 }}>{messaggio}</p>}
      </form>
    </div>
  );
}

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#000",
};

const card = {
  width: 400,
  padding: 30,
  background: "#111",
  borderRadius: 12,
  color: "#fff",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #333",
  background: "#000",
  color: "#fff",
};

const btn = {
  width: "100%",
  padding: 12,
  background: "#f5a623",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};