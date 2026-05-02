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