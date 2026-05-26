import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";
import { normalizeText, safeArray } from "../utils/runtime";

type VinoCard = {
  id: string;
  nome: string;
  immagine?: string | null;
  categorySlug: "rossi" | "bianchi" | "rosati" | "bollicine" | "altri-vini";
  categoria: string;
  alcol: string;
  descrizione: string;
  placeholder?: boolean;
};

const VINI_SELECT_ATTEMPTS = [
  "*",
  "id, nome, nome_en, nome_bg, immagine, image, categoria, categoria_en, categoria_bg, alcol, alcol_en, alcol_bg, grado_alcolico, descrizione, descrizione_en, descrizione_bg",
  "id, nome, nome_en, nome_bg, immagine, categoria, categoria_en, categoria_bg, alcol, alcol_en, alcol_bg, grado_alcolico, descrizione, descrizione_en, descrizione_bg",
  "id, nome, nome_en, nome_bg, immagine, categoria, categoria_en, categoria_bg, grado_alcolico, descrizione, descrizione_en, descrizione_bg",
  "id, nome, nome_en, nome_bg, immagine, categoria, grado_alcolico, descrizione",
  "id, nome, immagine, categoria, grado_alcolico, descrizione",
];

export default function Vini() {
  const { t, i18n } = useTranslation("drink");
  const [vini, setVini] = useState<VinoCard[]>([]);
  const [rawViniRows, setRawViniRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { categoria } = useParams();

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!rawViniRows.length) return;
    rebuildVini(rawViniRows);
  }, [rawViniRows, i18n.language]);

  async function load() {
    setLoading(true);

    let rows: any[] = [];
    for (const columns of VINI_SELECT_ATTEMPTS) {
      const result = await supabase.from("vini").select(columns);
      if (!result.error) {
        rows = Array.isArray(result.data) ? result.data : [];
        break;
      }
    }

    if (rows.length) {
      setRawViniRows(rows);
      rebuildVini(rows);
      setLoading(false);
      return;
    }


    setRawViniRows([]);
    setVini([]);
    setLoading(false);
  }

  function rebuildVini(rows: any[]) {
    function normalize(value: any) {
      return normalizeText(value);
    }

    function categorySlugFor(vino: any): "rossi" | "bianchi" | "rosati" | "bollicine" | "altri-vini" {
      const categoryCandidates = [
        getTranslatedField(vino, "categoria", i18n.language, ""),
        getTranslatedField(vino, "categoria", "it", ""),
        getTranslatedField(vino, "categoria", "en", ""),
        getTranslatedField(vino, "categoria", "bg", ""),
        getTranslatedField(vino, "categoria", "es", ""),
      ];

      const haystack = categoryCandidates.map(normalize).join(" ");

      if (haystack.includes("ross") || haystack.includes("red")) return "rossi";
      if (haystack.includes("bian") || haystack.includes("whit")) return "bianchi";
      if (haystack.includes("rosa") || haystack.includes("rose")) return "rosati";
      if (haystack.includes("bollic") || haystack.includes("spark") || haystack.includes("champ")) return "bollicine";
      return "altri-vini";
    }

    const mapped = safeArray<any>(rows)
      .map((vino: any) => ({
        id: String(vino.id),
        nome: getTranslatedField(vino, "nome", i18n.language, t("drink.wines.fallbackName")),
        immagine: vino.immagine ?? vino.image ?? null,
        categorySlug: categorySlugFor(vino),
        categoria: getTranslatedField(vino, "categoria", i18n.language, t("drink.wines.fallbackCategory")),
        alcol: getTranslatedField(vino, "alcol", i18n.language, vino.grado_alcolico || ""),
        descrizione: getTranslatedField(vino, "descrizione", i18n.language, ""),
      }))
      .sort((a: VinoCard, b: VinoCard) => a.nome.localeCompare(b.nome));

    setVini(mapped);
  }

  const rossiAll = useMemo(() => vini.filter((vino) => vino.categorySlug === "rossi"), [vini]);
  const bianchiAll = useMemo(() => vini.filter((vino) => vino.categorySlug === "bianchi"), [vini]);
  const rosatiAll = useMemo(() => vini.filter((vino) => vino.categorySlug === "rosati"), [vini]);
  const bollicineAll = useMemo(() => vini.filter((vino) => vino.categorySlug === "bollicine"), [vini]);
  const altriAll = useMemo(() => vini.filter((vino) => vino.categorySlug === "altri-vini"), [vini]);

  const rossi = useMemo(() => rossiAll.slice(0, 6), [rossiAll]);
  const bianchi = useMemo(() => bianchiAll.slice(0, 6), [bianchiAll]);
  const rosati = useMemo(() => rosatiAll.slice(0, 6), [rosatiAll]);
  const bollicine = useMemo(() => bollicineAll.slice(0, 6), [bollicineAll]);
  const altri = useMemo(() => altriAll.slice(0, 6), [altriAll]);

  const categoryConfig: Record<string, { title: string; items: VinoCard[] }> = {
    rossi: { title: t("drink.wines.categories.red"), items: rossiAll },
    bianchi: { title: t("drink.wines.categories.white"), items: bianchiAll },
    rosati: { title: t("drink.wines.categories.rose"), items: rosatiAll },
    bollicine: { title: t("drink.wines.categories.sparkling"), items: bollicineAll },
    "altri-vini": { title: t("drink.wines.categories.otherWines"), items: altriAll },
  };

  if (loading) {
    return <div className="page fade-in">{t("drink.states.loading")}</div>;
  }

  function normalizeWineName(name: string) {
    return normalizeText(name);
  }

  function renderSection(title: string, list: VinoCard[], tipo: string, fillPlaceholders = true) {
    const cards = [...list];
    if (fillPlaceholders) {
      while (cards.length < 6) {
        cards.push({
          id: `placeholder-${tipo}-${cards.length}`,
          nome: t("drink.states.comingSoon"),
          immagine: null,
          categorySlug: "altri-vini",
          categoria: "",
          alcol: "",
          descrizione: "",
          placeholder: true,
        });
      }
    }

    const isCategoryPage = Boolean(categoria);

    if (!cards.length && isCategoryPage) {
      return (
        <section className="drink-section-white" id={tipo}>
          <div className="drink-section-header">
            <h2 className="drink-section-title">{title}</h2>
          </div>
          <p style={{ color: "#cbd5e1", marginTop: 8 }}>{t("drink.wines.states.emptyCategory")}</p>
        </section>
      );
    }

    if (!cards.length) return null;

    return (
      <section className="drink-section-white" id={tipo}>
        <div className="drink-section-header">
          <h2 className="drink-section-title">{title}</h2>
          {!isCategoryPage && (
            <button className="btn-primary btn-small" onClick={() => navigate(`/vini/categoria/${tipo}`)}>
              {t("drink.cta.seeAll")}
            </button>
          )}
        </div>

        <div className="drink-grid-uniform vini-grid">
          {cards.map((item) => (
            <article
              key={item.id}
              className="drink-card-uniform"
              role={item.placeholder ? undefined : "button"}
              tabIndex={item.placeholder ? -1 : 0}
              onClick={() => {
                if (!item.placeholder) navigate(`/vini/${item.id}`);
              }}
              onKeyDown={(e) => {
                if (!item.placeholder && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  navigate(`/vini/${item.id}`);
                }
              }}
              style={item.placeholder ? { opacity: 0.65, cursor: "default" } : undefined}
            >
              {item.immagine ? (
                <img
                  src={item.immagine}
                  alt={normalizeWineName(item.nome)}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="no-img-placeholder"
                  style={{ background: "#0f172a", color: "#cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>🍷</span>
                  <span>{t("drink.states.imageComingSoon")}</span>
                </div>
              )}
              <div className="drink-card-caption">
                <h3>{normalizeWineName(item.nome)}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="fade-in drink-page-white vini-preview-page"
        style={{
          background: "#0b0b0b",
        }}
      >
        <style>{`
          .vini-preview-page .drink-section-white {
            background: transparent;
          }

          .vini-preview-page .drink-section-title {
            color: #f5a623 !important;
          }

          @media (min-width: 1024px) {
            .vini-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }

          .vini-preview-page .drink-card-caption h3 {
            font-size: 15px;
            line-height: 1.15;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
          }

          @media (max-width: 768px) {
            .vini-preview-page .drink-card-caption {
              min-height: 34px !important;
              height: 34px !important;
              padding: 0 8px !important;
            }
          }
        `}</style>
        {categoria && categoryConfig[categoria]
          ? renderSection(categoryConfig[categoria].title, categoryConfig[categoria].items, categoria, false)
          : (
            <>
              {renderSection(t("drink.wines.categories.red"), rossi, "rossi")}
              {renderSection(t("drink.wines.categories.white"), bianchi, "bianchi")}
              {renderSection(t("drink.wines.categories.rose"), rosati, "rosati")}
              {renderSection(t("drink.wines.categories.sparkling"), bollicine, "bollicine")}
              {renderSection(t("drink.wines.categories.otherWines"), altri, "altri-vini")}
            </>
          )}
      </div>
    </>
  );
}