import "../App.css";
import { useState } from "react";
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
  const [cocktailForm, setCocktailForm] = useState({
    nome: "",
    descrizione: "",
    preparazione: "",
    ingredienti: "",
    storia: "",
    consigli: "",
    guarnizione: "",
    intensita_alcolica: "",
    profilo_gustativo: "",
    famiglia_aromatica: "",
    base_alcolica: "",
    Genere: "",
  });
  const [preferences, setPreferences] = useState<CocktailPreferences>({});
  const [suggestions, setSuggestions] = useState<SuggestedCocktail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openGeneratedForms, setOpenGeneratedForms] = useState<Record<string, boolean>>({});
  const [savingNames, setSavingNames] = useState<Record<string, boolean>>({});
  const [savedNames, setSavedNames] = useState<Record<string, boolean>>({});
  const [customGeneratedNames, setCustomGeneratedNames] = useState<Record<string, string>>({});

  function updatePreference(key: keyof CocktailPreferences, value: string) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  function serializePreferenceValue(value: string | undefined | null) {
    return value || null;
  }

  function getActivePreferenceCount() {
    return Object.values(preferences).filter((value) => String(value || "").trim().length > 0).length;
  }

  async function handleSearch() {
    const activePreferences = getActivePreferenceCount();

    if (activePreferences < 2) {
      setSuggestions([]);
      setError("Seleziona almeno 2 preferenze");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getCocktailSuggestions(preferences);

    if (result.error) {
      setSuggestions([]);
      setError(result.error);
      setLoading(false);
      return;
    }

    const generated = result.cocktails.filter((c) => c.source === "generated");
    const database = result.cocktails.filter((c) => c.source === "database").slice(0, 3);
    setSuggestions([...generated, ...database]);
    setLoading(false);
  }

  function openExistingCocktail(cocktail: SuggestedCocktail) {
    if (cocktail.source !== "database") return;
    const cocktailId = cocktail.originalRecord?.id;
    if (!cocktailId) return;
    navigate(`/drink/${cocktailId}`);
  }

  function buildDatabasePreferenceComparison(filters: any, cocktail: any) {
    const schema = [
      { label: "Base", filter: filters.p_base, db: cocktail?.base_alcolica },
      { label: "Profilo", filter: filters.p_profilo, db: cocktail?.profilo_gustativo },
      { label: "Intensita", filter: filters.p_intensita, db: cocktail?.intensita_alcolica },
      { label: "Famiglia", filter: filters.p_famiglia, db: cocktail?.famiglia_aromatica },
      { label: "Genere", filter: filters.p_metodo, db: cocktail?.Genere },
      { label: "Texture", filter: filters.p_texture, db: cocktail?.texture },
    ];

    const normalize = (value: string | null | undefined) => String(value || "").trim().toLowerCase();
    const active = schema.filter((item) => normalize(item.filter).length > 0);

    if (!cocktail || active.length === 0) {
      return {
        description: "Dettagli comparativi non disponibili per questo cocktail del database.",
        tastingNotes: ["Confronto non disponibile"],
        balance: "Nessun confronto applicato rispetto alle preferenze selezionate.",
      };
    }

    const matched = active.filter((item) => normalize(item.filter) === normalize(item.db));
    const different = active.filter((item) => normalize(item.filter) !== normalize(item.db));

    const affinitaText = matched.length
      ? matched.map((item) => `${item.label}: ${item.db}`).join(" · ")
      : "Nessuna affinità diretta";

    const differenzeText = different.length
      ? different.map((item) => `${item.label} scelto ${item.filter} / cocktail ${item.db || "non definito"}`).join(" · ")
      : "Nessuna differenza rilevante";

    return {
      description: `Affinita con le tue scelte: ${affinitaText}. Differenze principali: ${differenzeText}.`,
      tastingNotes: [
        `Affinita ${matched.length}/${active.length}`,
        `Differenze ${different.length}/${active.length}`,
      ],
      balance: matched.length >= different.length
        ? "Coerenza alta con il tuo profilo: cocktail vicino alle preferenze impostate."
        : "Coerenza parziale: cocktail interessante per esplorare varianti rispetto alle preferenze impostate.",
    };
  }

  function generateSignatureCocktails(filters: any): SuggestedCocktail[] {
    const base = filters.p_base || "Mix";
    const famiglia = filters.p_famiglia || "Neutro";
    const profilo = filters.p_profilo || "equilibrato";
    const intensita = filters.p_intensita || "Media";
    const metodo = filters.p_metodo || "Sour";
    const texture = filters.p_texture || "Liscio";

    const spiritMap: Record<string, { modifier: string; sour: string; sweet: string }> = {
      "Rum":                          { modifier: "Falernum",                 sour: "Succo di lime",      sweet: "Sciroppo di canna" },
      "Gin":                          { modifier: "Aperol",                   sour: "Succo di limone",    sweet: "Sciroppo di sambuco" },
      "Vodka":                        { modifier: "Liquore al litchi",        sour: "Succo di lime",      sweet: "Sciroppo di rose" },
      "Whisky":                       { modifier: "Benedictine",              sour: "Succo di limone",    sweet: "Miele di acacia" },
      "Tequila":                      { modifier: "Triple Sec",               sour: "Succo di lime",      sweet: "Sciroppo di agave" },
      "Mezcal":                       { modifier: "Aperitivo bitter",         sour: "Succo di lime",      sweet: "Sciroppo di agave" },
      "Brandy":                       { modifier: "Grand Marnier",            sour: "Succo di limone",    sweet: "Sciroppo di zucchero" },
      "Cognac":                       { modifier: "Grand Marnier",            sour: "Succo di limone",    sweet: "Sciroppo di zucchero" },
      "Aperitivo bitter":            { modifier: "Vermouth rosso",     sour: "Succo di pompelmo",  sweet: "Sciroppo di cardamomo" },
      "Vermouth":                     { modifier: "Bitter aromatico",         sour: "Succo di limone",    sweet: "Sciroppo semplice" },
      "Vermouth rosso":              { modifier: "Bitter aromatico",         sour: "Succo di arancia",   sweet: "Sciroppo semplice" },
      "Sherry":                       { modifier: "Amaro gentile",            sour: "Succo di limone",    sweet: "Sciroppo di miele" },
      "Liquore":                      { modifier: "Crème de cacao white",     sour: "Succo di lime",      sweet: "Sciroppo alla vaniglia" },
      "Triple Sec/Cointreau":         { modifier: "Tequila blanco",           sour: "Succo di lime",      sweet: "Sciroppo d'agave" },
      "Amaro":                        { modifier: "Vermouth dry",             sour: "Succo di limone",    sweet: "Sciroppo di canna" },
      "Spumante/Champagne":           { modifier: "Liqueur d'expedition",     sour: "Succo di limone",    sweet: "Sciroppo semplice" },
      "Vino":                         { modifier: "Liquore all'arancia",       sour: "Succo di limone",    sweet: "Miele chiaro" },
      "Birra":                        { modifier: "Amaro gentile",            sour: "Succo di limone",    sweet: "Sciroppo di malto" },
      "Analcolico":                   { modifier: "Ginger beer artigianale",  sour: "Succo di lime",      sweet: "Sciroppo di zenzero" },
      "Bitter":                       { modifier: "Vermouth rosso",           sour: "Succo di pompelmo",  sweet: "Sciroppo di cardamomo" },
      "Mix":                          { modifier: "Vermouth dry",             sour: "Succo di limone",    sweet: "Sciroppo semplice" },
    };

    const familyMap: Record<string, string> = {
      "Agrumato":  "Cordial al bergamotto",
      "Fruttato":  "Purea di frutto della passione",
      "Speziato":  "Tintura di pepe lungo",
      "Erbaceo":   "Infusione di timo fresco",
      "Floreale":  "Acqua di fiori d'arancio",
      "Tostato":   "Cold brew concentrate",
      "Neutro":    "Bitter aromatico",
    };

    const garnishMap: Record<string, string> = {
      "Agrumato": "Twist di limone",
      "Fruttato": "Fetta di frutto della passione",
      "Speziato": "Pepe di Sichuan macinato al momento",
      "Erbaceo":  "Rametto di timo fresco",
      "Floreale": "Fiore edule",
      "Tostato":  "Cacao amaro grattugiato",
      "Neutro":   "Scorza d'arancia",
    };

    const sp = spiritMap[base] || spiritMap["Mix"];
    const familyIng = familyMap[famiglia] || "Bitter aromatico";
    const garnish1 = garnishMap[famiglia] || "Scorza d'arancia";

    const technique1 = intensita === "Molto alta" || metodo === "Stirred (mescolati)"
      ? "Stir & strain"
      : metodo === "Shakerato"
        ? "Shake & strain"
      : "Shake & double strain";
    const glass1 = metodo === "Highball" ? "Highball" :
      metodo === "Stirred (mescolati)" ? "Nick & Nora" :
      metodo === "Frozen" ? "Frozen cup" :
      metodo === "Shakerato" ? "Coppetta" :
      metodo === "Pestati" ? "Tumbler" : "Coppetta";

    const isSoftTexture = ["Cremoso", "Vellutato", "Cremosa", "Vellutata"].includes(texture);

    const technique2 = isSoftTexture ? "Dry shake + wet shake" :
      metodo === "Shakerato" ? "Shake & strain" :
      texture === "Frizzante" ? "Build in glass" : "Stir & fat-wash";
    const glass2 = metodo === "Pestati" ? "Old Fashioned" :
      metodo === "Highball" ? "Collins" : "Calice da vino";
    const ingExtra2 = isSoftTexture ? "Albume d'uovo" :
      texture === "Frizzante" ? "Soda seltz" : "Olio di oliva extra vergine infuso";
    const garnish2 = famiglia === "Tostato" ? "Cacao amaro e scorza d'arancia" :
      famiglia === "Erbaceo" ? "Rosmarino bruciato" : "Fiocco di sale marino";

    const sig1: SuggestedCocktail = {
      name: "Zio Signature 1",
      source: "generated" as const,
      matchScore: 0,
      base_spirit: base,
      technique: technique1,
      glass: glass1,
      ingredients: [base, sp.sour, sp.sweet, familyIng],
      doses: ["50ml", "25ml", "15ml", "5ml"],
      garnish: garnish1,
      description: `Signature classica costruita su ${base} come asse portante. La componente acida di ${sp.sour} bilancia la dolcezza di ${sp.sweet}, mentre ${familyIng} aggiunge complessità aromatica ${famiglia.toLowerCase()}. Profilo ${profilo.toLowerCase()}, intensità ${intensita.toLowerCase()}, texture ${texture.toLowerCase()}.`,
      tasting_notes: [profilo, famiglia, `${intensita} intensity`],
      balance_explanation: `Struttura sour: ${base} / ${sp.sour} / ${sp.sweet} in rapporto 2:1:0.6. ${familyIng} opera da accent modifier senza coprire la base.`,
    };

    const sig2: SuggestedCocktail = {
      name: "Zio Signature 2",
      source: "generated" as const,
      matchScore: 0,
      base_spirit: base,
      technique: technique2,
      glass: glass2,
      ingredients: [base, sp.modifier, familyIng, ingExtra2],
      doses: ["45ml", "20ml", "10ml", "5ml"],
      garnish: garnish2,
      description: `Reinterpretazione moderna con ${base} in chiave ${metodo === "Stirred (mescolati)" ? "spirit-forward" : "texturale"}. ${sp.modifier} apporta complessità e lunghezza palatale. ${familyIng} definisce il carattere aromatico ${famiglia.toLowerCase()}. La tecnica ${technique2.toLowerCase()} lavora la texture verso un risultato ${texture.toLowerCase()}.`,
      tasting_notes: [sp.modifier.split(" ")[0], famiglia, `${texture} finish`],
      balance_explanation: `Architettura spirit-forward: la dolcezza di ${sp.modifier} contrasta con la complessità aromatica di ${familyIng}. Finish ${texture.toLowerCase()} persistente.`,
    };

    return [sig1, sig2];
  }

  function toggleGeneratedForm(name: string) {
    setOpenGeneratedForms((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function getGeneratedCocktailName(suggestedCocktail: SuggestedCocktail) {
    const rawValue = customGeneratedNames[suggestedCocktail.name];
    const trimmed = String(rawValue || "").trim();
    return trimmed || suggestedCocktail.name;
  }

  async function saveGeneratedCocktail(suggestedCocktail: SuggestedCocktail) {
    setSavingNames((prev) => ({ ...prev, [suggestedCocktail.name]: true }));

    const nowIso = new Date().toISOString();
    const generatedPreparation = `${suggestedCocktail.technique}. ${suggestedCocktail.doses.map((dose, index) => `${dose} ${suggestedCocktail.ingredients[index] || ""}`.trim()).join(", ")}`;

    const finalName = getGeneratedCocktailName(suggestedCocktail);
    const finalIngredients = cocktailForm.ingredienti.trim() || suggestedCocktail.ingredients.join("; ");
    const finalDescription = cocktailForm.descrizione.trim() || suggestedCocktail.description;
    const finalPreparation = cocktailForm.preparazione.trim() || generatedPreparation;
    const finalGarnish = cocktailForm.guarnizione.trim() || suggestedCocktail.garnish;

    const italianPayloads = [
      {
        nome: finalName,
        ingredienti: finalIngredients,
        descrizione: finalDescription,
        preparazione: finalPreparation,
        storia: cocktailForm.storia || null,
        consigli: cocktailForm.consigli || null,
        bicchiere: suggestedCocktail.glass,
        guarnizione: finalGarnish,
        categoria: "cocktail",
        base_alcolica: cocktailForm.base_alcolica || preferences.base_alcolica || suggestedCocktail.base_spirit,
        intensita_alcolica: serializePreferenceValue(cocktailForm.intensita_alcolica || preferences.intensita_alcolica),
        profilo_gustativo: serializePreferenceValue(cocktailForm.profilo_gustativo || preferences.profilo_gustativo),
        famiglia_aromatica: serializePreferenceValue(cocktailForm.famiglia_aromatica || preferences.famiglia_aromatica),
        Genere: cocktailForm.Genere || preferences.Genere || null,
        texture: preferences.texture || null,
        created_at: nowIso,
      },
      {
        nome: finalName,
        ingredienti: finalIngredients,
        descrizione: finalDescription,
        preparazione: finalPreparation,
        bicchiere: suggestedCocktail.glass,
        guarnizione: finalGarnish,
        categoria: "cocktail",
      },
    ];

    const attempts: Array<{ table: string; payloads: Record<string, any>[] }> = [
      { table: "cocktail_utenti", payloads: italianPayloads },
    ];

    let lastMessage = "Impossibile salvare il cocktail generato.";

    for (const attempt of attempts) {
      for (const payload of attempt.payloads) {
        const { error: insertError } = await supabase
          .from(attempt.table)
          .insert([payload])
          .select("id");

        if (!insertError) {
          setSavedNames((prev) => ({ ...prev, [suggestedCocktail.name]: true }));
          setSavingNames((prev) => ({ ...prev, [suggestedCocktail.name]: false }));
          alert("Cocktail salvato in cocktail_utenti ✅");

          return;
        }

        lastMessage = insertError.message || lastMessage;
      }
    }

    setSavingNames((prev) => ({ ...prev, [suggestedCocktail.name]: false }));
    alert(lastMessage);
  }

  function updateCocktailField(key: keyof typeof cocktailForm, value: string) {
    setCocktailForm((prev) => ({ ...prev, [key]: value }));
  }

  const createdBy = user?.email || user?.id || "utente Lo Zio";
  const createdDate = new Date().toLocaleDateString("it-IT");

  return (
    <div className="page fade-in crea-page" style={{ maxWidth: 1180 }} data-page-version="crea-configurator-v2">
      <div className="crea-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="crea-title" style={titleStyle}>Crea</h1>

        </div>
      </div>

      <div className="crea-panel" style={panelStyle}>
        <div className="crea-grid" style={gridStyle}>
          {preferenceFields.map((field) => (
            <div key={field.key} className="crea-field" style={fieldStyle}>
              <label className="crea-label" style={labelStyle}>{field.label}</label>
              <select
                value={typeof preferences[field.key] === "string" ? preferences[field.key] as string : ""}
                onChange={(event) => updatePreference(field.key, event.target.value)}
                className="crea-select"
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

        {error && <div className="crea-error" style={errorBoxStyle}>{error}</div>}

        <div className="crea-actions" style={actionsStyle}>
          <button
            className="btn-primary"
            type="button"
            onClick={() => void handleSearch()}
          >
            Trova cocktail
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
      </div>

      <div className="crea-results" style={resultsStyle}>
        {suggestions.map((cocktail) => (
          <article
            key={cocktail.name}
            className="crea-card"
            style={{
              ...cardStyle,
              cursor: cocktail.source === "database" ? "pointer" : cardStyle.cursor,
            }}
            onClick={() => openExistingCocktail(cocktail)}
          >
            <div className="crea-card-header" style={cardHeaderStyle}>
              <div>
                <p className="crea-source" style={sourceTagStyle}>{cocktail.source === "database" ? "GIÀ ESISTENTE" : "GENERATO"}</p>
                <h2 className="crea-card-title" style={cardTitleStyle}>{cocktail.name}</h2>
                <p className="crea-meta" style={metaStyle}>
                  Base: {cocktail.base_spirit} · Tecnica: {cocktail.technique} · Bicchiere: {cocktail.glass}
                </p>
              </div>
              <div className="crea-score" style={scoreBadgeStyle}>Score {cocktail.matchScore}</div>
            </div>

            <div className="crea-recipe-grid" style={recipeGridStyle}>
              <section className="crea-recipe-block" style={recipeBlockStyle}>
                <h3 className="crea-section-title" style={sectionTitleStyle}>Ingredienti e dosi</h3>
                <ul className="crea-list" style={listStyle}>
                  {cocktail.ingredients.map((ingredient, index) => (
                    <li key={`${cocktail.name}-${ingredient}-${index}`} className="crea-list-item" style={listItemStyle}>
                      <span>{ingredient}</span>
                      <strong>{cocktail.doses[index] ?? ""}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="crea-recipe-block" style={recipeBlockStyle}>
                <h3 className="crea-section-title" style={sectionTitleStyle}>Profilo</h3>
                <p className="crea-body crea-description" style={bodyStyle}>{cocktail.description}</p>
                <p className="crea-body" style={bodyStyle}><strong>Guarnizione:</strong> {cocktail.garnish}</p>
                <p className="crea-body" style={bodyStyle}><strong>Bilanciamento:</strong> {cocktail.balance_explanation}</p>
              </section>
            </div>

            <section className="crea-notes" style={notesBoxStyle}>
              <h3 className="crea-section-title" style={sectionTitleStyle}>Tasting notes</h3>
              <div className="crea-notes-row" style={notesRowStyle}>
                {cocktail.tasting_notes.map((note) => (
                  <span key={`${cocktail.name}-${note}`} className="crea-note-chip" style={noteChipStyle}>{note}</span>
                ))}
              </div>
            </section>

            {cocktail.source === "generated" && (
              <section className="crea-fallback" style={fallbackStyle}>
                <p className="crea-fallback-text" style={fallbackTextStyle}>Scegli il nome per questo Cocktail</p>
                <div className="crea-generated-field" style={{ ...generatedFieldStyle, marginTop: 10, maxWidth: 420 }}>
                  <input
                    value={customGeneratedNames[cocktail.name] ?? cocktail.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      setCustomGeneratedNames((prev) => ({ ...prev, [cocktail.name]: value }));
                    }}
                    placeholder="Inserisci nome cocktail"
                    style={inputStyle}
                  />
                </div>
                <button className="btn-primary" type="button" onClick={() => toggleGeneratedForm(cocktail.name)}>
                  CREA NUOVO COCKTAIL
                </button>

                {openGeneratedForms[cocktail.name] && (
                  <div className="crea-generated-form" style={generatedFormStyle}>
                    <div className="crea-generated-field" style={generatedFieldStyle}>
                      <label className="crea-label" style={labelStyle}>Nome</label>
                      <input
                        value={customGeneratedNames[cocktail.name] ?? cocktail.name}
                        onChange={(event) => {
                          const value = event.target.value;
                          setCustomGeneratedNames((prev) => ({ ...prev, [cocktail.name]: value }));
                        }}
                        style={inputStyle}
                      />
                    </div>
                    <div className="crea-generated-field" style={generatedFieldStyle}>
                      <label className="crea-label" style={labelStyle}>Ingredienti</label>
                      <textarea value={cocktail.ingredients.join(", ")} readOnly style={textareaStyle} />
                    </div>
                    <div className="crea-generated-field" style={generatedFieldStyle}>
                      <label className="crea-label" style={labelStyle}>Dosi</label>
                      <textarea value={cocktail.doses.join(", ")} readOnly style={textareaStyle} />
                    </div>
                    <div className="crea-generated-field" style={generatedFieldStyle}>
                      <label className="crea-label" style={labelStyle}>Creato da</label>
                      <input value={createdBy} readOnly style={inputStyle} />
                    </div>
                    <div className="crea-generated-field" style={generatedFieldStyle}>
                      <label className="crea-label" style={labelStyle}>Data</label>
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
                            : "Salva in cocktail_utenti"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </article>
        ))}


      </div>
    </div>
  );
}

const preferenceFields: Array<{
  key: keyof CocktailPreferences;
  label: string;
  options: string[];
}> = [
  { key: "base_alcolica", label: "Base alcolica", options: ["Rum", "Gin", "Vodka", "Whisky", "Tequila", "Mezcal", "Brandy", "Cognac", "Aperitivo bitter", "Bitter", "Vermouth", "Vermouth rosso", "Sherry", "Liquore", "Triple Sec/Cointreau", "Amaro", "Spumante/Champagne", "Vino", "Birra", "Analcolico", "Mix"] },
  { key: "intensita_alcolica", label: "Intensita alcolica", options: ["Bassa", "Media", "Alta", "Molto alta"] },
  { key: "profilo_gustativo", label: "Profilo gustativo", options: ["Dolce", "Secco", "Amaro", "Agrodolce", "Acido", "Aspro", "Fresco"] },
  { key: "famiglia_aromatica", label: "Famiglia aromatica", options: ["Agrumato", "Fruttato", "Speziato", "Erbaceo", "Floreale", "Tostato", "Piccante", "Neutro"] },
  { key: "Genere", label: "Genere", options: ["Sour", "Highball", "Stirred (mescolati)", "Pestati", "Frozen", "Shakerato", "Agitato", "Tiki", "Build (Costruito in bicchiere)", "A strati (Layered)"] },
];

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

const panelStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid rgba(255, 255, 255, 0.75)",
  borderRadius: 20,
  padding: 20,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 14,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  position: "relative",
};

const labelStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: 13,
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  height: 50,
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