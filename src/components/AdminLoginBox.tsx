// src/components/AdminLoginBox.jsx (o .tsx se usi TypeScript)
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminLoginBox({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "info@loziodelrum.it",
      password,
    });
    setLoading(false);
    if (error) {
      alert("Password errata");
    } else {
      setPassword("");
      if (onSuccess) onSuccess();
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        type="password"
        placeholder="Password Amministratore"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={loading}
        style={{ padding: 12, borderRadius: 8, border: "1px solid #888", fontSize: 18 }}
      />
      <button type="submit" disabled={loading || !password} style={{ padding: 12, borderRadius: 8, background: "#f5a623", color: "#181818", fontWeight: 700, fontSize: 18 }}>
        {loading ? "Accesso..." : "Accedi"}
      </button>
    </form>
  );
}