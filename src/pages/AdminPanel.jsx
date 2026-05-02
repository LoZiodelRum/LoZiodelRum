import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);


  // Stato lista utenti (mock)
  const [utenti, setUtenti] = useState([
    { id: 1, nome: "Mario", cognome: "Rossi", email: "mario@email.it", username: "mariorossi", ruolo: "admin" },
    { id: 2, nome: "Giulia", cognome: "Bianchi", email: "giulia@email.it", username: "giuliab", ruolo: "utente" },
  ]);
  const [loadingUtenti, setLoadingUtenti] = useState(false);

  // Funzione mock: fetch utenti (simula chiamata async)
  async function fetchUtenti() {
    setLoadingUtenti(true);
    // Simula delay e dati
    setTimeout(() => {
      setUtenti([
        { id: 1, nome: "Mario", cognome: "Rossi", email: "mario@email.it", username: "mariorossi", ruolo: "admin" },
        { id: 2, nome: "Giulia", cognome: "Bianchi", email: "giulia@email.it", username: "giuliab", ruolo: "utente" },
        { id: 3, nome: "Luca", cognome: "Verdi", email: "luca@email.it", username: "lucav", ruolo: "bartender" },
      ]);
      setLoadingUtenti(false);
    }, 1000);
  }


  // Stato form utente (mock)
  const [formUser, setFormUser] = useState({ nome: "", cognome: "", email: "", ruolo: "utente" });

  // Funzione: click su "Modifica" popola il form

  function handleEditUser(utente) {
    setFormUser({
      nome: utente.nome,
      cognome: utente.cognome,
      email: utente.email,
      ruolo: utente.ruolo,
    });
  }

  // Funzione: submit form utente (mock)
  function handleFormSubmit(e) {
    e.preventDefault();
    alert(`Dati inviati: ${JSON.stringify(formUser, null, 2)}`);
    // Reset form dopo submit
    setFormUser({ nome: "", cognome: "", email: "", ruolo: "utente" });
  }

  // Funzione: elimina utente (mock, solo stato locale)
  function handleDeleteUser(id) {
    setUtenti(u => u.filter(user => user.id !== id));
    // Se il form mostra l'utente eliminato, resetta il form
    if (formUser && utenti.find(u => u.id === id && u.email === formUser.email)) {
      setFormUser({ nome: "", cognome: "", email: "", ruolo: "utente" });
    }
  }

  return (
    <div style={{ color: "white", padding: 20, minHeight: "100vh", background: "#0f0f0f" }}>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, marginBottom: 32 }}>
        Pannello di Controllo
      </h1>

      {/* BOX STATISTICHE - STATICO */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
        <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, minWidth: 180, flex: "1 1 180px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f5a623", marginBottom: 8 }}>123</div>
          <div style={{ color: "#9ca3af", fontWeight: 500 }}>Utenti</div>
        </div>
        <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, minWidth: 180, flex: "1 1 180px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f5a623", marginBottom: 8 }}>45</div>
          <div style={{ color: "#9ca3af", fontWeight: 500 }}>Locali</div>
        </div>
        <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, minWidth: 180, flex: "1 1 180px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f5a623", marginBottom: 8 }}>67</div>
          <div style={{ color: "#9ca3af", fontWeight: 500 }}>Cocktail</div>
        </div>
        <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, minWidth: 180, flex: "1 1 180px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f5a623", marginBottom: 8 }}>12</div>
          <div style={{ color: "#9ca3af", fontWeight: 500 }}>Distillati</div>
        </div>
      </div>


      {/* LISTA DATI - TABELLA UTENTI (mock) */}
      <div style={{ background: "#181818", borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.10)", maxWidth: 900 }}>
        <h2 style={{ color: "#f5a623", fontSize: "1.2rem", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          Utenti
          <button onClick={fetchUtenti} disabled={loadingUtenti} style={{ background: "#f5a623", color: "#181818", border: 0, borderRadius: 6, padding: "6px 14px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            {loadingUtenti ? "Aggiorna..." : "Aggiorna"}
          </button>
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
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
                <td style={{ padding: 8, border: "1px solid #333" }}>{utente.nome}</td>
                <td style={{ padding: 8, border: "1px solid #333" }}>{utente.cognome}</td>
                <td style={{ padding: 8, border: "1px solid #333" }}>{utente.email}</td>
                <td style={{ padding: 8, border: "1px solid #333" }}>{utente.username}</td>
                <td style={{ padding: 8, border: "1px solid #333" }}>{utente.ruolo}</td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <button
                    style={{ background: "#f5a623", color: "#181818", border: 0, borderRadius: 6, padding: "6px 14px", fontWeight: 700, cursor: "pointer", marginRight: 8 }}
                    onClick={() => handleEditUser(utente)}
                  >
                    Modifica
                  </button>
                  <button
                    style={{ background: "#e74c3c", color: "#fff", border: 0, borderRadius: 6, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => handleDeleteUser(utente.id)}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM STATICO - CREA/MODIFICA UTENTE */}
      <div style={{ background: "#181818", borderRadius: 16, padding: 24, maxWidth: 500, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
        <h2 style={{ color: "#f5a623", fontSize: "1.2rem", marginBottom: 18 }}>Crea / Modifica Utente</h2>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Nome</label>
            <input
              type="text"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }}
              placeholder="Nome"
              value={formUser.nome}
              onChange={e => setFormUser(f => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Cognome</label>
            <input
              type="text"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }}
              placeholder="Cognome"
              value={formUser.cognome}
              onChange={e => setFormUser(f => ({ ...f, cognome: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Email</label>
            <input
              type="email"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }}
              placeholder="Email"
              value={formUser.email}
              onChange={e => setFormUser(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Ruolo</label>
            <select
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }}
              value={formUser.ruolo}
              onChange={e => setFormUser(f => ({ ...f, ruolo: e.target.value }))}
            >
              <option value="utente">utente</option>
              <option value="bartender">bartender</option>
              <option value="proprietario">proprietario</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button type="submit" style={{ background: "#f5a623", color: "#181818", border: 0, borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer", marginTop: 10, marginRight: 10 }}>
            Salva
          </button>
          <button
            type="button"
            style={{ background: "#444", color: "#fff", border: 0, borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer", marginTop: 10 }}
            onClick={() => setFormUser({ nome: "", cognome: "", email: "", ruolo: "utente" })}
          >
            Reset
          </button>
        </form>
      </div>

      <p>Versione stabile attiva</p>
    </div>
  );
}
      "";

    const hasValidId = selectedItem.id !== undefined && selectedItem.id !== null && String(selectedItem.id).trim() !== "";
    const fallbackSlug = typeof selectedItem?.slug === "string" ? selectedItem.slug.trim() : "";
    const isWineTable = selectedTable.toLowerCase() === "vini";
    const isCocktailTable = selectedTable.toLowerCase() === "cocktail";
    const isDistillatiTable = selectedTable.toLowerCase() === "distillati";
    const isLocaliTable = selectedTable === "Locali";

