import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

const COCKTAIL_SELECT_ATTEMPTS = [
  "id, nome, nome_en, nome_bg, immagine, immagine_url, image, img, marca, distilleria, categoria, tipologia, tipo, tipo_distillato, categoria_distillato, base_alcolica, invecchiamento, tipo_botte, esame_visivo, esame_olfattivo, esame_gustativo, note_aromatiche, sottocategoria",
  "id, nome, nome_en, nome_bg, immagine, marca, distilleria, categoria, tipologia, tipo, tipo_distillato, categoria_distillato, base_alcolica, invecchiamento, tipo_botte, esame_visivo, esame_olfattivo, esame_gustativo, note_aromatiche, sottocategoria",
  "id, nome, nome_en, nome_bg, immagine, categoria, marca, distilleria",
  "id, nome, immagine, categoria",
  "*",
];

const DISTILLATI_SELECT_ATTEMPTS = [
  "id, nome, nome_en, nome_bg, marca, categoria, tipologia, tipo, tipo_distillato, categoria_distillato, base_alcolica, invecchiamento, tipo_botte, esame_visivo, esame_olfattivo, esame_gustativo, note_aromatiche, sottocategoria, immagine, immagine_url, image, img",
  "id, nome, nome_en, nome_bg, marca, categoria, tipologia, tipo, tipo_distillato, categoria_distillato, base_alcolica, invecchiamento, tipo_botte, esame_visivo, esame_olfattivo, esame_gustativo, note_aromatiche, sottocategoria, immagine",
  "id, nome, nome_en, nome_bg, marca, categoria, immagine",
  "id, nome, marca, categoria, immagine",
  "*",
];

type Cocktail = {
  id: string;
  nome: string;
  immagine: string | null;
};

type Distillato = {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  immagine: string | null;
};

export default function Drink() {
  const { t, i18n } = useTranslation("drink");
  const [cocktail, setCocktail] = useState<Cocktail[]>([]);
  const [rum, setRum] = useState<Distillato[]>([]);
  const [whisky, setWhisky] = useState<Distillato[]>([]);
  const [altri, setAltri] = useState<Distillato[]>([]);
  const [cocktailRows, setCocktailRows] = useState<any[]>([]);
  const [distillatiRows, setDistillatiRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!cocktailRows.length && !distillatiRows.length) return;
    rebuildLists(cocktailRows, distillatiRows);
  }, [cocktailRows, distillatiRows, i18n.language]);

  async function load() {
    setLoading(true);

    try {
      async function selectWithFallback(tableName: "cocktail" | "distillati" | "distillato", attempts: string[]) {
        for (const columns of attempts) {
          const result = await supabase.from(tableName).select(columns);
          if (!result.error) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        return [];
      }

      const cocktailData = await selectWithFallback("cocktail", COCKTAIL_SELECT_ATTEMPTS);
      let distillatiRows: any[] = await selectWithFallback("distillati", DISTILLATI_SELECT_ATTEMPTS);

      if (!distillatiRows.length) {
        distillatiRows = await selectWithFallback("distillato", DISTILLATI_SELECT_ATTEMPTS);
      }

      setCocktailRows(cocktailData);
      setDistillatiRows(distillatiRows);
      rebuildLists(cocktailData, distillatiRows);
    } catch (error) {
      console.error("Drink load failed:", error);
      setCocktailRows([]);
      setDistillatiRows([]);
      setCocktail([]);
      setRum([]);
      setWhisky([]);
      setAltri([]);
    } finally {
      setLoading(false);
    }
  }

  function rebuildLists(cocktailData: any[], sourceDistillatiRows: any[]) {
    function getImage(obj: any) {
      return obj.immagine || obj.immagine_url || obj.image || obj.img || null;
    }

    function normalize(value: any) {
      return String(value || "").toLowerCase().trim();
    }

    function distillatoCategoryText(d: any) {
      const categoria = [
        d.categoria,
        d.tipologia,
        d.tipo,
        d.tipo_distillato,
        d.categoria_distillato,
        d.base_alcolica,
        d.nome,
        d.nome_en,
        d.nome_bg,
        d.sottocategoria,
      ]
        .map(normalize)
        .find((value) => value.length > 0) || "";

      const nomeMarca = `${normalize(d.nome)} ${normalize(d.marca)}`.trim();
      return `${categoria} ${nomeMarca}`.trim();
    }

    function isDistillatoLike(record: any) {
      const cat = normalize(record?.categoria);
      const hasDistillatoCategory = cat.includes("distillat");
      const hasDistillatoFields = [
        record?.distilleria,
        record?.invecchiamento,
        record?.tipo_botte,
        record?.esame_visivo,
        record?.esame_olfattivo,
        record?.esame_gustativo,
        record?.note_aromatiche,
        record?.sottocategoria,
      ].some((value) => normalize(value).length > 0);
      return hasDistillatoCategory || hasDistillatoFields;
    }

    if (cocktailData.length) {
      const sorted = cocktailData.sort((a: any, b: any) => {
        const aName = getTranslatedField(a, "nome", i18n.language, t("drink.title"));
        const bName = getTranslatedField(b, "nome", i18n.language, t("drink.title"));
        return aName.localeCompare(bName);
      });
      setCocktail(
        sorted.slice(0, 6).map((c: any) => ({
          id: c.id,
          nome: getTranslatedField(c, "nome", i18n.language, t("drink.title")),
          immagine: getImage(c),
        }))
      );
    } else {
      setCocktail([]);
    }

    const mappedDistillati = sourceDistillatiRows
      .map((d: any) => ({
        id: d.id,
        nome: getTranslatedField(d, "nome", i18n.language, t("drink.fallbacks.distillatoName")),
        marca: d.marca || "",
        categoria: distillatoCategoryText(d),
        immagine: getImage(d),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const cocktailDistillatiFallback: Distillato[] = (cocktailData || [])
      .filter((record: any) => isDistillatoLike(record))
      .map((c: any) => ({
        id: c.id,
        nome: getTranslatedField(c, "nome", i18n.language, t("drink.fallbacks.distillatoName")),
        marca: c.marca || c.distilleria || "",
        categoria: distillatoCategoryText(c),
        immagine: getImage(c),
      }))
      .sort((a: Distillato, b: Distillato) => a.nome.localeCompare(b.nome));

    const sourceDistillati = mappedDistillati.length ? mappedDistillati : cocktailDistillatiFallback;

    if (sourceDistillati.length) {
      const mapped = sourceDistillati
        .map((d: any) => ({
          id: d.id,
          nome: d.nome,
          marca: d.marca || "",
          categoria: d.categoria,
          immagine: d.immagine,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      const containsAny = (text: string, words: string[]) => words.some((word) => text.includes(word));
      const rumWords = ["rum", "rhum", "ron", "cachaca"];
      const whiskyWords = ["whisky", "whiskey", "scotch", "bourbon", "rye", "single malt"];

      const rumCandidates = mapped.filter((d) => containsAny(d.categoria, rumWords));
      const whiskyCandidates = mapped.filter((d) => containsAny(d.categoria, whiskyWords));
      const altriCandidates = mapped.filter((d) => !containsAny(d.categoria, rumWords) && !containsAny(d.categoria, whiskyWords));

      setRum(rumCandidates.slice(0, 6));
      setWhisky(whiskyCandidates.slice(0, 6));
      setAltri(altriCandidates.slice(0, 6));
    } else {
      setRum([]);
      setWhisky([]);
      setAltri([]);
    }
  }

  if (loading) {
    return <div className="page fade-in">{t("drink.states.loading")}</div>;
  }

  function renderSection(title: string, list: any[], tipo: string) {
    return (
      <section className="drink-section-white">
        <div className="drink-section-header" style={{ justifyContent: 'flex-end' }}>
          <h2 className="drink-section-title" style={{ marginRight: 'auto' }}>{title}</h2>
          <button className="btn-primary btn-small" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/categoria/${tipo}`)}>
            {t("drink.cta.seeAll")}
          </button>
        </div>

        {!list.length ? (
          <p style={{ textAlign: "center", color: "#999" }}>{t("drink.states.noResults")}</p>
        ) : (
          <div className="drink-grid-uniform">
            {list.map((item) => (
              <article key={item.id} className="drink-card-uniform" onClick={() => navigate(`/drink/${item.id}`)}>
                {item.immagine ? (
                  <img src={item.immagine} alt={item.nome} />
                ) : (
                  <div className="no-img-placeholder">{t("drink.states.noImage")}</div>
                )}
                <div className="drink-card-caption">
                  <h3 translate="no">{item.nome}</h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <style>{`
        .global-page-content {
          background: #fff !important;
        }
      `}</style>
      <Navbar />
      <div className="fade-in drink-page-white" style={{ paddingTop: 32 }}>
        {renderSection(t("drink.sections.cocktail"), cocktail, "cocktail")}
        {renderSection(t("drink.sections.rum"), rum, "rum")}
        {renderSection(t("drink.sections.whisky"), whisky, "whisky")}
        {renderSection(t("drink.sections.otherDistillates"), altri, "altri")}
      </div>
    </>
  );
}
