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
        width: "100%",
        backgroundImage: "url('/sfondo_crea.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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
          padding: 24,
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="crea-cocktail-form-rect"
        >
          <h1 style={{ color: "#f5a623", marginBottom: 28, fontWeight: 900, fontSize: 38, textAlign: "center", textShadow: "0 2px 8px #fff8" }}>
            Crea il tuo Cocktail
          </h1>

          {!isAuthenticated && (
            <div style={{ color: "#b91c1c", marginBottom: 18, fontWeight: 500 }}>
              Effettua il login per salvare le tue creazioni e vedere suggerimenti personalizzati.
            </div>
          )}
            <div className="crea-cocktail-grid">
              {Object.entries(preferenceOptions).map(([key, options]) => (
                <div key={key} className="crea-cocktail-field">
                  <label className="crea-cocktail-label">
                    {key.replace(/_/g, " ")}
                  </label>
                  <select
                    name={key}
                    value={preferences[key as keyof CocktailPreferences] || ""}
                    onChange={handleChange}
                    className="crea-cocktail-select"
                  >
                    <option value="">Scegli...</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
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

          {error && (
            <div style={{ color: "#f87171", marginBottom: 18 }}>
              {error}
            </div>
          )}

          {showResults && suggestions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ color: "#f5a623", marginBottom: 12 }}>
                Suggerimenti
              </h2>

              <div style={{ display: "grid", gap: 24 }}>
                {suggestions.map((cocktail, idx) => (
                  <div
                    key={cocktail.name + idx}
                    style={{
                      background: "#232323",
                      borderRadius: 14,
                      padding: 18,
                    }}
                  >
                    <h3 style={{ color: "#f5a623", margin: 0 }}>
                      {cocktail.name}
                    </h3>

                    <div style={{ color: "#e2e8f0", marginTop: 8 }}>
                      <b>Base:</b> {cocktail.base_spirit} |{" "}
                      <b>Bicchiere:</b> {cocktail.glass} |{" "}
                      <b>Tecnica:</b> {cocktail.technique}
                    </div>

                    <ul style={{ marginTop: 10 }}>
                      {cocktail.ingredients.map((ing, i) => (
                        <li key={i}>
                          {ing}{" "}
                          {cocktail.doses[i] && (
                            <span style={{ color: "#a3e635" }}>
                              ({cocktail.doses[i]})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div style={{ color: "#fbbf24" }}>
                      <b>Guarnizione:</b> {cocktail.garnish}
                    </div>

                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      Fonte: {cocktail.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}