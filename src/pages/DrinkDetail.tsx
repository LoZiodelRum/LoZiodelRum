
import "../App.css";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

type Drink = {
  id: string;
  nome: string;
  descrizione?: string;
  immagine?: string;
  marca?: string;
  categoria?: string;
  gradazione?: string;
  ingredienti?: string;
  ricetta?: string;
  [key: string]: any;
};

const technicalFieldLabelMap: Record<string, string> = {
  preparazione: "drink.preparation.label",
  note_degustazione: "drink.future.tastingNotes.title",
  storia: "drink.detail.fields.history",
  abbinamenti: "drink.future.pairing.title",
  garnish: "drink.garnish.label",
  bicchiere: "drink.glass.label",
  origine: "drink.origin.label",
  tasting_notes: "drink.tastingNotes.label",
  tastingnotes: "drink.tastingNotes.label",
  pairing: "drink.future.pairing.title",
  ingredienti_secondari: "drink.detail.fields.secondaryIngredients",
  tecnica: "drink.detail.fields.technique",
  metodo: "drink.detail.fields.method",
  tempo_preparazione: "drink.detail.fields.prepTime",
  difficolta: "drink.detail.fields.difficulty",
  temperatura_servizio: "drink.detail.fields.serviceTemperature",
  distilleria: "drink.detail.fields.distillery",
  invecchiamento: "drink.detail.fields.aging",
  tipo_botte: "drink.detail.fields.caskType",
  esame_visivo: "drink.detail.fields.visualExam",
  esame_olfattivo: "drink.detail.fields.olfactoryExam",
  esame_gustativo: "drink.detail.fields.gustatoryExam",
  note_aromatiche: "drink.detail.fields.aromaticNotes",
  sottocategoria: "drink.detail.fields.subcategory",
  base_alcolica: "drink.detail.fields.alcoholBase",
  ai_suggestions: "drink.future.aiSuggestions.title",
  bartender_suggestions: "drink.future.bartenderSuggestions.title",
  community_comments: "drink.future.communityComments.title",
};

function formatFieldKeyLabel(key: string) {
  const withSpaces = key.replace(/_/g, " ").trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function getFirstTranslatedField(
  record: Record<string, any> | null,
  fields: string[],
  language: string,
  fallback = ""
) {
  for (const field of fields) {
    const value = getTranslatedField(record, field, language, "");
    if (value.trim().length > 0) return value;
  }
  return fallback;
}

export default function DrinkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("drink");
  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchDrink() {
      setLoading(true);
      // Cerca prima nei cocktail
      const { data, error } = await supabase.from("cocktail").select("*").eq("id", id).single();
      if (!data || error) {
        // Se non trovato, cerca nei distillati
        const { data: distillato, error: err2 } = await supabase.from("distillati").select("*").eq("id", id).single();
        if (!distillato || err2) {
          setNotFound(true);
          setLoading(false);
          return;
        } else {
          setDrink(distillato);
        }
      } else {
        setDrink(data);
      }
      setLoading(false);
    }
    fetchDrink();
  }, [id]);

  useEffect(() => {
    console.log(drink);
  }, [drink]);

  if (loading) return <div className="page fade-in">{t("drink.states.loading")}</div>;
  if (notFound || !drink) return <div className="page fade-in">{t("drink.states.notFound")}</div>;

  const translatedName = getTranslatedField(drink, "nome", i18n.language, "-");
  const translatedBrand = getTranslatedField(drink, "marca", i18n.language, "");
  const translatedCategory = getTranslatedField(drink, "categoria", i18n.language, "");
  const translatedAbv = getTranslatedField(drink, "gradazione", i18n.language, "");
  const translatedDescription = getFirstTranslatedField(drink, ["descrizione", "description"], i18n.language, "");
  const translatedIngredients = getFirstTranslatedField(drink, ["ingredienti", "ingredients"], i18n.language, "");
  const translatedPreparation = getFirstTranslatedField(drink, ["preparazione", "ricetta", "recipe"], i18n.language, "");
  const translatedTastingNotes = getFirstTranslatedField(drink, ["note_degustazione", "degustazione", "tasting_notes", "tastingnotes"], i18n.language, "");
  const translatedHistory = getFirstTranslatedField(drink, ["storia", "history"], i18n.language, "");
  const translatedPairings = getFirstTranslatedField(drink, ["abbinamenti", "pairing", "pairings"], i18n.language, "");
  const translatedOrigin = getFirstTranslatedField(drink, ["provenienza", "origine", "origin"], i18n.language, "");
  const translatedAromaticNotes = getFirstTranslatedField(drink, ["note_aromatiche", "aromatic_notes"], i18n.language, "");
  const translatedPalate = getFirstTranslatedField(drink, ["sensazioni_al_palato", "palato"], i18n.language, "");

  const languageSuffixRegex = /_(it|en|es|de|fr|bg)$/i;
  const isItalianUi = String(i18n.language || "it").toLowerCase().startsWith("it");

  return (
    <>
      <Navbar />
      <div className="page fade-in" style={{ maxWidth: 800, margin: "0 auto", padding: 20, paddingTop: 86 }}>
      <button className="btn-primary" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        {t("drink.cta.back")}
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          {drink.immagine ? (
            <img src={drink.immagine} alt={translatedName} style={{ width: "100%", borderRadius: 16, marginBottom: 20 }} />
          ) : (
            <div className="no-img-placeholder" style={{ marginBottom: 20 }}>{t("drink.states.noImage")}</div>
          )}
        </div>
        <div style={{ flex: 2, minWidth: 260 }}>
          <h1 style={{ fontSize: "2rem", color: "#f5a623", marginBottom: 10 }}>{translatedName}</h1>
          {translatedBrand && <div style={{ color: "#666", marginBottom: 10 }}><b>{t("drink.detail.brand")}</b> {translatedBrand}</div>}
          {translatedCategory && <div style={{ color: "#666", marginBottom: 10 }}><b>{t("drink.detail.category")}</b> {translatedCategory}</div>}
          {translatedAbv && <div style={{ color: "#666", marginBottom: 10 }}><b>{t("drink.detail.abv")}</b> {translatedAbv}</div>}
          {translatedDescription && <div style={{ marginBottom: 16 }}>{translatedDescription}</div>}
          {translatedIngredients && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.ingredients.label")}</b>
              <div>{translatedIngredients}</div>
            </div>
          )}
          {translatedPreparation && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.preparation.label")}</b>
              <div>{translatedPreparation}</div>
            </div>
          )}
          {translatedTastingNotes && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.future.tastingNotes.title")}</b>
              <div>{translatedTastingNotes}</div>
            </div>
          )}
          {translatedHistory && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.detail.fields.history")}</b>
              <div>{translatedHistory}</div>
            </div>
          )}
          {translatedPairings && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.future.pairing.title")}</b>
              <div>{translatedPairings}</div>
            </div>
          )}
          {translatedOrigin && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.origin.label")}</b>
              <div>{translatedOrigin}</div>
            </div>
          )}
          {translatedAromaticNotes && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.detail.fields.aromaticNotes")}</b>
              <div>{translatedAromaticNotes}</div>
            </div>
          )}
          {translatedPalate && (
            <div style={{ marginBottom: 16 }}>
              <b>{t("drink.detail.fields.palate", { defaultValue: isItalianUi ? "Sensazioni al palato" : "Palate" })}</b>
              <div>{translatedPalate}</div>
            </div>
          )}
          {/* Mostra tutti gli altri campi utili */}
          {Object.entries(drink)
            .filter(
              ([k]) =>
                ![
                  "id",
                  "nome",
                  "immagine",
                  "marca",
                  "categoria",
                  "gradazione",
                  "descrizione",
                  "ingredienti",
                  "ricetta",
                  "preparazione",
                  "note_degustazione",
                  "storia",
                  "abbinamenti",
                  "provenienza",
                  "origine",
                  "note_aromatiche",
                  "sensazioni_al_palato",
                  "palato",
                  "description",
                  "ingredients",
                  "recipe",
                  "history",
                  "pairing",
                  "pairings",
                  "origin",
                  "aromatic_notes",
                  "created_at",
                  "updated_at",
                ].includes(k) &&
                !languageSuffixRegex.test(k) &&
                (technicalFieldLabelMap[k] || isItalianUi) &&
                getTranslatedField(drink, k, i18n.language, "").trim().length > 0
            )
            .map(([k]) => {
              const translatedValue = getTranslatedField(drink, k, i18n.language, "-");
              return (
                <div key={k} style={{ marginBottom: 10 }}>
                  <b>
                    {technicalFieldLabelMap[k]
                      ? t(technicalFieldLabelMap[k])
                      : t("drink.detail.fields.dynamic", { field: formatFieldKeyLabel(k) })}
                  </b>{" "}
                  {translatedValue}
                </div>
              );
            })}
        </div>
      </div>
      </div>
    </>
  );
}

/* STILI ORIGINALI */

const layout = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 60,
  maxWidth: "min(100%, 68rem)",
  margin: "10px auto 0",
};

const left = { flex: 1 };
const right = { flex: "1 1 320px" };

const title = {
  fontSize: "clamp(1.8rem, 5vw, 2.25rem)",
  marginBottom: 20,
  color: "#4b2e1f",
};

const mobileCocktailTitle = {
  display: "none",
  fontSize: "clamp(1.6rem, 6vw, 2rem)",
  margin: "8px 0 14px",
  color: "#4b2e1f",
};

const description = { marginBottom: 20, color: "#333" };

const sectionTitle = {
  marginTop: 25,
  marginBottom: 8,
  fontSize: 18,
  color: "#4b2e1f",
};

const text = { color: "#444" };

const image = {
  width: "100%",
  borderRadius: 16,
  marginBottom: 20,
};

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  overflow: "hidden",
};

const boxTitle = { marginBottom: 10, color: "#4b2e1f" };

const row = {
  padding: "6px 0",
  borderBottom: "1px solid #eee",
  color: "#4b2e1f",
};

const editorBox = {
  background: "#fff",
  padding: 20,
  marginBottom: 30,
  borderRadius: 16,
  overflow: "hidden",
};

const field = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const inputStyle = {
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const textareaStyle = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const buttons = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const btnGreen = {
  background: "green",
  color: "#fff",
  padding: "8px 16px",
};

const btnRed = {
  background: "red",
  color: "#fff",
  padding: "8px 16px",
};