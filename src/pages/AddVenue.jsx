import { useState } from "react";
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
  Upload,
  Send,
  Loader2,
  Wine
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

const categories = [
  { value: "cocktail_bar", label: "Cocktail Bar" },
  { value: "rum_bar", label: "Rum Bar" },
  { value: "wine_bar", label: "Wine Bar" },
  { value: "speakeasy", label: "Speakeasy" },
  { value: "rooftop", label: "Rooftop" }
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

  const createVenueMutation = useMutation({
    mutationFn: (venueData) => addVenue(venueData),
    onSuccess: (data) => {
      if (data.pending) {
        toast({
          title: "Locale inviato!",
          description: "Sarà visibile dopo l'approvazione dell'amministratore.",
        });
        navigate(createPageUrl("Explore"));
      } else {
        navigate(createPageUrl(`VenueDetail?id=${data.id}`));
      }
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
    
    // Generate slug from name
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
      category: formData.categories?.[0] || "cocktail_bar",
      price_range: formData.price_range || "€€",
      phone: formData.phone || "",
      website: formData.website || "",
      instagram: formData.instagram || "",
      opening_hours: formData.opening_hours || "",
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
      cover_image: formData.cover_image || "",
      featured: false,
      verified: hasSupabase, // senza Supabase: false → appare in "Locali in attesa"
    });
  };

  const isValid = formData.name && formData.city && formData.categories.length > 0;

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-2xl mx-auto">
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
          {Object.keys(errors).length > 0 && (
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
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        formData.categories.includes(cat.value)
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600"
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

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Immagine di copertina</h2>
            <Input
              placeholder="URL dell'immagine..."
              value={formData.cover_image}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
              className="bg-stone-800/50 border-stone-700"
            />
            {formData.cover_image && (
              <img 
                src={formData.cover_image} 
                alt="Preview" 
                className="mt-4 h-40 w-full object-cover rounded-xl"
              />
            )}
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
                Creazione...
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