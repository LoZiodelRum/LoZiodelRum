import React, { useState } from "react";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (room: any) => void;
}

const CATEGORIES = [
  "Rum",
  "Cocktail",
  "Whisky",
  "Vino",
  "Off Topic",
  "Locali",
  "Altro"
];

export default function CreateRoomModal({ open, onClose, onCreate }: CreateRoomModalProps) {
  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [pubblico, setPubblico] = useState(true);
  const [immagine, setImmagine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 28, minWidth: 320, maxWidth: 380, width: "90%", boxShadow: "0 8px 32px #0003", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", fontSize: 22, color: "#aaa", cursor: "pointer" }}>×</button>
        <h3 style={{ color: "#c9a86a", marginBottom: 18, textAlign: "center" }}>Crea un nuovo Tavolo</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome Tavolo *" style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <textarea value={descrizione} onChange={e => setDescrizione(e.target.value)} placeholder="Descrizione" rows={2} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ fontSize: 15 }}>Privacy:</label>
            <button type="button" onClick={() => setPubblico(true)} style={{ background: pubblico ? "#c9a86a" : "#eee", color: pubblico ? "#fff" : "#333", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>Pubblico</button>
            <button type="button" onClick={() => setPubblico(false)} style={{ background: !pubblico ? "#c9a86a" : "#eee", color: !pubblico ? "#fff" : "#333", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>Privato</button>
          </div>
          {/* Immagine: solo URL per MVP, upload dopo */}
          <input value={immagine || ""} onChange={e => setImmagine(e.target.value)} placeholder="URL Immagine (opzionale)" style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <button
            disabled={loading || !nome.trim()}
            onClick={() => {
              setLoading(true);
              onCreate({ nome, descrizione, categoria, pubblico, immagine });
            }}
            style={{ background: "#c9a86a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 700, fontSize: 16, marginTop: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !nome.trim() ? 0.7 : 1 }}
          >
            CREA
          </button>
        </div>
      </div>
    </div>
  );
}
