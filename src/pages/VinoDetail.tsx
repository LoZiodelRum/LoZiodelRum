import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type VinoRecord = Record<string, any>;

const baseFields: Array<{ key: string; label: string }> = [
  { key: "nome", label: "Nome" },
  { key: "annata", label: "Annata" },
  { key: "cantina", label: "Cantina" },
  { key: "vitigno", label: "Vitigno" },
  { key: "grado_alcolico", label: "Grado alcolico" },
  { key: "zona", label: "Zona" },
  { key: "denominazione", label: "Denominazione" },
  { key: "categoria", label: "Categoria" },
  { key: "abbinamenti", label: "Abbinamenti" },
  { key: "temperatura_servizio", label: "Temperatura servizio" },
  { key: "note_personali", label: "Note personali" },
  { key: "valutazione", label: "Valutazione" },
];

const visivoFields: Array<{ key: string; label: string }> = [
  { key: "limpidezza", label: "Limpidezza" },
  { key: "colore", label: "Colore" },
  { key: "consistenza", label: "Consistenza" },
  { key: "effervescenza", label: "Effervescenza" },
];

const olfattivoFields: Array<{ key: string; label: string }> = [
  { key: "intensita_olfattiva", label: "Intensita olfattiva" },
  { key: "complessita", label: "Complessita" },
  { key: "qualita_olfattiva", label: "Qualita olfattiva" },
  { key: "descrizione_olfattiva", label: "Descrizione olfattiva" },
];

const gustoOlfattivoFields: Array<{ key: string; label: string }> = [
  { key: "zuccheri", label: "Zuccheri" },
  { key: "alcoli", label: "Alcoli" },
  { key: "polialcoli", label: "Polialcoli" },
  { key: "acidita", label: "Acidita" },
  { key: "tannini", label: "Tannini" },
  { key: "sali_minerali", label: "Sali minerali" },
];

const finaleFields: Array<{ key: string; label: string }> = [
  { key: "equilibrio", label: "Equilibrio" },
  { key: "intensita_gusto", label: "Intensita gusto" },
  { key: "persistenza", label: "Persistenza" },
  { key: "qualita_gusto", label: "Qualita gusto" },
  { key: "corpo", label: "Corpo" },
  { key: "stato_evolutivo", label: "Stato evolutivo" },
  { key: "armonia", label: "Armonia" },
];

function normalizeValue(raw: unknown): string {
  if (raw === null || raw === undefined || raw === "") return "-";

  if (Array.isArray(raw)) {
    const cleaned = raw.map((x) => String(x).trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(", ") : "-";
  }

  const text = String(raw).trim();
  if (!text) return "-";

  if (text.includes(",")) {
    return text
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .join(", ");
  }

  return text;
}

export default function VinoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vino, setVino] = useState<VinoRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, [id]);

  async function load() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const lower = await supabase.from("vini").select("*").eq("id", id).maybeSingle();
    if (!lower.error && lower.data) {
      setVino(lower.data);
      setLoading(false);
      return;
    }

    const upper = await supabase.from("Vini").select("*").eq("id", id).maybeSingle();
    if (!upper.error && upper.data) {
      setVino(upper.data);
      setLoading(false);
      return;
    }

    setVino(null);
    setLoading(false);
  }

  const imageUrl = useMemo(() => {
    return vino?.immagine || vino?.immagine_url || vino?.image || vino?.img || null;
  }, [vino]);

  function renderSection(title: string, fields: Array<{ key: string; label: string }>) {
    return (
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <div style={gridStyle}>
          {fields.map((field) => (
            <article key={field.key} style={cardStyle}>
              <h3 style={labelStyle}>{field.label}</h3>
              <p style={valueStyle}>{normalizeValue(vino?.[field.key])}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (loading) {
    return <div className="page fade-in">Caricamento scheda vino...</div>;
  }

  if (!vino) {
    return (
      <div className="page fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <button className="btn-primary" onClick={() => navigate("/vini")} style={{ marginBottom: 20 }}>
          Torna ai vini
        </button>
        <div style={notFoundStyle}>
          Scheda vino non trovata.
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <button className="btn-primary" onClick={() => navigate("/vini")} style={{ marginBottom: 16 }}>
        Torna ai vini
      </button>

      <section style={heroStyle}>
        {imageUrl ? (
          <img src={imageUrl} alt={normalizeValue(vino?.nome)} style={heroImageStyle} />
        ) : (
          <div style={heroImagePlaceholderStyle}>NO IMG</div>
        )}

        <div>
          <h1 style={heroTitleStyle}>{normalizeValue(vino?.nome)}</h1>
          <p style={heroSubStyle}>Scheda completa AIS</p>
          <div style={heroMetaStyle}>
            <span style={badgeStyle}>Categoria: {normalizeValue(vino?.categoria)}</span>
            <span style={badgeStyle}>Annata: {normalizeValue(vino?.annata)}</span>
            <span style={badgeStyle}>Cantina: {normalizeValue(vino?.cantina)}</span>
          </div>
        </div>
      </section>

      {renderSection("Dati Base", baseFields)}
      {renderSection("Esame Visivo (AIS)", visivoFields)}
      {renderSection("Esame Olfattivo (AIS)", olfattivoFields)}
      {renderSection("Esame Gusto-Olfattivo (AIS)", gustoOlfattivoFields)}
      {renderSection("Struttura, Evoluzione e Armonia (AIS)", finaleFields)}
    </div>
  );
}

const heroStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(240px, 320px) 1fr",
  gap: 16,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 16,
  padding: 14,
  marginBottom: 18,
};

const heroImageStyle: React.CSSProperties = {
  width: "100%",
  height: 280,
  objectFit: "cover",
  borderRadius: 12,
};

const heroImagePlaceholderStyle: React.CSSProperties = {
  width: "100%",
  height: 280,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "#1e293b",
  color: "#94a3b8",
  fontWeight: 700,
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(1.6rem, 3vw, 2.3rem)",
  color: "#f8fafc",
};

const heroSubStyle: React.CSSProperties = {
  margin: "8px 0 10px",
  color: "#cbd5e1",
};

const heroMetaStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const badgeStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #374151",
  color: "#e5e7eb",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 13,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 16,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 16,
  padding: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  color: "#f59e0b",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 12,
  padding: 10,
};

const labelStyle: React.CSSProperties = {
  margin: "0 0 4px 0",
  color: "#f8fafc",
  fontSize: 13,
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: 14,
};

const notFoundStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 16,
  padding: 18,
  color: "#e2e8f0",
};
