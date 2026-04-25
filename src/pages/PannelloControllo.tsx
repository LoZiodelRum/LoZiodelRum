import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

type Utente = {
  id: string;
  nome: string;
  cognome?: string;
  email: string;
  username?: string;
  ruolo: string;
};

const RUOLI = ["utente", "bartender", "proprietario", "admin"];

export default function PannelloControllo() {
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("Profili").select("*");
    if (error) {
      setError("Errore nel recupero utenti");
      setUtenti([]);
    } else {
      setUtenti(data || []);
    }
    setLoading(false);
  }

  async function updateRuolo(userId: string, nuovoRuolo: string) {
    setSavingId(userId);
    setError(null);
    const { error } = await supabase
      .from("Profili")
      .update({ ruolo: nuovoRuolo })
      .eq("id", userId);
    if (error) {
      setError("Errore aggiornamento ruolo");
    } else {
      setUtenti((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, ruolo: nuovoRuolo } : u
        )
      );
    }
    setSavingId(null);
  }

  return (
    <>
      <Navbar />
    <div style={{ padding: 40 }}>
      <h1>Pannello di Controllo - Utenti</h1>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <button onClick={fetchUsers} disabled={loading} style={{ marginBottom: 20 }}>
        {loading ? "Aggiornamento..." : "Aggiorna lista"}
      </button>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#222", color: "#fff" }}>
            <th style={{ padding: 8, border: "1px solid #444" }}>Nome</th>
            <th style={{ padding: 8, border: "1px solid #444" }}>Cognome</th>
            <th style={{ padding: 8, border: "1px solid #444" }}>Email</th>
            <th style={{ padding: 8, border: "1px solid #444" }}>Username</th>
            <th style={{ padding: 8, border: "1px solid #444" }}>Ruolo</th>
            <th style={{ padding: 8, border: "1px solid #444" }}>Azione</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((utente) => (
            <tr key={utente.id}>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{utente.nome}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{utente.cognome || ""}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{utente.email}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>{utente.username || ""}</td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>
                <select
                  value={utente.ruolo}
                  onChange={(e) =>
                    updateRuolo(utente.id, e.target.value)
                  }
                  disabled={savingId === utente.id}
                  style={{ minWidth: 120 }}
                >
                  {RUOLI.map((ruolo) => (
                    <option key={ruolo} value={ruolo}>
                      {ruolo}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ padding: 8, border: "1px solid #eee" }}>
                <button
                  onClick={() => updateRuolo(utente.id, utente.ruolo)}
                  disabled={savingId === utente.id}
                >
                  {savingId === utente.id ? "Salvataggio..." : "Salva"}
                </button>
              </td>
            </tr>
          ))}
          {utenti.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                Nessun utente trovato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
}