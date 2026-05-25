import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

type VinoRecord = Record<string, any>;

const baseFields: Array<{ key: string; labelKey: string }> = [
  { key: "nome", labelKey: "drink.wines.detail.fields.name" },
  { key: "descrizione", labelKey: "drink.wines.detail.fields.description" },
  { key: "annata", labelKey: "drink.wines.detail.fields.vintage" },
  { key: "cantina", labelKey: "drink.wines.detail.fields.winery" },
  { key: "vitigno", labelKey: "drink.wines.detail.fields.grape" },
  { key: "grado_alcolico", labelKey: "drink.wines.detail.fields.alcoholContent" },
  { key: "zona", labelKey: "drink.wines.detail.fields.area" },
  { key: "denominazione", labelKey: "drink.wines.detail.fields.denomination" },
  { key: "categoria", labelKey: "drink.wines.detail.fields.category" },
  { key: "abbinamenti", labelKey: "drink.wines.detail.fields.pairings" },
  { key: "note_degustazione", labelKey: "drink.wines.detail.fields.tastingNotes" },
  { key: "storia", labelKey: "drink.wines.detail.fields.history" },
  { key: "temperatura_servizio", labelKey: "drink.wines.detail.fields.serviceTemperature" },
  { key: "note_personali", labelKey: "drink.wines.detail.fields.personalNotes" },
  { key: "valutazione", labelKey: "drink.wines.detail.fields.rating" },
];

const visivoFields: Array<{ key: string; labelKey: string }> = [
  { key: "limpidezza", labelKey: "drink.wines.detail.fields.clarity" },
  { key: "colore", labelKey: "drink.wines.detail.fields.color" },
  { key: "consistenza", labelKey: "drink.wines.detail.fields.consistency" },
  { key: "effervescenza", labelKey: "drink.wines.detail.fields.effervescence" },
];

const olfattivoFields: Array<{ key: string; labelKey: string }> = [
  { key: "intensita_olfattiva", labelKey: "drink.wines.detail.fields.olfactoryIntensity" },
  { key: "complessita", labelKey: "drink.wines.detail.fields.complexity" },
  { key: "qualita_olfattiva", labelKey: "drink.wines.detail.fields.olfactoryQuality" },
  { key: "descrizione_olfattiva", labelKey: "drink.wines.detail.fields.olfactoryDescription" },
];

const gustoOlfattivoFields: Array<{ key: string; labelKey: string }> = [
  { key: "zuccheri", labelKey: "drink.wines.detail.fields.sugars" },
  { key: "alcoli", labelKey: "drink.wines.detail.fields.alcohols" },
  { key: "polialcoli", labelKey: "drink.wines.detail.fields.polyalcohols" },
  { key: "acidita", labelKey: "drink.wines.detail.fields.acidity" },
  { key: "tannini", labelKey: "drink.wines.detail.fields.tannins" },
  { key: "sali_minerali", labelKey: "drink.wines.detail.fields.mineralSalts" },
];

const finaleFields: Array<{ key: string; labelKey: string }> = [
  { key: "equilibrio", labelKey: "drink.wines.detail.fields.balance" },
  { key: "intensita_gusto", labelKey: "drink.wines.detail.fields.tasteIntensity" },
  { key: "persistenza", labelKey: "drink.wines.detail.fields.persistence" },
  { key: "qualita_gusto", labelKey: "drink.wines.detail.fields.tasteQuality" },
  { key: "corpo", labelKey: "drink.wines.detail.fields.body" },
  { key: "stato_evolutivo", labelKey: "drink.wines.detail.fields.evolutionState" },
  { key: "armonia", labelKey: "drink.wines.detail.fields.harmony" },
];

const fieldAliases: Record<string, string[]> = {
  nome: ["nome", "name"],
  descrizione: ["descrizione", "description"],
  categoria: ["categoria", "category"],
  abbinamenti: ["abbinamenti", "pairing", "pairings"],
  note_degustazione: ["note_degustazione", "degustazione", "tasting_notes", "tastingnotes"],
  storia: ["storia", "history"],
  zona: ["zona", "provenienza", "origine", "origin"],
  intensita_gusto: ["intensita_gusto", "sensazioni_al_palato", "palato"],
  note_aromatiche: ["note_aromatiche", "aromatic_notes"],
};

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
  const { t, i18n } = useTranslation("drink");

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

    try {
      const fetchVino = async (tableName: "vini" | "Vini") => {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*&id=eq.${encodeURIComponent(id)}`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (!response.ok) return null;

        const payload = await response.json().catch(() => []);
        return Array.isArray(payload) ? payload[0] ?? null : null;
      };

      const lower = await fetchVino("vini");
      if (lower) {
        setVino(lower);
        setLoading(false);
        return;
      }

      const upper = await fetchVino("Vini");
      if (upper) {
        setVino(upper);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Wine detail load failed:", error);
    }

    setVino(null);
    setLoading(false);
  }

  const imageUrl = useMemo(() => {
    const primary = typeof vino?.immagine === "string" ? vino.immagine.trim() : "";
    if (primary) return primary;
    return typeof vino?.image === "string" ? vino.image.trim() : "";
  }, [vino]);

  const translatedName = vino ? getTranslatedField(vino, "nome", i18n.language, "-") : "-";
  const translatedCategory = vino ? getTranslatedField(vino, "categoria", i18n.language, "-") : "-";
  const translatedVintage = vino ? getTranslatedField(vino, "annata", i18n.language, "-") : "-";
  const translatedWinery = vino ? getTranslatedField(vino, "cantina", i18n.language, "-") : "-";

  const heroImageStyleForWine = useMemo(() => {
    return {
      ...heroImageStyle,
      objectFit: "contain" as const,
      transform: "scale(0.8)",
      transformOrigin: "center",
      background: "#020617",
    };
  }, []);

  function renderSection(title: string, fields: Array<{ key: string; labelKey: string }>) {
    return (
      <section className="vino-detail-section" style={sectionStyle}>
        <h2 className="vino-detail-section-title" style={sectionTitleStyle}>{title}</h2>
        <div className="vino-detail-grid" style={gridStyle}>
          {fields.map((field) => {
            const aliases = fieldAliases[field.key] || [field.key];
            const translatedValue =
              aliases
                .map((alias) => getTranslatedField(vino, alias, i18n.language, ""))
                .find((value) => value.trim().length > 0)
              || "-";

            return (
              <article key={field.key} className="vino-detail-card" style={cardStyle}>
                <h3 className="vino-detail-label" style={labelStyle}>{t(field.labelKey)}</h3>
                <p className="vino-detail-value" style={valueStyle}>{normalizeValue(translatedValue)}</p>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (loading) {
    return <div className="page fade-in">{t("drink.wines.states.loadingDetail")}</div>;
  }

  if (!vino) {
    return (
      <div className="page fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <button className="btn-primary" onClick={() => navigate("/vini")} style={{ marginBottom: 20 }}>
          {t("drink.wines.cta.backToWines")}
        </button>
        <div style={notFoundStyle}>
          {t("drink.wines.states.notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in vino-detail-page" style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <style>{`
        @media (max-width: 768px) {
          .vino-detail-page {
            padding: 12px !important;
          }

          .vino-detail-back-btn {
            width: 100%;
            margin-bottom: 12px !important;
          }

          .vino-detail-hero {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 10px !important;
            border-radius: 12px !important;
            margin-bottom: 12px !important;
          }

          .vino-detail-hero-image,
          .vino-detail-hero-placeholder {
            height: 210px !important;
            border-radius: 10px !important;
          }

          .vino-detail-title {
            font-size: 1.45rem !important;
            line-height: 1.2;
          }

          .vino-detail-sub {
            margin: 6px 0 8px !important;
            font-size: 0.95rem;
          }

          .vino-detail-meta {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 6px !important;
          }

          .vino-detail-badge {
            border-radius: 10px !important;
            padding: 8px 10px !important;
            font-size: 12px !important;
          }

          .vino-detail-section {
            padding: 10px !important;
            margin-bottom: 12px !important;
            border-radius: 12px !important;
          }

          .vino-detail-section-title {
            font-size: 1.05rem;
            margin-bottom: 8px !important;
          }

          .vino-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .vino-detail-card {
            padding: 9px !important;
            border-radius: 10px !important;
          }

          .vino-detail-label {
            font-size: 12px !important;
            margin-bottom: 3px !important;
          }

          .vino-detail-value {
            font-size: 14px !important;
            line-height: 1.4;
          }
        }
      `}</style>
      <button className="btn-primary vino-detail-back-btn" onClick={() => navigate("/vini")} style={{ marginBottom: 16 }}>
        {t("drink.wines.cta.backToWines")}
      </button>

      <section className="vino-detail-hero" style={heroStyle}>
        {imageUrl ? (
          <img className="vino-detail-hero-image" src={imageUrl} alt={translatedName} style={heroImageStyleForWine} />
        ) : (
          <div className="vino-detail-hero-placeholder" style={heroImagePlaceholderStyle}>
            <span aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>🍷</span>
            <span>{t("drink.states.noImage")}</span>
          </div>
        )}

        <div>
          <h1 className="vino-detail-title" style={heroTitleStyle}>{translatedName}</h1>
          <p className="vino-detail-sub" style={heroSubStyle}>{t("drink.wines.detail.subtitle")}</p>
          <div className="vino-detail-meta" style={heroMetaStyle}>
            <span className="vino-detail-badge" style={badgeStyle}>{t("drink.wines.detail.badges.category")} {translatedCategory}</span>
            <span className="vino-detail-badge" style={badgeStyle}>{t("drink.wines.detail.badges.vintage")} {translatedVintage}</span>
            <span className="vino-detail-badge" style={badgeStyle}>{t("drink.wines.detail.badges.winery")} {translatedWinery}</span>
          </div>
        </div>
      </section>

      {renderSection(t("drink.wines.detail.sections.baseData"), baseFields)}
      {renderSection(t("drink.wines.detail.sections.visualExam"), visivoFields)}
      {renderSection(t("drink.wines.detail.sections.olfactoryExam"), olfattivoFields)}
      {renderSection(t("drink.wines.detail.sections.tasteOlfactoryExam"), gustoOlfattivoFields)}
      {renderSection(t("drink.wines.detail.sections.structureEvolutionHarmony"), finaleFields)}
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
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "#0f172a",
  color: "#cbd5e1",
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
