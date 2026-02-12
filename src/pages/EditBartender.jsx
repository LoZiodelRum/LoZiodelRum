import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/lib/AppDataContext";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft,
  User,
  MapPin,
  Award,
  Wine,
  Send,
  Loader2,
} from "lucide-react";
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

export default function EditBartender() {
  const urlParams = new URLSearchParams(window.location.search);
  const bartenderId = urlParams.get("id");
  const navigate = useNavigate();
  const { getBartenderById, updateBartender, getVenues } = useAppData();
  const bartender = getBartenderById(bartenderId);
  const venues = getVenues();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    photo: "",
    venue_id: "",
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

  useEffect(() => {
    if (bartender) {
      setFormData({
        name: bartender.name || "",
        surname: bartender.surname || "",
        photo: bartender.photo || "",
        venue_id: bartender.venue_id || "",
        city: bartender.city || "",
        specialization: bartender.specialization || "",
        years_experience: bartender.years_experience || "",
        philosophy: bartender.philosophy || "",
        distillati_preferiti: bartender.distillati_preferiti || "",
        approccio_degustazione: bartender.approccio_degustazione || "",
        consiglio_inizio: bartender.consiglio_inizio || "",
        signature_drinks: bartender.signature_drinks || "",
        percorso_esperienze: bartender.percorso_esperienze || "",
        bio: bartender.bio || "",
        motivation: bartender.motivation || "",
        consent_linee_editoriali: !!bartender.consent_linee_editoriali,
      });
    }
  }, [bartender]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Inserisci il nome.";
    if (!formData.surname.trim()) newErrors.surname = "Inserisci il cognome.";
    if (!formData.venue_id) newErrors.venue_id = "Seleziona il locale attuale.";
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
      const selectedVenue = venues.find((v) => v.id === formData.venue_id);
      const payload = {
        ...formData,
        city: formData.city || selectedVenue?.city || "",
      };
      updateBartender(bartenderId, payload);
      navigate(createPageUrl("Dashboard"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bartenderId && !bartender) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Wine className="w-16 h-16 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">Bartender non trovato.</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna alla Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 pt-8 pb-28 lg:pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={createPageUrl("Dashboard")}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-100 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Torna alla Dashboard
          </Link>
        </div>

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
                Modifica scheda bartender
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {formData.name} {formData.surname}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-6 items-start">
          <form
            onSubmit={handleSubmit}
            className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 md:p-8 space-y-8"
          >
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">Profilo del bartender</h2>
                  <p className="text-xs md:text-sm text-stone-400">Informazioni di base.</p>
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
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Cognome</Label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => updateField("surname", e.target.value)}
                    placeholder="Cognome"
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                  {errors.surname && <p className="text-xs text-red-500 mt-1">{errors.surname}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">Foto (URL)</Label>
                  <Input
                    value={formData.photo}
                    onChange={(e) => updateField("photo", e.target.value)}
                    placeholder="https://..."
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Locale attuale</Label>
                  <Select
                    value={formData.venue_id}
                    onValueChange={(value) => updateField("venue_id", value)}
                  >
                    <SelectTrigger className="mt-1 bg-stone-900 border-stone-700">
                      <SelectValue placeholder="Seleziona un locale" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} — {v.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.venue_id && <p className="text-xs text-red-500 mt-1">{errors.venue_id}</p>}
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
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization}</p>}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Anni di esperienza</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => updateField("years_experience", e.target.value)}
                    placeholder="Es. 5"
                    className="mt-1 bg-stone-900 border-stone-700"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Filosofia di lavoro</h2>
                </div>
              </div>
              <Textarea
                value={formData.philosophy}
                onChange={(e) => updateField("philosophy", e.target.value)}
                placeholder="Filosofia dietro al bancone..."
                className="min-h-[80px] bg-stone-900 border-stone-700"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Come beve</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">Distillati preferiti</Label>
                  <Textarea
                    value={formData.distillati_preferiti}
                    onChange={(e) => updateField("distillati_preferiti", e.target.value)}
                    placeholder="Rum agricoli, mezcal..."
                    className="mt-1 min-h-[70px] bg-stone-900 border-stone-700 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Approccio alla degustazione</Label>
                  <Textarea
                    value={formData.approccio_degustazione}
                    onChange={(e) => updateField("approccio_degustazione", e.target.value)}
                    placeholder="Come affronti una degustazione..."
                    className="mt-1 min-h-[70px] bg-stone-900 border-stone-700 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Consiglio per chi inizia</Label>
                  <Textarea
                    value={formData.consiglio_inizio}
                    onChange={(e) => updateField("consiglio_inizio", e.target.value)}
                    placeholder="Un consiglio per il bere consapevole..."
                    className="mt-1 min-h-[70px] bg-stone-900 border-stone-700 text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Signature / Selezioni</h2>
              <Textarea
                value={formData.signature_drinks}
                onChange={(e) => updateField("signature_drinks", e.target.value)}
                placeholder="Signature drink o bottiglie rappresentative..."
                className="min-h-[80px] bg-stone-900 border-stone-700"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Percorso</h2>
              <Textarea
                value={formData.percorso_esperienze}
                onChange={(e) => updateField("percorso_esperienze", e.target.value)}
                placeholder="Esperienze, locali, città..."
                className="min-h-[80px] bg-stone-900 border-stone-700"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Bio, motivazione e linee editoriali</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-stone-300">Breve bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Raccontati in poche righe..."
                    className="mt-1 min-h-[80px] bg-stone-900 border-stone-700"
                  />
                  {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
                </div>
                <div>
                  <Label className="text-sm text-stone-300">Motivazione a partecipare</Label>
                  <Textarea
                    value={formData.motivation}
                    onChange={(e) => updateField("motivation", e.target.value)}
                    placeholder="Perché partecipi alla community..."
                    className="mt-1 min-h-[80px] bg-stone-900 border-stone-700"
                  />
                  {errors.motivation && <p className="text-xs text-red-500 mt-1">{errors.motivation}</p>}
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={formData.consent_linee_editoriali}
                  onChange={(e) => updateField("consent_linee_editoriali", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-600 bg-stone-900"
                />
                <span>Confermo di aver letto e accettare le linee editoriali.</span>
              </label>
              {errors.consent_linee_editoriali && <p className="text-xs text-red-500">{errors.consent_linee_editoriali}</p>}
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
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Salva modifiche
                  </>
                )}
              </Button>
            </div>
          </form>

          <aside className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 space-y-4 text-sm text-stone-300">
            <h3 className="text-base font-semibold mb-2">Modifica scheda</h3>
            <p className="text-stone-400">
              Le modifiche vengono salvate subito. Lo stato (in attesa / approvato / in evidenza) si gestisce dalla Dashboard.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
