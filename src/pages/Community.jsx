/**
 * Registrazione community – Supabase (app_users). Nessun localStorage.
 * insertAppUser salva su Supabase. Inserimenti da mobile → cloud → visibili su Mac.
 */
import { useState, useRef } from "react";
import { UserPlus, Shield, Store, Wine, User, ChevronRight, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { insertAppUser } from "@/lib/supabaseUsers";
import { uploadMultipleToSupabaseStorage, urlsToDbString } from "@/lib/supabaseStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sfondi in tema rum/cocktail/bar
const BG = {
  hero: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600&q=80",
  carta: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&q=80",
};

const ROLES = [
  { id: "admin", label: "Amministratore", icon: Shield, description: "Gestione completa app e contenuti" },
  { id: "proprietario", label: "Proprietario", icon: Store, description: "Gestione messaggi e inviti per i propri locali" },
  { id: "bartender", label: "Bartender", icon: Wine, description: "Profilo professionale nella community" },
  { id: "user", label: "Utente", icon: User, description: "Partecipa alla community e alla bacheca" },
];

const rawAdminEnv = (import.meta.env.VITE_ADMIN_PASSWORD || "").toString().trim().replace(/^["']|["']$/g, "");
const ADMIN_PASSWORD = rawAdminEnv || "850877";

const isAdminPasswordOk = (p) => {
  const t = String(p ?? "").trim();
  return t === ADMIN_PASSWORD;
};

export default function Community() {
  const { user, setUser, getVenues } = useAppData();
  const navigate = useNavigate();
  const venues = getVenues();
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regVenueIds, setRegVenueIds] = useState([]);
  const [regBioLight, setRegBioLight] = useState("");
  const [regHomeCity, setRegHomeCity] = useState("");
  const [regImageFiles, setRegImageFiles] = useState([]);
  const [regError, setRegError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const imageInputRef = useRef(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    const name = (regName || "").trim();
    if (!name) {
      setRegError("Inserisci il tuo nome.");
      return;
    }
    if (regRole === "admin") {
      if (!isAdminPasswordOk(regPassword)) {
        setRegError("Password amministratore non corretta.");
        return;
      }
    }
    const roleConfig = ROLES.find((r) => r.id === regRole);
    setIsSubmitting(true);
    let imageUrl = null;
    if (regImageFiles.length > 0 && (regRole === "proprietario" || regRole === "user")) {
      try {
        const urls = await uploadMultipleToSupabaseStorage(
          regImageFiles,
          "profiles",
          (current, total) => setUploadProgress({ current, total })
        );
        imageUrl = urlsToDbString(urls);
      } catch (err) {
        setRegError(err?.message || "Errore caricamento immagine.");
        setIsSubmitting(false);
        setUploadProgress({ current: 0, total: 0 });
        return;
      }
    }
    setUploadProgress({ current: 0, total: 0 });
    const userPayload = {
      name,
      email: regRole === "proprietario" ? (regEmail || "").trim() || null : "",
      role: regRole,
      roleLabel: roleConfig?.label || regRole,
      ...(regRole === "proprietario" && { venue_ids: regVenueIds, image_url: imageUrl }),
      ...(regRole === "user" && { bio_light: (regBioLight || "").trim() || null, home_city: (regHomeCity || "").trim() || null, image_url: imageUrl }),
    };
    setRegName("");
    setRegRole("");
    setRegPassword("");
    setRegEmail("");
    setRegVenueIds([]);
    setRegBioLight("");
    setRegHomeCity("");
    setRegImageFiles([]);
    try {
      if (regRole !== "bartender") {
        await insertAppUser(userPayload);
      }
      setUser(userPayload);
    } catch (err) {
      setRegError(err?.message || "Errore durante la registrazione. Riprova.");
    }
    setIsSubmitting(false);
    if (regRole === "bartender") {
      navigate(createPageUrl("AddBartender"));
    }
  };

  // Non registrato: mostra hero + carta + form registrazione
  if (!user || !user.role) {
    return (
      <div className="min-h-screen bg-stone-950 pb-28 lg:pb-12">
        {/* Hero */}
        <section className="relative w-full min-h-[50vh] flex items-center justify-center px-4 md:px-6 py-16 md:py-24 text-center overflow-hidden border-b border-stone-800">
          <img src={BG.hero} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Un luogo per chi sceglie di bere con consapevolezza.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-stone-100 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Esperienze reali, racconti autentici e luoghi vissuti. Una community che mette al centro il tempo, il contesto e il rispetto.
            </p>
          </div>
        </section>

        {/* Carta del Bere Consapevole – fluido, stessa immagine di sfondo */}
        <section className="relative w-full px-4 md:px-6 py-12 md:py-16 pb-12 overflow-hidden">
          <img src={BG.hero} alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
          <div className="absolute inset-0 bg-stone-950/50" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-center text-stone-300/90 text-sm md:text-base italic">
              Qui non trovi classifiche né promozioni. Trovi storie vere e persone che bevono con attenzione.
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-400 text-center">Carta del Bere Consapevole</h2>
            <div className="rounded-2xl border border-stone-600/60 bg-stone-900/70 backdrop-blur-md p-6 md:p-8 space-y-4 text-stone-200 leading-relaxed">
              <p>Questa community nasce per restituire valore a un gesto quotidiano: bere. Crediamo che il bere non sia una performance, ma una scelta. Non cerchiamo il consenso, ma il contesto. Non raccogliamo classifiche, ma esperienze.</p>
              <p>Lo Zio del Rum è uno spazio editoriale indipendente dove:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
                <li>ogni racconto nasce da un'esperienza reale</li>
                <li>ogni luogo viene rispettato prima di essere giudicato</li>
                <li>ogni contributo è basato su attenzione e responsabilità</li>
              </ul>
              <p>Riteniamo che il valore non sia nella quantità, ma nella qualità del tempo dedicato. Per questo:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
                <li>non promuoviamo contenuti costruiti</li>
                <li>non vendiamo visibilità</li>
                <li>non influenziamo i racconti</li>
                <li>non inseguiamo le tendenze</li>
              </ul>
              <p>Sosteniamo invece:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
                <li>il dialogo tra chi beve e chi crea luoghi</li>
                <li>la cultura del bere come esperienza consapevole</li>
                <li>il rispetto reciproco tra community e proprietari</li>
              </ul>
              <p>Questa non è una piattaforma di intrattenimento rapido. È un luogo di osservazione, racconto e confronto.</p>
              <p className="pt-4 border-t border-stone-600/60 text-stone-100 font-medium">
                Entrare significa accettare una responsabilità semplice: bere meno, ma bere meglio. Con attenzione. Con rispetto.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  to={createPageUrl("CommunityFeed")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl transition-colors"
                >
                  Scopri la Bacheca
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Registrazione con 4 categorie */}
        <section className="px-4 md:px-6 py-12 pb-16 bg-stone-950 text-stone-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-stone-100 mb-2 flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-amber-500" />
              Registrati alla community
            </h2>
            <p className="text-stone-400 text-sm mb-6">Scegli la tua categoria e inserisci il nome. Gli amministratori devono inserire la password.</p>
            <form onSubmit={handleRegister} className="rounded-2xl border border-stone-700 bg-stone-900/80 p-6 md:p-8 shadow-lg space-y-6 text-stone-100">
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-2">Nome</label>
                <Input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Il tuo nome o nome attività"
                  className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                />
              </div>
              {(regRole === "proprietario" || regRole === "user") && (
                <div>
                  <Label className="block text-sm font-medium text-stone-200 mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4 text-amber-500" />
                    Foto profilo (opzionale)
                  </Label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    id="reg-image-camera"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setRegImageFiles((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    id="reg-image-gallery"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setRegImageFiles((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("reg-image-camera")?.click()}
                      className="bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700"
                    >
                      Scatta foto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("reg-image-gallery")?.click()}
                      className="bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700"
                    >
                      Galleria
                    </Button>
                  </div>
                  {uploadProgress.total > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
                      </div>
                      <p className="text-xs text-stone-500">Caricamento {uploadProgress.current}/{uploadProgress.total}</p>
                    </div>
                  )}
                  {regImageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {regImageFiles.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="relative group">
                          {f.type.startsWith("video/") ? (
                            <video src={URL.createObjectURL(f)} className="h-16 w-16 object-cover rounded-lg" muted playsInline />
                          ) : (
                            <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 object-cover rounded-lg" />
                          )}
                          <button
                            type="button"
                            onClick={() => { setRegImageFiles((prev) => prev.filter((_, idx) => idx !== i)); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                            className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-stone-500 mt-1">Fotocamera o galleria • max 5MB immagini, 10MB video</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-3">Categoria</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegRole(r.id)}
                      className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-left transition-all ${
                        regRole === r.id
                          ? "border-amber-500 bg-amber-500/20 text-stone-100"
                          : "border-stone-600 bg-stone-800 text-stone-200 hover:border-stone-500"
                      }`}
                    >
                      <r.icon className="w-6 h-6 text-amber-500" />
                      <span className="font-semibold text-sm text-stone-100">{r.label}</span>
                      <span className="text-xs text-stone-400 hidden sm:block">{r.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              {regRole === "proprietario" && (
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-stone-200 mb-2">Email</Label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@esempio.it"
                      className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-stone-200 mb-2">Locali di cui sei proprietario</Label>
                    <Select
                      value={regVenueIds[0] || ""}
                      onValueChange={(v) => setRegVenueIds(v ? [v] : [])}
                    >
                      <SelectTrigger className="bg-stone-800 border-stone-600 text-stone-100">
                        <SelectValue placeholder="Seleziona un locale (opzionale)" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-800">
                        {venues.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} - {v.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-stone-500 mt-1">Associa il tuo profilo a un locale</p>
                  </div>
                </div>
              )}
              {regRole === "user" && (
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-stone-200 mb-2">Città di residenza (opzionale)</Label>
                    <Input
                      value={regHomeCity}
                      onChange={(e) => setRegHomeCity(e.target.value)}
                      placeholder="Milano, Roma..."
                      className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-stone-200 mb-2">Breve presentazione (opzionale)</Label>
                    <Textarea
                      value={regBioLight}
                      onChange={(e) => setRegBioLight(e.target.value)}
                      placeholder="Qualche riga su di te e il tuo rapporto con il bere consapevole..."
                      className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500 min-h-[80px]"
                    />
                  </div>
                </div>
              )}
              {regRole === "admin" && (
                <div>
                  <Label className="block text-sm font-medium text-stone-200 mb-2">Password amministratore</Label>
                  <Input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              )}
              {regError && <p className="text-sm text-red-600">{regError}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950">
                {isSubmitting ? "Registrazione..." : "Registrati"}
              </Button>
            </form>
            <p className="text-center text-stone-400 text-sm mt-4">
              <Link to={createPageUrl("Home")} className="text-amber-500 hover:text-amber-400 hover:underline">Torna alla Home</Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-8 pb-28 lg:pb-12">
      {/* Hero */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center px-4 md:px-6 py-16 md:py-24 text-center overflow-hidden border-b border-stone-800">
        <img src={BG.hero} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
        <div className="absolute inset-0 bg-stone-950/40" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Un luogo per chi sceglie di bere con consapevolezza.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-stone-100 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Esperienze reali, racconti autentici e luoghi vissuti.
            <br className="hidden sm:block" />
            Una community che mette al centro il tempo, il contesto e il rispetto.
          </p>
        </div>
      </section>

      {/* Carta del Bere Consapevole – fluido, stessa immagine di sfondo */}
      <section className="relative w-full px-4 md:px-6 py-12 md:py-16 pb-12 overflow-hidden">
        <img
          src={BG.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-stone-950/50" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <p className="text-center text-stone-300/90 text-sm md:text-base italic">
            Qui non trovi classifiche né promozioni. Trovi storie vere e persone che bevono con attenzione.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-400 text-center">
            Carta del Bere Consapevole
          </h2>
          <div className="rounded-2xl border border-stone-600/60 bg-stone-900/70 backdrop-blur-md p-6 md:p-8 space-y-4 text-stone-200 leading-relaxed">
            <p>
              Questa community nasce per restituire valore a un gesto quotidiano: bere.
              Crediamo che il bere non sia una performance, ma una scelta.
              Non cerchiamo il consenso, ma il contesto.
              Non raccogliamo classifiche, ma esperienze.
            </p>
            <p>
              Lo Zio del Rum è uno spazio editoriale indipendente dove:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
              <li>ogni racconto nasce da un'esperienza reale</li>
              <li>ogni luogo viene rispettato prima di essere giudicato</li>
              <li>ogni contributo è basato su attenzione e responsabilità</li>
            </ul>
            <p>
              Riteniamo che il valore non sia nella quantità, ma nella qualità del tempo dedicato.
              Per questo:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
              <li>non promuoviamo contenuti costruiti</li>
              <li>non vendiamo visibilità</li>
              <li>non influenziamo i racconti</li>
              <li>non inseguiamo le tendenze</li>
            </ul>
            <p>
              Sosteniamo invece:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
              <li>il dialogo tra chi beve e chi crea luoghi</li>
              <li>la cultura del bere come esperienza consapevole</li>
              <li>il rispetto reciproco tra community e proprietari</li>
            </ul>
            <p>
              Questa non è una piattaforma di intrattenimento rapido.
              È un luogo di osservazione, racconto e confronto.
            </p>
            <p className="pt-4 border-t border-stone-600/60 text-stone-100 font-medium">
              Entrare significa accettare una responsabilità semplice:
              <br />
              bere meno, ma bere meglio.
              <br />
              Con attenzione.
              <br />
              Con rispetto.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to={createPageUrl("CommunityFeed")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl transition-colors"
              >
                Entra nella Community
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
