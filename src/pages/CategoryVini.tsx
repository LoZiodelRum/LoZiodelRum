import "../App.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

export default function CategoryVini() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("drink");
  const [vini, setVini] = useState<any[]>([]);
  const [rawViniRows, setRawViniRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function getCategoryTitle(slug?: string) {
    const normalized = String(slug || "").toLowerCase();
    if (normalized === "rossi") return t("drink.wines.categories.red");
    if (normalized === "bianchi") return t("drink.wines.categories.white");
    if (normalized === "rosati") return t("drink.wines.categories.rose");
    if (normalized === "bollicine") return t("drink.wines.categories.sparkling");
    if (normalized === "altri-vini") return t("drink.wines.categories.otherWines");
    return t("drink.wines.title");
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Mappa i parametri url ai valori reali del db
      let dbCategoria = categoria;
      if (categoria) {
        if (categoria.toLowerCase() === "rossi") dbCategoria = "Rosso";
        else if (categoria.toLowerCase() === "bianchi") dbCategoria = "Bianco";
        else if (categoria.toLowerCase() === "rosati") dbCategoria = "Rosato";
        else if (categoria.toLowerCase() === "bollicine") dbCategoria = "Bollicine";
        else if (categoria.toLowerCase() === "altri-vini") dbCategoria = null; // gestito sotto
      }
      let data = [];
      if (dbCategoria) {
        const res = await supabase
          .from("vini")
          .select("id, nome, nome_en, nome_bg, immagine, image, categoria, categoria_en, categoria_bg")
          .ilike("categoria", `%${dbCategoria}%`);
        data = res.data || [];
      } else if (categoria && categoria.toLowerCase() === "altri-vini") {
        // Escludi tutte le categorie principali
        const res = await supabase
          .from("vini")
          .select("id, nome, nome_en, nome_bg, immagine, image, categoria, categoria_en, categoria_bg")
          .not("categoria", "ilike", "%Rosso%")
          .not("categoria", "ilike", "%Bianco%")
          .not("categoria", "ilike", "%Rosato%")
          .not("categoria", "ilike", "%Bollicine%")
        data = res.data || [];
      }
      setRawViniRows(data);
      setVini(data);
      setLoading(false);
    }
    load();
  }, [categoria]);

  useEffect(() => {
    if (!rawViniRows.length) return;
    setVini(rawViniRows);
  }, [rawViniRows, i18n.language]);

  if (loading) return <div className="page fade-in">{t("drink.states.loading")}</div>;

  return (
    <div className="fade-in drink-page-white vini-preview-page">
      <section className="drink-section-white">
        <div className="drink-top-bar">
          <button className="drink-back-btn" onClick={() => navigate(-1)} aria-label={t("drink.cta.backAria") }>
            ←
          </button>
          <h1 className="drink-page-heading">{getCategoryTitle(categoria)}</h1>
        </div>
        <div className="drink-section-header" style={{ justifyContent: 'flex-end', marginBottom: 18 }}>
          <h2 className="drink-section-title" style={{ marginRight: 'auto' }}>{t("drink.wines.title")}</h2>
          <button className="btn-primary btn-small" style={{ marginLeft: 'auto' }} onClick={() => navigate('/vini')}>
            {t("drink.cta.seeAll")}
          </button>
        </div>
        <div className="drink-grid-uniform vini-grid">
          {vini.length === 0 ? (
            <p style={{ color: "#cbd5e1", marginTop: 8 }}>{t("drink.wines.states.emptyCategory")}</p>
          ) : (
            vini.map((item) => {
              const imgUrl = item.immagine || item.image || null;
              const translatedName = getTranslatedField(item, "nome", i18n.language, "-");
              return (
                <article
                  key={item.id}
                  className="drink-card-uniform"
                  onClick={() => navigate(`/vini/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={translatedName}
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
                    <h3 translate="no">{translatedName}</h3>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
