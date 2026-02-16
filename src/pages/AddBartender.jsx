import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "@/lib/AppDataContext";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft,
  User,
  Award,
  Wine,
  Send,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { uploadMultipleToSupabaseStorage, urlsToDbString } from "@/lib/supabaseStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VenueCombobox from "@/components/venue/VenueCombobox";

const SPECIALIZZAZIONI = [
  "Rum",
  "Cocktail classici",
  "Tiki",
  "Whisky",
  "Gin",
  "Amari",
  "Low/No ABV",
  "Altro",
];

export default function AddBartender() {
  const { addBartender, getVenues } = useAppData();
  const venues = getVenues();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    photo: "",
    venue_id: "",
    venue_name: "",
    city: "",
    specialization: "",
    years_experience: "",
    philosophy: "",
    distillati_preferiti: "",
    approccio_degustazione: "",
    consiglio_inizio: "",
    signature_drinks: "",
    percorso_esperienze: "",
    bio: "",
    motivation: "",
    consent_linee_editoriali: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const handleCapture = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPhotoFiles((prev) => [...prev, ...files]);
      if (files.length) updateField("photo", "");
    }
    e.target.value = "";
  };

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const initialFormData = {
    name: "",
    surname: "",
    photo: "",
    venue_id: "",
    venue_name: "",
    city: "",
    specialization: "",
    years_experience: "",
    philosophy: "",
    distillati_preferiti: "",
    approccio_degustazione: "",
    consiglio_inizio: "",
    signature_drinks: "",
    percorso_esperienze: "",
    bio: "",
    motivation: "",
    consent_linee_editoriali: false,
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Inserisci il nome.";
    if (!formData.surname.trim()) newErrors.surname = "Inserisci il cognome.";
    if (!formData.venue_id && !formData.venue_name?.trim()) newErrors.venue_id = "Seleziona o scrivi il locale attuale.";
    if (!formData.specialization) newErrors.specialization = "Indica una specializzazione.";
    if (!formData.bio.trim()) newErrors.bio = "Scrivi una breve bio.";
    if (!formData.motivation.trim()) newErrors.motivation = "Scrivi la motivazione a partecipare.";
    if (!formData.consent_linee_editoriali) newErrors.consent_linee_editoriali = "È necessario accettare le linee editoriali.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image_url || formData.photo || "";
      let videoUrl = formData.video_url || null;
      if (photoFiles.length > 0) {
        const imageFiles = photoFiles.filter((f) => (f.type || "").startsWith("image/"));
        const videoFiles = photoFiles.filter((f) => (f.type || "").startsWith("video/"));
        if (imageFiles.length > 0) {
          const urls = await uploadMultipleToSupabaseStorage(
            imageFiles,
            "bartenders",
            (current, total) => setUploadProgress({ current, total })
          );
          imageUrl = urlsToDbString(urls);
        }
        if (videoFiles.length > 0) {
          const urls = await uploadMultipleToSupabaseStorage(
            videoFiles,
            "bartenders",
            (current, total) => setUploadProgress({ current, total })
          );
          videoUrl = urls[0] || urlsToDbString(urls) || null;
        }
      }
      setUploadProgress({ current: 0, total: 0 });
      const selectedVenue = formData.venue_id ? venues.find((v) => v.id === formData.venue_id) : null;
      const isValidUuid = (s) => s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
      const venueIdForDb = formData.venue_id && selectedVenue
        ? (selectedVenue.supabase_id || (isValidUuid(formData.venue_id) ? formData.venue_id : null))
        : null;
      const payload = {
        ...formData,
        full_name: [formData.name, formData.surname].filter(Boolean).join(" ").trim(),
        image_url: imageUrl,
        video_url: videoUrl,
        status: "pending",
        bio: formData.bio || "",
        home_city: formData.city || selectedVenue?.city || "",
        venue_id: venueIdForDb,
        venue_name: formData.venue_name?.trim() || "",
      };
      await addBartender(payload);
      setStatus("success");
      setFormData(initialFormData);
      setPhotoFiles([]);
      setErrors({});
      setUploadProgress({ current: 0, total: 0 });
    } catch (err) {
      console.error("[AddBartender] Errore salvataggio:", err);
      if (err?.originalError) console.error("[AddBartender] Dettaglio Supabase (RLS/rete):", err.originalError);
      setStatus("error");
      setErrors((prev) => ({ ...prev, _form: err?.message || "Errore durante il salvataggio" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 pt-8 pb-28 lg:pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={createPageUrl("Dashboard")}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-100 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Torna alla Dashboard
          </Link>
        </div>

        {/* Hero + Intro */}
        <div className="mb-8">
          <div className="relative h-40 md:h-52 rounded-3xl overflow-hidden mb-6">
            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200"
              alt="Dietro al bancone"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-stone-950/80" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-medium text-amber-200 mb-3 w-max">
                <Wine className="w-3 h-3" />
                Voce editoriale: Bartender
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Nuova scheda bartender
              </h1>
              <p className="text-sm md:text-base text-stone-300 mt-1 max-w-2xl">
                Una scheda per raccontare chi sta dietro al bancone: percorso,
                filosofia di lavoro e modo di bere.
              </p>
            </div>
          </div>
        </div>

        {/* Banner status - auto-close 5s */}
        {status === "success" && (
          <div className="mb-6 p-6 rounded-xl bg-green-600 border-2 border-green-400 text-white text-center font-bold text-xl">
            INVIO COMPLETATO
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 p-6 rounded-xl bg-red-600 border-2 border-red-400 text-white text-center font-bold text-xl">
            {errors._form || "Errore durante l'invio. Riprova."}
          </div>
        )}

        <div className="grid lg:grid-cols-[2fr,1fr] gap-6 items-start">
          {/* Form principale */}
          <form
            onSubmit={handleSubmit}
            className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 md:p-8 space-y-8"
          >
            {errors._form && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errors._form}
              </div>
            )}
            {/* Header profilo */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">
                    Profilo del bartender
                  </h2>
                  <p className="text-xs md:text-sm text-stone-400">
                    Informazioni di base per identificare la persona e il locale.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Nome"
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Cognome</Label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => updateField("surname", e.target.value)}
                    placeholder="Cognome"
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                  {errors.surname && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.surname}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-stone-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    Foto e video
                  </Label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    id="camera-input"
                    onChange={handleCapture}
                    className="w-full mt-1"
                  />
                  <p className="text-xs text-stone-500 mt-1">Fotocamera, video o galleria • max 5MB foto, 10MB video</p>
                  {uploadProgress.total > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
                      </div>
                      <p className="text-xs text-stone-500">Caricamento {uploadProgress.current}/{uploadProgress.total}</p>
                    </div>
                  )}
                  {photoFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <p className="text-xs text-stone-500 w-full">Anteprima – clicca X per rimuovere</p>
                      {photoFiles.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="relative group">
                          {f.type.startsWith("video/") ? (
                            <video src={URL.createObjectURL(f)} className="h-20 w-20 object-cover rounded-xl" muted playsInline />
                          ) : (
                            <img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 object-cover rounded-xl" />
                          )}
                          <button
                            type="button"
                            onClick={() => setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700"
                            aria-label="Rimuovi"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">
                    Locale dove lavora
                  </Label>
                  <VenueCombobox
                    venues={venues}
                    value={{
                      venue_id: formData.venue_id,
                      venue_name: formData.venue_name,
                    }}
                    onChange={({ venue_id, venue_name }) => {
                      updateField("venue_id", venue_id);
                      updateField("venue_name", venue_name);
                      if (errors.venue_id) setErrors((prev) => ({ ...prev, venue_id: undefined }));
                    }}
                    placeholder="Cerca o scrivi un locale..."
                    className="mt-1"
                    error={!!errors.venue_id}
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Scegli dalla lista o scrivi il nome di un nuovo locale
                  </p>
                  {errors.venue_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.venue_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">Città</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Città"
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Specializzazione</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) => updateField("specialization", value)}
                  >
                    <SelectTrigger className="mt-1 bg-stone-900 border-stone-700">
                      <SelectValue placeholder="Scegli una specializzazione" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-800">
                      {SPECIALIZZAZIONI.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialization && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.specialization}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">
                    Anni di esperienza
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) =>
                      updateField("years_experience", e.target.value)
                    }
                    placeholder="Es. 5"
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                </div>
              </div>
            </section>

            {/* Filosofia di lavoro */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Filosofia di lavoro</h2>
                  <p className="text-xs text-stone-400">
                    3–4 righe per capire come lavora e cosa mette al centro.
                  </p>
                </div>
              </div>
              <Textarea
                value={formData.philosophy}
                onChange={(e) => updateField("philosophy", e.target.value)}
                placeholder="Racconta in poche righe la tua filosofia dietro al bancone..."
                className="min-h-[80px] bg-stone-900 border-stone-700"
              />
            </section>

            {/* Come beve */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Come beve</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">
                    Distillati preferiti
                  </Label>
                  <Textarea
                    value={formData.distillati_preferiti}
                    onChange={(e) =>
                      updateField("distillati_preferiti", e.target.value)
                    }
                    placeholder="Rum agricoli, mezcal, rye whisky..."
                    className="mt-1 min-h-[70px] bg-stone-900 border-stone-700 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm text-stone-300">
                    Approccio alla degustazione
                  </Label>
                  <Textarea
                    value={formData.approccio_degustazione}
                    onChange={(e) =>
                      updateField("approccio_degustazione", e.target.value)
                    }
                    placeholder="Come affronti una degustazione, cosa osservi per primo..."
                    className="mt-1 min-h-[70px] bg-stone-900 border-stone-700 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm text-stone-300">
                    Consiglio per chi inizia
                  </Label>
                  <Textarea
                    value={formData.consiglio_inizio}
                    onChange={(e) =>
                      updateField("consiglio_inizio", e.target.value)
                    }
                    placeholder="Un consiglio sincero per chi vuole avvicinarsi al bere consapevole..."
                    className="mt-1 min-h-[70px] bg-stone-900 border-stone-700 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Signature / selezioni */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Signature / Selezioni</h2>
              <Textarea
                value={formData.signature_drinks}
                onChange={(e) =>
                  updateField("signature_drinks", e.target.value)
                }
                placeholder="1–3 signature drink oppure 3 bottiglie che rappresentano il tuo stile..."
                className="min-h-[80px] bg-stone-900 border-stone-700"
              />
            </section>

            {/* Percorso */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Percorso</h2>
              <Textarea
                value={formData.percorso_esperienze}
                onChange={(e) =>
                  updateField("percorso_esperienze", e.target.value)
                }
                placeholder="Esperienze precedenti, città, locali, cambi di rotta..."
                className="min-h-[80px] bg-stone-900 border-stone-700"
              />
            </section>

            {/* Motivazione e consenso */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                Bio, motivazione e linee editoriali
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">Breve bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Raccontati in poche righe..."
                    className="mt-1 min-h-[80px] bg-stone-900 border-stone-700"
                  />
                  {errors.bio && (
                    <p className="text-xs text-red-500 mt-1">{errors.bio}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">
                    Motivazione a partecipare
                  </Label>
                  <Textarea
                    value={formData.motivation}
                    onChange={(e) =>
                      updateField("motivation", e.target.value)
                    }
                    placeholder="Perché vuoi partecipare alla community e cosa vorresti portare..."
                    className="mt-1 min-h-[80px] bg-stone-900 border-stone-700"
                  />
                  {errors.motivation && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.motivation}
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={formData.consent_linee_editoriali}
                  onChange={(e) =>
                    updateField("consent_linee_editoriali", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-stone-600 bg-stone-900"
                />
                <span>
                  Confermo di aver letto e di accettare le linee editoriali: niente
                  autopromozione aggressiva, contributi lenti e ragionati, linguaggio
                  accessibile e trasparenza sulle collaborazioni.
                </span>
              </label>
              {errors.consent_linee_editoriali && (
                <p className="text-xs text-red-500">
                  {errors.consent_linee_editoriali}
                </p>
              )}
            </section>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Regole e linee guida */}
          <aside className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 space-y-4 text-sm text-stone-300">
            <h3 className="text-base font-semibold mb-2">
              Ruolo del bartender nel progetto
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li>Bartender come voce editoriale con interviste e racconti.</li>
              <li>
                Contributi lenti e qualificati, non conversazione da social.
              </li>
              <li>
                Può proporre temi (es. come leggere una bottigliera) e rispondere
                a domande selezionate.
              </li>
            </ul>

            <h4 className="text-sm font-semibold mt-4">
              Regole della community per i bartender
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li>Niente autopromozione aggressiva.</li>
              <li>Risposte solo se portano reale valore.</li>
              <li>Linguaggio accessibile e chiaro.</li>
              <li>Trasparenza su collaborazioni e partnership.</li>
            </ul>

            <h4 className="text-sm font-semibold mt-4">Benefici</h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li>Utenti: imparano da persone reali.</li>
              <li>Proprietari: vedono valorizzato il proprio team.</li>
              <li>
                Bartender: visibilità professionale seria, non solo social.
              </li>
              <li>Piattaforma: aumenta autorevolezza nel mondo del bere.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
