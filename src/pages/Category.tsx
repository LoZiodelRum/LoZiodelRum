import "../App.css";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

type Item = {
  id: string;
  nome: string;
  immagine: string | null;
  marca?: string;
};

export default function Category() {
  const { categoria, tipo } = useParams();
  const selectedType = categoria || tipo;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("drink");

  const [items, setItems] = useState<Item[]>([]);
  const [cocktailRows, setCocktailRows] = useState<any[]>([]);
  const [distillatiRows, setDistillatiRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [selectedType]);

  useEffect(() => {
    if (loading) return;
    rebuildItems(selectedType, cocktailRows, distillatiRows);
  }, [i18n.language, selectedType, cocktailRows, distillatiRows, loading]);

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

  function rebuildItems(type: string | undefined, cocktails: any[], distillati: any[]) {
    setItems([]);

    const currentType = type || "cocktail";

    if (currentType === "cocktail") {
      const sorted = [...cocktails].sort((a: any, b: any) =>
        getTranslatedField(a, "nome", i18n.language, "-").localeCompare(getTranslatedField(b, "nome", i18n.language, "-"))
      );

      setItems(
        sorted.map((c: any) => ({
          id: c.id,
          nome: getTranslatedField(c, "nome", i18n.language, "-"),
          immagine: getImage(c),
        }))
      );
      return;
    }

    if (currentType === "rum" || currentType === "whisky" || currentType === "altri") {
      const mappedDistillati = distillati.map((d: any) => ({
        id: d.id,
        nome: getTranslatedField(d, "nome", i18n.language, t("drink.fallbacks.distillatoName")),
        marca: d.marca || "",
        immagine: getImage(d),
        categoria_testo: distillatoCategoryText(d),
      }));

      const mappedCocktailDistillati = cocktails
        .filter((record: any) => isDistillatoLike(record))
        .map((d: any) => ({
          id: d.id,
          nome: getTranslatedField(d, "nome", i18n.language, t("drink.fallbacks.distillatoName")),
          marca: d.marca || d.distilleria || "",
          immagine: getImage(d),
          categoria_testo: distillatoCategoryText(d),
        }));

      const source = mappedDistillati.length ? mappedDistillati : mappedCocktailDistillati;

      let filtered = source;

      if (currentType === "rum") {
        filtered = source.filter((d: any) =>
          d.categoria_testo.includes("rum") ||
          d.categoria_testo.includes("rhum") ||
          d.categoria_testo.includes("ron") ||
          d.categoria_testo.includes("cachaca")
        );
      }

      if (currentType === "whisky") {
        filtered = source.filter(
          (d: any) =>
            d.categoria_testo.includes("whisky") ||
            d.categoria_testo.includes("whiskey") ||
            d.categoria_testo.includes("scotch") ||
            d.categoria_testo.includes("bourbon") ||
            d.categoria_testo.includes("rye") ||
            d.categoria_testo.includes("single malt")
        );
      }

      if (currentType === "altri") {
        filtered = source.filter(
          (d: any) =>
            !d.categoria_testo.includes("rum") &&
            !d.categoria_testo.includes("rhum") &&
            !d.categoria_testo.includes("ron") &&
            !d.categoria_testo.includes("cachaca") &&
            !d.categoria_testo.includes("whisky") &&
            !d.categoria_testo.includes("whiskey") &&
            !d.categoria_testo.includes("scotch") &&
            !d.categoria_testo.includes("bourbon") &&
            !d.categoria_testo.includes("rye") &&
            !d.categoria_testo.includes("single malt")
        );
      }

      const sorted = [...filtered].sort((a: any, b: any) => a.nome.localeCompare(b.nome));

      setItems(
        sorted.map((d: any) => ({
          id: d.id,
          nome: d.nome,
          marca: d.marca,
          immagine: getImage(d),
        }))
      );
      return;
    }

    const sorted = [...cocktails].sort((a: any, b: any) =>
      getTranslatedField(a, "nome", i18n.language, "-").localeCompare(getTranslatedField(b, "nome", i18n.language, "-"))
    );

    setItems(
      sorted.map((c: any) => ({
        id: c.id,
        nome: getTranslatedField(c, "nome", i18n.language, "-"),
        immagine: getImage(c),
      }))
    );
  }

  async function load() {
    setLoading(true);

    const cocktailSelectColumns = [
      "id",
      "nome",
      "nome_en",
      "nome_bg",
      "immagine",
      "immagine_url",
      "image",
      "img",
      "marca",
      "distilleria",
      "categoria",
      "tipologia",
      "tipo",
      "tipo_distillato",
      "categoria_distillato",
      "base_alcolica",
      "invecchiamento",
      "tipo_botte",
      "esame_visivo",
      "esame_olfattivo",
      "esame_gustativo",
      "note_aromatiche",
      "sottocategoria",
    ].join(", ");

    const distillatiSelectColumns = [
      "id",
      "nome",
      "nome_en",
      "nome_bg",
      "marca",
      "categoria",
      "tipologia",
      "tipo",
      "tipo_distillato",
      "categoria_distillato",
      "base_alcolica",
      "invecchiamento",
      "tipo_botte",
      "esame_visivo",
      "esame_olfattivo",
      "esame_gustativo",
      "note_aromatiche",
      "sottocategoria",
      "immagine",
      "immagine_url",
      "image",
      "img",
    ].join(", ");

    // 🍸 COCKTAIL
    if (selectedType === "cocktail") {
      const { data, error } = await supabase.from("cocktail").select(cocktailSelectColumns);

      if (error) console.error(error);

      const cocktails = Array.isArray(data) ? data : [];
      setCocktailRows(cocktails);
      setDistillatiRows([]);
      rebuildItems(selectedType, cocktails, []);
    }

    // 🥃 DISTILLATI
    else if (selectedType === "rum" || selectedType === "whisky" || selectedType === "altri") {
      const { data, error } = await supabase.from("distillati").select(distillatiSelectColumns);

      let distillatiRows: any[] = Array.isArray(data) ? data : [];

      if ((!distillatiRows.length && error) || !distillatiRows.length) {
        const { data: distillatoData } = await supabase.from("distillato").select(distillatiSelectColumns);
        if (Array.isArray(distillatoData) && distillatoData.length) {
          distillatiRows = distillatoData;
        }
      }

      if (error) console.error(error);

      let cocktails: any[] = [];
      if (!distillatiRows.length) {
        const { data: cocktailData } = await supabase.from("cocktail").select(cocktailSelectColumns);
        cocktails = Array.isArray(cocktailData) ? cocktailData : [];
      }

      setDistillatiRows(distillatiRows);
      setCocktailRows(cocktails);
      rebuildItems(selectedType, cocktails, distillatiRows);
    }

    // 🔁 FALLBACK → cocktail
    else {
      const { data } = await supabase.from("cocktail").select(cocktailSelectColumns);
      const cocktails = Array.isArray(data) ? data : [];
      setCocktailRows(cocktails);
      setDistillatiRows([]);
      rebuildItems(selectedType, cocktails, []);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="page fade-in">{t("drink.states.loading")}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="fade-in drink-page-white" style={{ marginTop: 32 }}>
        <section className="drink-section-white">
          <h1 className="drink-page-heading" style={{ marginBottom: 14 }}>{t(`drink.sections.${getTitle(selectedType)}`)}</h1>
          <div className="drink-grid-uniform">
            {items.map((item) => (
              <article
                key={item.id}
                className="drink-card-uniform"
                onClick={() => navigate(`/drink/${item.id}`)}
              >
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
        </section>
      </div>
    </>
  );
}

/* ---------- HELPERS ---------- */

function getTitle(tipo: any) {
  if (tipo === "cocktail") return "cocktail";
  if (tipo === "rum") return "rum";
  if (tipo === "whisky") return "whisky";
  if (tipo === "altri") return "otherDistillates";
  return "cocktail";
}