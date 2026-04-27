import Navbar from "../components/Navbar";
import "../App.css";
import { useState } from "react";
import { getCocktailSuggestions, CocktailPreferences, SuggestedCocktail } from "../lib/cocktailConfigurator";
import { useUser } from "../context/UserContext";

const initialPreferences: CocktailPreferences = {
  base_alcolica: "",
  intensita_alcolica: "",
  profilo_gustativo: "",
  famiglia_aromatica: "",
  Genere: "",
  texture: "",
};

const preferenceOptions = {
  base_alcolica: ["Rum", "Gin", "Vodka", "Whisky", "Brandy", "Tequila", "Mezcal", "Altro"],
  intensita_alcolica: ["Bassa", "Media", "Alta", "Molto alta"],
  profilo_gustativo: ["Secco", "Dolce", "Acido", "Fruttato", "Amaro", "Tropicale", "Speziato", "Fresco"],
  famiglia_aromatica: ["Agrumato", "Floreale", "Speziato", "Erbaceo", "Tropicale", "Fruttato", "Affumicato"],
  Genere: ["Highball", "Shakerato", "Stirred (mescolati)", "Frozen", "Tiki", "Sour", "Pestati"],
  texture: ["Setoso", "Leggero", "Cremoso", "Denso", "Frizzante", "Pulito"],
};

export default function Crea() {
  const { isAuthenticated } = useUser();
  const [preferences, setPreferences] = useState<CocktailPreferences>(initialPreferences);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCocktail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResults(false);
    try {
      const result = await getCocktailSuggestions(preferences);
      if (result.error) {
        setError(result.error);
        setSuggestions([]);
      } else {
        setSuggestions(result.cocktails);
        setShowResults(true);
      }
    } catch (err) {
      setError("Errore durante la ricerca dei cocktail.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div
      className="crea-page page fade-in"
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "url('/src/assets/sfondo_crea.png') center center / cover no-repeat fixed, #0f0f0f",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 80px)",
          padding: 24,
        }}
      >
        <h1 style={{ color: "#f5a623", marginBottom: 18 }}>Crea il tuo Cocktail</h1>
        {!isAuthenticated && (
          <div style={{ color: "#f87171", marginBottom: 18, fontWeight: 500 }}>
            Effettua il login per salvare le tue creazioni e vedere suggerimenti personalizzati.
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#171717cc",
            border: "1px solid #3f3f46",
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
            boxShadow: "0 8px 32px #000a",
            minWidth: 320,
            maxWidth: 700,
            width: "100%",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {Object.entries(preferenceOptions).map(([key, options]) => (
              <div key={key}>
                <label style={{ color: "#f5a623", fontWeight: 600, fontSize: 14, marginBottom: 6, display: "block" }}>{key.replace(/_/g, " ")}</label>
                <select
                  name={key}
                  value={preferences[key as keyof CocktailPreferences] || ""}
                  onChange={handleChange}
                  style={{ width: "100%", background: "#0f0f10", color: "#f5f5f5", border: "1px solid #3f3f46", borderRadius: 8, padding: "10px 12px" }}
                >
                  <option value="">Scegli...</option>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 24, width: 200 }}
          >
            {loading ? "Caricamento..." : "Trova Cocktail"}
          </button>
        </form>
        {error && <div style={{ color: "#f87171", marginBottom: 18 }}>{error}</div>}
        {showResults && suggestions.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ color: "#f5a623", marginBottom: 12 }}>Suggerimenti</h2>
            <div style={{ display: "grid", gap: 24 }}>
              {suggestions.map((cocktail, idx) => (
                <div key={cocktail.name + idx} style={{ background: "#232323", borderRadius: 14, padding: 18, border: "1px solid #444" }}>
                  <h3 style={{ color: "#f5a623", margin: 0 }}>{cocktail.name}</h3>
                  <div style={{ color: "#e2e8f0", margin: "8px 0 0 0" }}>
                    <b>Base:</b> {cocktail.base_spirit} &nbsp;|&nbsp; <b>Bicchiere:</b> {cocktail.glass} &nbsp;|&nbsp; <b>Tecnica:</b> {cocktail.technique}
                  </div>
                  <div style={{ margin: "10px 0" }}>
                    <b>Ingredienti:</b>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {cocktail.ingredients.map((ing, i) => (
                        <li key={i}>{ing} {cocktail.doses[i] ? <span style={{ color: "#a3e635" }}>({cocktail.doses[i]})</span> : null}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ color: "#fbbf24", marginBottom: 6 }}><b>Guarnizione:</b> {cocktail.garnish}</div>
                  <div style={{ color: "#e2e8f0", fontSize: 14, marginBottom: 6 }}>{cocktail.description}</div>
                  <div style={{ color: "#a3e635", fontSize: 13, marginBottom: 6 }}><b>Note degustazione:</b> {cocktail.tasting_notes.join(", ")}</div>
                  <div style={{ color: "#38bdf8", fontSize: 13 }}>{cocktail.balance_explanation}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>Fonte: {cocktail.source === "database" ? "Database" : "Generato"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}