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
