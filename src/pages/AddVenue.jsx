/**
 * Aggiungi Locale – mapping definitivo colonne Locali.
 * Colonne: nome, descrizione, indirizzo, citta, provincia, categoria, orari, telefono, status, image_url, approvato.
 * NO ACCENTI: citta (senza accento) nel codice.
 * Valori predefiniti: status='pending', approvato=false.
 * SUCCESSO: nessun redirect; alert + reset form.
 */
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ChevronLeft, MapPin, Phone, Clock, Send, Loader2, Wine, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { uploadMultipleToSupabaseStorage, urlsToDbString } from "@/lib/supabaseStorage";

const categories = [
  { value: "cocktail_bar", label: "Cocktail Bar" },
  { value: "rum_bar", label: "Rum Bar" },
  { value: "wine_bar", label: "Wine Bar" },
  { value: "speakeasy", label: "Speakeasy" },
  { value: "distillery", label: "Distilleria" },
  { value: "enoteca", label: "Enoteca" },
  { value: "pub", label: "Pub" },
  { value: "rooftop", label: "Rooftop Bar" },
  { value: "hotel_bar", label: "Hotel Bar" },
];

const initialFormData = {
  nome: "",
  descrizione: "",
  indirizzo: "",
  citta: "",
  provincia: "",
  categorie: [],
  orari: "",
  telefono: "",
  image_url: "",
};

export default function AddVenue() {
  const { addVenue, getLocalVenuesToSync, syncLocalVenuesToCloud, isSupabaseConfigured } = useAppData();
  const hasSupabase = isSupabaseConfigured?.() ?? false;
  const [syncing, setSyncing] = useState(false);
  const localToSync = getLocalVenuesToSync?.() ?? [];

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [coverImageFiles, setCoverImageFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const handleCoverInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setCoverImageFiles((prev) => [...prev, ...files]);
      setFormData((prev) => ({ ...prev, image_url: "" }));
    }
    e.target.value = "";
  };

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const createVenueMutation = useMutation({
    mutationFn: (venueData) => addVenue(venueData),
    onSuccess: () => {
      setIsSubmitting(false);
      setStatus("success");
      setFormData(initialFormData);
      setCoverImageFiles([]);
      setErrors({});
      setUploadProgress({ current: 0, total: 0 });
      alert("Locale salvato con successo!");
    },
    onError: (err) => {
      setIsSubmitting(false);
      setStatus("error");
      setErrors((prev) => ({ ...prev, _form: err?.message || "Errore di salvataggio" }));
    },
  });

  const toggleCategory = (category) => {
    setFormData((prev) => {
      const list = prev.categorie || [];
      const has = list.includes(category);
      const next = has ? list.filter((c) => c !== category) : [...list, category];
      return { ...prev, categorie: next };
    });
    if (errors.categorie) setErrors((prev) => ({ ...prev, categorie: undefined }));
  };

  const handleSubmit = async () => {
    const next = {};
    if (!formData.nome?.trim()) next.nome = "Inserisci il nome del locale.";
    if (!formData.citta?.trim()) next.citta = "Inserisci la citta.";
    if (!formData.categorie?.length) next.categorie = "Seleziona almeno una categoria.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    let imageUrl = formData.image_url || "";

    if (hasSupabase) {
      try {
        if (coverImageFiles.length > 0) {
          const urls = await uploadMultipleToSupabaseStorage(
            coverImageFiles,
            "",
            (current, total) => setUploadProgress({ current, total })
          );
          imageUrl = urlsToDbString(urls) || (urls[0] ?? "");
        }
        setUploadProgress({ current: 0, total: 0 });
      } catch (err) {
        setStatus("error");
        const msg = err?.message || err?.error_description || "Errore caricamento file";
        setErrors((prev) => ({ ...prev, _form: msg }));
        alert(`Errore upload: ${msg}`);
        setIsSubmitting(false);
        setUploadProgress({ current: 0, total: 0 });
        return;
      }
    }

    const venueData = {
      nome: formData.nome?.trim() || "",
      descrizione: formData.descrizione || "",
      indirizzo: formData.indirizzo || "",
      citta: formData.citta || "",
      provincia: formData.provincia || null,
      categoria: (formData.categorie?.length ? formData.categorie : ["cocktail_bar"]).join(","),
      orari: formData.orari || "",
      telefono: formData.telefono || "",
      status: "pending",
      image_url: imageUrl || null,
      approvato: false,
    };

    if (hasSupabase && isSupabaseConfigured?.()) {
      try {
        console.log("Dati inviati:", venueData);
        const { error } = await supabase.from("Locali").insert([venueData]);
        if (error) {
          const msg = error.message || error.details || JSON.stringify(error);
          console.error("[AddVenue] Supabase error:", error);
          setStatus("error");
          setErrors((prev) => ({ ...prev, _form: msg }));
          alert(`Errore Supabase: ${msg}`);
          setIsSubmitting(false);
          return;
        }
        setIsSubmitting(false);
        setStatus("success");
        setFormData(initialFormData);
        setCoverImageFiles([]);
        setErrors({});
        setUploadProgress({ current: 0, total: 0 });
        alert("Locale salvato con successo!");
      } catch (err) {
        const msg = err?.message || err?.error_description || String(err);
        console.error("[AddVenue] Errore:", err);
        setStatus("error");
        setErrors((prev) => ({ ...prev, _form: msg }));
        alert(`Errore invio: ${msg}`);
        setIsSubmitting(false);
      }
    } else {
      createVenueMutation.mutate({
        name: formData.nome,
        description: formData.descrizione || "",
        city: formData.citta,
        province: formData.provincia || "",
        address: formData.indirizzo || "",
        category: (formData.categorie?.length ? formData.categorie : ["cocktail_bar"]).join(","),
        opening_hours: formData.orari || "",
        phone: formData.telefono || "",
        cover_image: imageUrl,
        status: "pending",
        approvato: false,
      });
    }
  };

  const isValid = formData.nome && formData.citta && (formData.categorie?.length ?? 0) > 0;

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-2xl mx-auto">
        {status === "success" && (
          <div className="mb-6 p-6 rounded-xl bg-green-600 border-2 border-green-400 text-white text-center font-bold text-xl">
            Locale salvato con successo!
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 p-6 rounded-xl bg-red-600 border-2 border-red-400 text-white text-center font-bold text-xl">
            {errors._form || "Errore durante l'invio. Riprova."}
          </div>
        )}
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link to={createPageUrl("Explore")} className="p-2 hover:bg-stone-800 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Aggiungi Locale</h1>
            <p className="text-stone-500">Contribuisci al nostro archivio</p>
          </div>
        </div>

        <div className="space-y-6">
          {isSupabaseConfigured?.() && localToSync.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-amber-400 font-medium mb-2">
                Hai {localToSync.length} locale{localToSync.length > 1 ? "i" : ""} salvato
                {localToSync.length > 1 ? "i" : ""} solo su questo dispositivo
              </p>
              <p className="text-stone-400 text-sm mb-3">
                {localToSync.map((v) => v.name).join(", ")}. Invia alla Dashboard per l&apos;approvazione.
              </p>
              <Button
                onClick={async () => {
                  setSyncing(true);
                  const { synced } = await syncLocalVenuesToCloud?.();
                  setSyncing(false);
                  if (synced > 0) {
                    toast({ title: "Inviato!", description: `${synced} locale/i ora in attesa nella Dashboard.` });
                  }
                }}
                disabled={syncing}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950"
              >
                {syncing ? "Invio in corso..." : "Invia alla Dashboard"}
              </Button>
            </div>
          )}
          {errors._form && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errors._form}
            </div>
          )}
          {Object.keys(errors).filter((k) => k !== "_form").length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              Correggi i campi indicati sotto prima di inviare.
            </div>
          )}

          {/* Dati base: nome, descrizione, indirizzo, citta, provincia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-500" />
              Dati base
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Nome del locale *</Label>
                <Input
                  placeholder="Es. Bar Basso"
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, nome: e.target.value }));
                    if (errors.nome) setErrors((prev) => ({ ...prev, nome: undefined }));
                  }}
                  className={`bg-stone-800/50 border-stone-700 ${errors.nome ? "border-red-500/50" : ""}`}
                />
                {errors.nome && <p className="mt-1.5 text-sm text-red-400">{errors.nome}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Descrizione</Label>
                <Textarea
                  placeholder="Descrivi il locale..."
                  value={formData.descrizione}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descrizione: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700 min-h-[100px]"
                />
              </div>
              <div>
                <Label className="mb-2 block">Indirizzo</Label>
                <Input
                  placeholder="Via, numero civico, CAP"
                  value={formData.indirizzo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, indirizzo: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Città *</Label>
                  <Input
                    placeholder="Es. Milano"
                    value={formData.citta}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, citta: e.target.value }));
                      if (errors.citta) setErrors((prev) => ({ ...prev, citta: undefined }));
                    }}
                    className={`bg-stone-800/50 border-stone-700 ${errors.citta ? "border-red-500/50" : ""}`}
                  />
                  {errors.citta && <p className="mt-1.5 text-sm text-red-400">{errors.citta}</p>}
                </div>
                <div>
                  <Label className="mb-2 block">Provincia</Label>
                  <Input
                    placeholder="Es. MI"
                    value={formData.provincia}
                    onChange={(e) => setFormData((prev) => ({ ...prev, provincia: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dettagli: categoria, orari, telefono */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Dettagli
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Categoria * (multiscelta)</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selected = (formData.categorie || []).includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleCategory(cat.value)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                          selected
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                {errors.categorie && <p className="mt-1.5 text-sm text-red-400">{errors.categorie}</p>}
              </div>
              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500" />
                  Orari
                </Label>
                <Input
                  placeholder="Es. Lun-Sab 18:00-02:00"
                  value={formData.orari}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orari: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-500" />
                  Telefono
                </Label>
                <Input
                  placeholder="+39 02 1234567"
                  value={formData.telefono}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Media: bucket images → image_url */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              Foto (bucket images)
            </h2>
            <div className="space-y-2">
              <label className="relative block w-full cursor-pointer">
                <span className="block px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700">
                  Carica una foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCoverInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ fontSize: 0 }}
                />
              </label>
              <p className="text-xs text-stone-500">max 5MB</p>
              {uploadProgress.total > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500">
                    Caricamento {uploadProgress.current}/{uploadProgress.total}
                  </p>
                </div>
              )}
            </div>
            {coverImageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {coverImageFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setCoverImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700"
                      aria-label="Rimuovi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-lg rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Aggiungi Locale
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
