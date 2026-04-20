import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import {
  TASTE_PROFILE_OPTIONS,
  AROMATIC_FAMILY_OPTIONS,
} from "../lib/cocktailOptionSets";

// Opzioni per i menu a tendina (coerenti con la creazione cocktail)
const GENERE_OPTIONS = ["Maschio", "Femmina", "Altro"];
const RUOLO_OPTIONS = ["utente", "bartender", "proprietario", "admin"];
const INTENSITA_OPTIONS = ["Leggera", "Media", "Forte", "Molto forte"];
const PROFILO_GUSTATIVO_OPTIONS = Array.from(TASTE_PROFILE_OPTIONS);
const FAMIGLIA_AROMATICA_OPTIONS = Array.from(AROMATIC_FAMILY_OPTIONS);
const METODO_CONSUMO_OPTIONS = ["Liscio", "On the rocks", "Cocktail", "Shot", "Altro"];

export default function UserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadUser();
    // eslint-disable-next-line
  }, [id]);

  async function loadUser() {
    setLoading(true);
    const { data, error } = await supabase
      .from("Profili")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      setError("Errore nel caricamento del profilo: " + error.message);
      setLoading(false);
      return;
    }
    setUser(data);
    setForm(data);
    setLoading(false);
  }

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    // Rimuovi chiavi non colonne
    const toSave = { ...form };
    delete toSave.id;
    delete toSave.created_at;
    const { error } = await supabase
      .from("Profili")
      .update(toSave)
      .eq("id", id);
    if (error) {
      setError("Errore nel salvataggio: " + error.message);
    } else {
      setSuccess("Profilo aggiornato con successo!");
      loadUser();
    }
    setSaving(false);
  }

  if (loading) return <div className="page fade-in">Caricamento...</div>;

  // Lista di tutti i campi da mostrare (aggiornata con i campi SQL)
  const fields = [
    { name: "nome", label: "Nome" },
    { name: "cognome", label: "Cognome" },
    { name: "username", label: "Username" },
    { name: "email", label: "Email" },
    { name: "telefono", label: "Telefono" },
    { name: "paese", label: "Paese" },
    { name: "genere", label: "Genere", type: "select", options: GENERE_OPTIONS },
    { name: "ruolo", label: "Ruolo", type: "select", options: RUOLO_OPTIONS },
    { name: "bio_breve", label: "Bio breve", type: "textarea" },
    { name: "distillato_preferito", label: "Distillato preferito" },
    { name: "cocktail_preferito", label: "Cocktail preferito" },
    { name: "intensita_preferita", label: "Intensità preferita", type: "select", options: INTENSITA_OPTIONS },
    { name: "profilo_gustativo_preferito", label: "Profilo gustativo preferito", type: "select", options: PROFILO_GUSTATIVO_OPTIONS },
    { name: "famiglia_aromatica_preferita", label: "Famiglia aromatica preferita", type: "select", options: FAMIGLIA_AROMATICA_OPTIONS },
    { name: "metodo_consumo_preferito", label: "Metodo consumo preferito", type: "select", options: METODO_CONSUMO_OPTIONS },
    { name: "numero_recensioni", label: "Numero recensioni", type: "number" },
    { name: "numero_locali_visitati", label: "N. locali visitati", type: "number" },
    { name: "numero_cocktail_creati", label: "N. cocktail creati", type: "number" },
    { name: "instagram", label: "Instagram" },
    { name: "tiktok", label: "TikTok" },
    { name: "sito_web", label: "Sito web" },
    { name: "esperienza_anni", label: "Esperienza (anni)", type: "number" },
    { name: "certificazioni", label: "Certificazioni" },
    { name: "menu_caricato", label: "Menu caricato" },
    { name: "indirizzo_locale", label: "Indirizzo locale" },
    { name: "citta_locale", label: "Città locale" },
    { name: "partita_iva", label: "Partita IVA" },
    { name: "numero_dipendenti", label: "N. dipendenti", type: "number" },
    { name: "descrizione_locale", label: "Descrizione locale", type: "textarea" },
  ];

  return (
    <div className="page fade-in user-profile-mobile-wrapper">
      <div className="user-profile-mobile-card">
        <h2 className="user-profile-mobile-title">Profilo Utente</h2>
        {error && <div className="user-profile-mobile-error">{error}</div>}
        {success && <div className="user-profile-mobile-success">{success}</div>}
        <form onSubmit={handleSave}>
          <div className="user-profile-mobile-fields">
            {fields.map((field) => (
              <div key={field.name} className="user-profile-mobile-field">
                <label className="user-profile-mobile-label">
                  {field.label}
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      className="user-profile-mobile-input"
                    >
                      <option value="">Seleziona...</option>
                      {field.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      className="user-profile-mobile-input user-profile-mobile-textarea"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      className="user-profile-mobile-input"
                    />
                  )}
                </label>
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="user-profile-mobile-save-btn"
          >
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </form>
      </div>
    </div>
  );
}
import "../user-profile-mobile.css";