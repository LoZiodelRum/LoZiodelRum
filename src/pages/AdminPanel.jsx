import React, { useState } from "react";

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);

  // Funzione mock: cambio ruolo (solo alert)
  function handleRoleChange(e) {
    alert(`Ruolo selezionato: ${e.target.value}`);
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

      {/* LISTA DATI - TABELLA UTENTI STATICO */}
      <div style={{ background: "#181818", borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.10)", maxWidth: 900 }}>
        <h2 style={{ color: "#f5a623", fontSize: "1.2rem", marginBottom: 18 }}>Utenti</h2>
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
            <tr>
              <td style={{ padding: 8, border: "1px solid #333" }}>Mario</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>Rossi</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>mario@email.it</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>mariorossi</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>admin</td>
              <td style={{ padding: 8, border: "1px solid #333" }}><button style={{ background: "#f5a623", color: "#181818", border: 0, borderRadius: 6, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Modifica</button></td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: "1px solid #333" }}>Giulia</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>Bianchi</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>giulia@email.it</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>giuliab</td>
              <td style={{ padding: 8, border: "1px solid #333" }}>utente</td>
              <td style={{ padding: 8, border: "1px solid #333" }}><button style={{ background: "#f5a623", color: "#181818", border: 0, borderRadius: 6, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Modifica</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FORM STATICO - CREA/MODIFICA UTENTE */}
      <div style={{ background: "#181818", borderRadius: 16, padding: 24, maxWidth: 500, marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
        <h2 style={{ color: "#f5a623", fontSize: "1.2rem", marginBottom: 18 }}>Crea / Modifica Utente</h2>
        <form>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Nome</label>
            <input type="text" style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }} placeholder="Nome" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Cognome</label>
            <input type="text" style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }} placeholder="Cognome" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }} placeholder="Email" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#f5a623", display: "block", marginBottom: 4 }}>Ruolo</label>
            <select
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }}
              onChange={handleRoleChange}
            >
              <option>utente</option>
              <option>bartender</option>
              <option>proprietario</option>
              <option>admin</option>
            </select>
          </div>
          <button type="submit" style={{ background: "#f5a623", color: "#181818", border: 0, borderRadius: 6, padding: "10px 24px", fontWeight: 700, cursor: "pointer", marginTop: 10 }}>
            Salva
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

