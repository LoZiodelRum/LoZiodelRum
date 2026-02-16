import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram,
  Clock,
  Send,
  Loader2,
  Wine,
  Image as ImageIcon,
  Video as VideoIcon,
  X
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
import { motion } from "framer-motion";
import { uploadToSupabaseStorage, uploadMultipleToSupabaseStorage, urlsToDbString } from "@/lib/supabaseStorage";

const categories = [
  { value: "cocktail_bar", label: "Cocktail Bar" },
  { value: "rum_bar", label: "Rum Bar" },
  { value: "wine_bar", label: "Wine Bar" },
  { value: "speakeasy", label: "Speakeasy" },
  { value: "distillery", label: "Distilleria" },
  { value: "enoteca", label: "Enoteca" },
  { value: "pub", label: "Pub" },
  { value: "rooftop", label: "Rooftop Bar" },
  { value: "hotel_bar", label: "Hotel Bar" }
];

const priceRanges = [
  { value: "€", label: "€ - Economico" },
  { value: "€€", label: "€€ - Medio" },
  { value: "€€€", label: "€€€ - Alto" },
  { value: "€€€€", label: "€€€€ - Premium" },
];

const specialtyOptions = [
  "Rum", "Whisky", "Gin", "Cocktail d'autore", "Tiki", 
  "Vini naturali", "Champagne", "Mezcal", "Vermouth", "Amari"
];

export default function AddVenue() {
  const navigate = useNavigate();
  const { addVenue, getLocalVenuesToSync, syncLocalVenuesToCloud, isSupabaseConfigured } = useAppData();
  const hasSupabase = isSupabaseConfigured?.() ?? false;
  const [syncing, setSyncing] = useState(false);
  const localToSync = getLocalVenuesToSync?.() ?? [];
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    country: "Italia",
    address: "",
    categories: [],
    price_range: "€€",
    specialties: [],
    phone: "",
    website: "",
    instagram: "",
    opening_hours: "",
    latitude: null,
    longitude: null,
    cover_image: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [coverImageFiles, setCoverImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const initialFormData = {
    name: "",
    description: "",
    city: "",
    country: "Italia",
    address: "",
    categories: [],
    price_range: "€€",
    specialties: [],
    phone: "",
    website: "",
    instagram: "",
    opening_hours: "",
    latitude: null,
    longitude: null,
    cover_image: "",
  };

  const createVenueMutation = useMutation({
    mutationFn: (venueData) => addVenue(venueData),
    onSuccess: (data) => {
      setIsSubmitting(false);
      setStatus("success");
      setFormData(initialFormData);
      setCoverImageFiles([]);
      setVideoFile(null);
      setErrors({});
      setUploadProgress({ current: 0, total: 0 });
      if (!data.pending) {
        navigate(createPageUrl(`VenueDetail?id=${data.id}`));
      }
    },
    onError: (err) => {
      setIsSubmitting(false);
      setStatus("error");
      setErrors((prev) => ({ ...prev, _form: err?.message || "Errore di salvataggio" }));
    },
  });

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    if (errors.categories) setErrors(prev => ({ ...prev, categories: undefined }));
  };

  const handleSubmit = async () => {
    const next = {};
    if (!formData.name?.trim()) next.name = "Inserisci il nome del locale.";
    if (!formData.city?.trim()) next.city = "Inserisci la città.";
    if (!formData.categories?.length) next.categories = "Seleziona almeno una categoria.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    let coverImageUrl = formData.cover_image || "";
    let videoUrl = "";

    if (hasSupabase) {
      try {
        if (coverImageFiles.length > 0) {
          const urls = await uploadMultipleToSupabaseStorage(
            coverImageFiles,
            "venues",
            (current, total) => setUploadProgress({ current, total })
          );
          coverImageUrl = urlsToDbString(urls);
        }
        setUploadProgress({ current: 0, total: 0 });
        if (videoFile) {
          videoUrl = await uploadToSupabaseStorage(videoFile, "venues", "video");
        }
      } catch (err) {
        setStatus("error");
        setErrors((prev) => ({ ...prev, _form: err?.message || "Errore caricamento file" }));
        setIsSubmitting(false);
        setUploadProgress({ current: 0, total: 0 });
        return;
      }
    }

    const slug = formData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    createVenueMutation.mutate({
      name: formData.name,
      slug,
      description: formData.description || "",
      city: formData.city,
      country: formData.country || "Italia",
      address: formData.address || "",
      categories: formData.categories,
      category: formData.categories?.[0] || "cocktail_bar",
      price_range: formData.price_range || "€€",
      phone: formData.phone || "",
      website: formData.website || "",
      instagram: formData.instagram || "",
      opening_hours: formData.opening_hours || "",
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
      cover_image: coverImageUrl,
      video_url: videoUrl || null,
      featured: false,
      verified: hasSupabase,
    });
  };

  const isValid = formData.name && formData.city && formData.categories.length > 0;

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Banner status - auto-close 5s */}
        {status === "success" && (
          <div className="mb-6 p-4 rounded-xl bg-green-600 border border-green-400 text-white text-center font-bold text-lg">
            INVIO COMPLETATO
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 p-4 rounded-xl bg-red-600 border border-red-400 text-white text-center font-medium">
            {errors._form || "Errore durante l'invio. Riprova."}
          </div>
        )}
        {/* Header - spazio extra per evitare sovrapposizione con menu */}
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link 
            to={createPageUrl("Explore")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
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
                Hai {localToSync.length} locale{localToSync.length > 1 ? "i" : ""} salvato{localToSync.length > 1 ? "i" : ""} solo su questo dispositivo
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
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-500" />
              Informazioni Base
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Nome del locale *</Label>
                <Input
                  placeholder="Es. Bar Basso"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`bg-stone-800/50 border-stone-700 ${errors.name ? "border-red-500/50" : ""}`}
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <Label className="mb-2 block">Descrizione</Label>
                <Textarea
                  placeholder="Descrivi il locale: storia, atmosfera, cosa lo rende speciale..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700 min-h-[100px]"
                />
              </div>

              <div>
                <Label className="mb-2 block">Categorie * (seleziona tutte quelle applicabili)</Label>
                <div className={`flex flex-wrap gap-2 ${errors.categories ? "rounded-lg ring-1 ring-red-500/50 p-2" : ""}`}>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer touch-manipulation ${
                        formData.categories.includes(cat.value)
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600 active:bg-stone-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {errors.categories && <p className="mt-1.5 text-sm text-red-400">{errors.categories}</p>}
              </div>

              <div>
                <Label className="mb-2 block">Fascia di prezzo</Label>
                <Select 
                  value={formData.price_range} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, price_range: v }))}
                >
                  <SelectTrigger className="bg-stone-800/50 border-stone-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    {priceRanges.map(price => (
                      <SelectItem key={price.value} value={price.value}>{price.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Posizione
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Città *</Label>
                  <Input
                    placeholder="Es. Milano"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, city: e.target.value }));
                      if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
                    }}
                    className={`bg-stone-800/50 border-stone-700 ${errors.city ? "border-red-500/50" : ""}`}
                  />
                  {errors.city && <p className="mt-1.5 text-sm text-red-400">{errors.city}</p>}
                </div>
                <div>
                  <Label className="mb-2 block">Paese</Label>
                  <Input
                    placeholder="Es. Italia"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Indirizzo completo</Label>
                <Input
                  placeholder="Via, numero civico, CAP"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Latitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="45.4642"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Longitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="9.1900"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Specialità</h2>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.specialties.includes(specialty)
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Contatti</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-500" />
                    Telefono
                  </Label>
                  <Input
                    placeholder="+39 02 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-stone-500" />
                    Instagram
                  </Label>
                  <Input
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Globe className="w-4 h-4 text-stone-500" />
                  Sito web
                </Label>
                <Input
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>

              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500" />
                  Orari di apertura
                </Label>
                <Input
                  placeholder="Es. Lun-Sab 18:00-02:00"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Cover Image e Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              Immagine di copertina
            </h2>
            <div className="space-y-2">
              <div className="relative inline-block">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 text-stone-300 hover:bg-stone-700 text-sm font-medium pointer-events-none">
                  <ImageIcon className="w-4 h-4" />
                  {coverImageFiles.length > 0 ? `${coverImageFiles.length} file` : "carica una foto"}
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCoverImageFiles((prev) => [...prev, ...files]);
                    if (files.length) setFormData((prev) => ({ ...prev, cover_image: "" }));
                    e.target.value = "";
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ fontSize: 0 }}
                />
              </div>
              <p className="text-xs text-stone-500">Fotocamera, video o galleria • max 5MB foto, 10MB video</p>
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
                <p className="text-xs text-stone-500 w-full">Anteprima – clicca X per rimuovere</p>
                {coverImageFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="relative group">
                    {f.type.startsWith("video/") ? (
                      <video src={URL.createObjectURL(f)} className="h-20 w-20 object-cover rounded-lg" muted playsInline />
                    ) : (
                      <img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 object-cover rounded-lg" />
                    )}
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

            <div className="pt-4 border-t border-stone-700">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-amber-500" />
                Video breve (opzionale)
              </h3>
              <div className="relative inline-block">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 text-stone-300 hover:bg-stone-700 text-sm font-medium pointer-events-none">
                  <VideoIcon className="w-4 h-4" />
                  {videoFile ? videoFile.name : "Scatta video o carica"}
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  multiple
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ fontSize: 0 }}
                />
              </div>
                <div className="flex gap-2 items-center mt-2">
                  {videoFile && (
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="text-xs text-stone-500 hover:text-stone-300"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              <p className="text-xs text-stone-500 mt-1">max 10MB</p>
            </div>
          </motion.div>

          {/* Submit */}
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