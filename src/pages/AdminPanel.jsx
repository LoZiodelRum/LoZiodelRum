import React, { useState, useEffect } from "react";

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);

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

    import React, { useState, useEffect } from "react";

    export default function AdminPanel() {
      const [loading, setLoading] = useState(false);

      return (
        <div style={{ color: "white", padding: 20 }}>
          <h1>Pannello di controllo</h1>
          <p>Versione stabile attiva</p>
        </div>
      );
    }