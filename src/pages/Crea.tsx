import "../App.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import {
  getCocktailSuggestions,
  type CocktailPreferences,
  type SuggestedCocktail,
} from "../lib/cocktailConfigurator";

export default function Crea() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<CocktailPreferences>({});
  const [suggestions, setSuggestions] = useState<SuggestedCocktail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openGeneratedForms, setOpenGeneratedForms] = useState<Record<string, boolean>>({});
  const [savingNames, setSavingNames] = useState<Record<string, boolean>>({});
  const [savedNames, setSavedNames] = useState<Record<string, boolean>>({});

  const selectedCount = useMemo(
    () => Object.values(preferences).filter((value) => String(value || "").trim()).length,
    [preferences]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await getCocktailSuggestions(preferences);

    if (result.error) {
      setSuggestions([]);
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuggestions(result.cocktails);
    setLoading(false);
  }

  function updatePreference(key: keyof CocktailPreferences, value: string) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGeneratedForm(name: string) {
    setOpenGeneratedForms((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  async function saveGeneratedCocktail(cocktail: SuggestedCocktail) {
    setSavingNames((prev) => ({ ...prev, [cocktail.name]: true }));

    const nowIso = new Date().toISOString();
    const italianPayloads = [
      {
        nome: cocktail.name,
        ingredienti: cocktail.ingredients.join("; "),
        descrizione: cocktail.description,
        preparazione: `${cocktail.technique}. ${cocktail.doses.map((dose, index) => `${dose} ${cocktail.ingredients[index] || ""}`.trim()).join(", ")}`,
        bicchiere: cocktail.glass,
        guarnizione: cocktail.garnish,
        categoria: "cocktail",
        base_alcolica: preferences.base_alcolica || cocktail.base_spirit,
        intensita_alcolica: preferences.intensita_alcolica || null,
        profilo_gustativo: preferences.profilo_gustativo || null,
        profilo_aromatico: preferences.profilo_aromatico || null,
        stile_consumo: preferences.stile_consumo || null,
        carattere: preferences.carattere || null,
        created_at: nowIso,
      },
      {
        nome: cocktail.name,
        ingredienti: cocktail.ingredients.join("; "),
        descrizione: cocktail.description,
        preparazione: `${cocktail.technique}. ${cocktail.doses.map((dose, index) => `${dose} ${cocktail.ingredients[index] || ""}`.trim()).join(", ")}`,
        bicchiere: cocktail.glass,
        guarnizione: cocktail.garnish,
        categoria: "cocktail",
      },
    ];

    const englishPayloads = [
      {
        name: cocktail.name,
        ingredients: cocktail.ingredients,
        doses: cocktail.doses,
        base_alcolica: preferences.base_alcolica || cocktail.base_spirit,
        intensita_alcolica: preferences.intensita_alcolica || null,
        profilo_gustativo: preferences.profilo_gustativo || null,
        profilo_aromatico: preferences.profilo_aromatico || null,
        stile_consumo: preferences.stile_consumo || null,
        carattere: preferences.carattere || null,
        description: cocktail.description,
        technique: cocktail.technique,
        glass: cocktail.glass,
        garnish: cocktail.garnish,
      },
      {
        name: cocktail.name,
        description: cocktail.description,
      },
    ];

    const attempts: Array<{ table: string; payloads: Record<string, any>[] }> = [
      { table: "cocktail", payloads: italianPayloads },
      { table: "cocktails", payloads: englishPayloads },
    ];

    let lastMessage = "Impossibile salvare il cocktail generato.";

    for (const attempt of attempts) {
      for (const payload of attempt.payloads) {
        const { data: insertedRows, error: insertError } = await supabase
          .from(attempt.table)
          .insert([payload])
          .select("id");

        if (!insertError) {
          const insertedId = Array.isArray(insertedRows) && insertedRows[0]?.id ? String(insertedRows[0].id) : null;
          setSavedNames((prev) => ({ ...prev, [cocktail.name]: true }));
          setSavingNames((prev) => ({ ...prev, [cocktail.name]: false }));
          alert("Cocktail salvato nel catalogo ✅");

          if (insertedId && attempt.table === "cocktail") {
            navigate(`/drink/${insertedId}`);
          }

          return;
        }

        lastMessage = insertError.message || lastMessage;
      }
    }

    setSavingNames((prev) => ({ ...prev, [cocktail.name]: false }));
    alert(lastMessage);
  }

  const createdBy = user?.email || user?.id || "utente Lo Zio";
  const createdDate = new Date().toLocaleDateString("it-IT");

  return (
    <div className="page fade-in" style={{ maxWidth: 1180 }}>
      <div style={heroBoxStyle}>
        <div>
          <p style={eyebrowStyle}>Lo Zio Cocktail Configurator</p>
          <h1 style={titleStyle}>Crea</h1>
          <p style={introStyle}>
            Seleziona almeno 2 preferenze tra i 7 menu e lascia che Lo Zio trovi i cocktail piu coerenti dal database.
            Se il catalogo non basta, genera due ricette nuove con bilanciamento professionale.
          </p>
        </div>
        <div style={counterBoxStyle}>
          <span style={counterLabelStyle}>Preferenze selezionate</span>
          <strong style={counterValueStyle}>{selectedCount}/7</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={panelStyle}>
        <div style={gridStyle}>
          {preferenceFields.map((field) => (
            <div key={field.key} style={fieldStyle}>
              <label style={labelStyle}>{field.label}</label>
              <select
                value={preferences[field.key] || ""}
                onChange={(event) => updatePreference(field.key, event.target.value)}
                style={selectStyle}
              >
                <option value="">Scegli</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}

        <div style={actionsStyle}>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Analisi in corso..." : "Trova 2 cocktail"}
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setPreferences({});
              setSuggestions([]);
              setError(null);
              setOpenGeneratedForms({});
            }}
            style={secondaryButtonStyle}
          >
            Reset
          </button>
        </div>
      </form>

      <div style={resultsStyle}>
        {suggestions.map((cocktail) => (
          <article key={cocktail.name} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <p style={sourceTagStyle}>{cocktail.source === "database" ? "DAL DATABASE" : "GENERATO"}</p>
                <h2 style={cardTitleStyle}>{cocktail.name}</h2>
                <p style={metaStyle}>
                  Base: {cocktail.base_spirit} · Tecnica: {cocktail.technique} · Bicchiere: {cocktail.glass}
                </p>
              </div>
              <div style={scoreBadgeStyle}>Score {cocktail.matchScore}</div>
            </div>

            <div style={recipeGridStyle}>
              <section style={recipeBlockStyle}>
                <h3 style={sectionTitleStyle}>Ingredienti e dosi</h3>
                <ul style={listStyle}>
                  {cocktail.ingredients.map((ingredient, index) => (
                    <li key={`${cocktail.name}-${ingredient}-${index}`} style={listItemStyle}>
                      <span>{ingredient}</span>
                      <strong>{cocktail.doses[index] || "q.b."}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={recipeBlockStyle}>
                <h3 style={sectionTitleStyle}>Profilo</h3>
                <p style={bodyStyle}>{cocktail.description}</p>
                <p style={bodyStyle}><strong>Guarnizione:</strong> {cocktail.garnish}</p>
                <p style={bodyStyle}><strong>Bilanciamento:</strong> {cocktail.balance_explanation}</p>
              </section>
            </div>

            <section style={notesBoxStyle}>
              <h3 style={sectionTitleStyle}>Tasting notes</h3>
              <div style={notesRowStyle}>
                {cocktail.tasting_notes.map((note) => (
                  <span key={`${cocktail.name}-${note}`} style={noteChipStyle}>{note}</span>
                ))}
              </div>
            </section>

            {cocktail.source === "generated" && (
              <section style={fallbackStyle}>
                <p style={fallbackTextStyle}>Questo cocktail non e ancora nel catalogo</p>
                <button className="btn-primary" type="button" onClick={() => toggleGeneratedForm(cocktail.name)}>
                  CREA NUOVO COCKTAIL
                </button>

                {openGeneratedForms[cocktail.name] && (
                  <div style={generatedFormStyle}>
                    <div style={generatedFieldStyle}>
                      <label style={labelStyle}>Nome</label>
                      <input value={cocktail.name} readOnly style={inputStyle} />
                    </div>
                    <div style={generatedFieldStyle}>
                      <label style={labelStyle}>Ingredienti</label>
                      <textarea value={cocktail.ingredients.join(", ")} readOnly style={textareaStyle} />
                    </div>
                    <div style={generatedFieldStyle}>
                      <label style={labelStyle}>Dosi</label>
                      <textarea value={cocktail.doses.join(", ")} readOnly style={textareaStyle} />
                    </div>
                    <div style={generatedFieldStyle}>
                      <label style={labelStyle}>Creato da</label>
                      <input value={createdBy} readOnly style={inputStyle} />
                    </div>
                    <div style={generatedFieldStyle}>
                      <label style={labelStyle}>Data</label>
                      <input value={createdDate} readOnly style={inputStyle} />
                    </div>
                    <div style={{ ...generatedFieldStyle, gridColumn: "1 / -1" }}>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => saveGeneratedCocktail(cocktail)}
                        disabled={Boolean(savingNames[cocktail.name] || savedNames[cocktail.name])}
                      >
                        {savedNames[cocktail.name]
                          ? "Cocktail salvato"
                          : savingNames[cocktail.name]
                            ? "Salvataggio..."
                            : "Salva nel catalogo"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </article>
        ))}

        {!suggestions.length && !loading && !error && (
          <div style={emptyStateStyle}>
            Seleziona almeno 2 preferenze e avvia il configuratore per vedere i cocktail suggeriti.
          </div>
        )}
      </div>
    </div>
  );
}

const preferenceFields: Array<{
  key: keyof CocktailPreferences;
  label: string;
  options: string[];
}> = [
  { key: "base_alcolica", label: "Base alcolica", options: ["rum", "rum scuro", "gin", "vodka", "whisky", "brandy", "tequila", "mezcal"] },
  { key: "intensita_alcolica", label: "Intensita alcolica", options: ["leggera", "media", "alta", "strong", "strong & bold"] },
  { key: "profilo_gustativo", label: "Profilo gustativo", options: ["secco", "dolce", "amaro", "agrumato", "fresco", "speziato"] },
  { key: "profilo_aromatico", label: "Profilo aromatico", options: ["erbaceo", "floreale", "tropicale", "agrumato", "affumicato", "fruttato"] },
  { key: "stile_consumo", label: "Stile consumo", options: ["aperitivo", "after dinner", "highball", "tiki", "signature", "day drinking"] },
  { key: "carattere", label: "Carattere", options: ["elegante", "deciso", "esotico", "sperimentale", "meditativo", "funky"] },
];

const heroBoxStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
  marginBottom: 20,
  flexWrap: "wrap",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#f59e0b",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.12em",
};

const titleStyle: React.CSSProperties = {
  margin: "6px 0 10px",
  fontSize: "clamp(2rem, 4vw, 3rem)",
};

const introStyle: React.CSSProperties = {
  maxWidth: 760,
  color: "#cbd5e1",
};

const counterBoxStyle: React.CSSProperties = {
  minWidth: 170,
  background: "#111827",
  border: "1px solid #374151",
  borderRadius: 16,
  padding: 16,
};

const counterLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  marginBottom: 8,
};

const counterValueStyle: React.CSSProperties = {
  fontSize: 30,
  color: "#f8fafc",
};

const panelStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 20,
  padding: 20,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: 13,
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "#020617",
  border: "1px solid #334155",
  color: "#f8fafc",
  borderRadius: 12,
  padding: "12px 14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#020617",
  border: "1px solid #334155",
  color: "#f8fafc",
  borderRadius: 12,
  padding: "12px 14px",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
  flexWrap: "wrap",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#1f2937",
};

const errorBoxStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "rgba(127, 29, 29, 0.28)",
  border: "1px solid rgba(248, 113, 113, 0.45)",
  color: "#fecaca",
};

const resultsStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
  marginTop: 22,
};

const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 20,
  padding: 18,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const sourceTagStyle: React.CSSProperties = {
  margin: 0,
  color: "#f59e0b",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const cardTitleStyle: React.CSSProperties = {
  margin: "6px 0 6px",
  fontSize: "clamp(1.4rem, 2.6vw, 2rem)",
};

const metaStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
};

const scoreBadgeStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #374151",
  borderRadius: 999,
  padding: "8px 12px",
  color: "#f8fafc",
  fontWeight: 700,
};

const recipeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 14,
  marginTop: 16,
};

const recipeBlockStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#f8fafc",
  fontSize: 18,
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: 8,
};

const listItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  color: "#cbd5e1",
};

const bodyStyle: React.CSSProperties = {
  color: "#cbd5e1",
  marginBottom: 10,
};

const notesBoxStyle: React.CSSProperties = {
  marginTop: 14,
};

const notesRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const noteChipStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "#e2e8f0",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 13,
};

const fallbackStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  background: "rgba(217, 119, 6, 0.08)",
  border: "1px dashed rgba(245, 158, 11, 0.5)",
};

const fallbackTextStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#fde68a",
};

const generatedFormStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const generatedFieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const emptyStateStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px dashed #334155",
  padding: 28,
  textAlign: "center",
  color: "#94a3b8",
};