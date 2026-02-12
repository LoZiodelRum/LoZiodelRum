import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { 
  ChevronLeft,
  Save,
  Loader2,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const priceRanges = ["€", "€€", "€€€", "€€€€"];

const specialtyOptions = [
  "Cocktail d'autore",
  "Rum collection",
  "Whisky selection",
  "Vini naturali",
  "Champagne bar",
  "Gin tonic bar",
  "Mixology",
  "Degustazioni"
];

export default function EditVenue() {
  const urlParams = new URLSearchParams(window.location.search);
  const venueId = urlParams.get('id');
  
  const navigate = useNavigate();
  const { getVenueById, updateVenue } = useAppData();
  const venue = getVenueById(venueId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    country: "",
    address: "",
    latitude: null,
    longitude: null,
    category: "cocktail_bar",
    specialties: [],
    price_range: "€€",
    phone: "",
    website: "",
    instagram: "",
    opening_hours: "",
    cover_image: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || "",
        description: venue.description || "",
        city: venue.city || "",
        country: venue.country || "",
        address: venue.address || "",
        latitude: venue.latitude ?? null,
        longitude: venue.longitude ?? null,
        category: venue.category || "cocktail_bar",
        specialties: venue.specialties || [],
        price_range: venue.price_range || "€€",
        phone: venue.phone || "",
        website: venue.website || "",
        instagram: venue.instagram || "",
        opening_hours: venue.opening_hours || "",
        cover_image: venue.cover_image || ""
      });
    }
  }, [venue]);

  const updateVenueMutation = useMutation({
    mutationFn: async (venueData) => {
      return updateVenue(venueId, venueData);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      navigate(createPageUrl(`VenueDetail?id=${venueId}`));
    },
    onError: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    updateVenueMutation.mutate(formData);
  };

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  if (venueId && !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <MapPin className="w-20 h-20 text-stone-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Locale non trovato</h2>
          <p className="text-stone-500 mb-6">Il locale che stai cercando non esiste.</p>
          <Link to={createPageUrl("Explore")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna all'esplorazione
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to={createPageUrl(`VenueDetail?id=${venueId}`)}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Modifica Locale</h1>
            <p className="text-stone-500">Aggiorna le informazioni</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Informazioni Base</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Nome del locale *</Label>
                <Input
                  placeholder="Es. The Rum Bar"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>

              <div>
                <Label className="mb-2 block">Descrizione</Label>
                <Textarea
                  placeholder="Racconta qualcosa su questo locale..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700 min-h-[100px]"
                />
              </div>

              <div>
                <Label className="mb-2 block">Categoria *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="bg-stone-800/50 border-stone-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Località
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Indirizzo completo</Label>
                <Input
                  placeholder="Via Roma 123"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Città *</Label>
                  <Input
                    placeholder="Milano"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Paese *</Label>
                  <Input
                    placeholder="Italia"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Latitudine (per la mappa)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="45.4642"
                    value={formData.latitude ?? ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Longitudine (per la mappa)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="9.1900"
                    value={formData.longitude ?? ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specialties & Price */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Specialità e Prezzi</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Specialità</Label>
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
              </div>

              <div>
                <Label className="mb-2 block">Fascia di prezzo</Label>
                <div className="flex gap-2">
                  {priceRanges.map((price) => (
                    <button
                      key={price}
                      onClick={() => setFormData(prev => ({ ...prev, price_range: price }))}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        formData.price_range === price
                          ? "bg-amber-500 text-stone-950"
                          : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Contatti</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
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
                  <Globe className="w-4 h-4 text-amber-500" />
                  Sito web
                </Label>
                <Input
                  placeholder="https://www.esempio.com"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>

              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-amber-500" />
                  Instagram (solo username)
                </Label>
                <Input
                  placeholder="nomelocale"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>

              <div>
                <Label className="mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Orari di apertura
                </Label>
                <Input
                  placeholder="Mar-Dom 18:00-02:00"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              Immagine di copertina
            </h3>
            <div>
              <Label className="mb-2 block">URL immagine</Label>
              <Input
                placeholder="https://..."
                value={formData.cover_image}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                className="bg-stone-800/50 border-stone-700"
              />
              {formData.cover_image && (
                <img 
                  src={formData.cover_image} 
                  alt="Preview"
                  className="mt-3 w-full h-48 object-cover rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.city || !formData.country || isSubmitting}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-lg rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salva Modifiche
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}