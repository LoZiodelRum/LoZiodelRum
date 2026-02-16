/**
 * Aggiungi recensione – Supabase (reviews_cloud).
 * Nessun localStorage: addReview/addVenue scrivono su Supabase.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { 
  Star, 
  X, 
  Plus,
  ChevronLeft,
  ChevronDown,
  Wine,
  Users,
  Sparkles,
  Coins,
  ThumbsUp,
  Send,
  Loader2,
  Image,
  Video
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { ratingOptions } from "@/lib/reviewRatings";
import { highlightOptions, improvementOptions } from "@/lib/highlightsImprovements";
import { uploadMultipleToSupabaseStorage } from "@/lib/supabaseStorage";

const ratingCategories = [
  { key: "drink_quality", label: "Qualità Drink", icon: Wine, description: "Gusto, presentazione, tecnica" },
  { key: "staff_competence", label: "Competenza Staff", icon: Users, description: "Conoscenza, consigli, professionalità" },
  { key: "atmosphere", label: "Atmosfera", icon: Sparkles, description: "Ambiente, musica, design" },
  { key: "value_for_money", label: "Qualità/Prezzo", icon: Coins, description: "Rapporto tra qualità e costo" },
];

export default function AddReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedVenueId = urlParams.get('venue');
  
  const navigate = useNavigate();

  const [selectedVenue, setSelectedVenue] = useState(preselectedVenueId || "");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    visit_date: new Date().toISOString().split('T')[0],
    drink_quality: 0,
    staff_competence: 0,
    atmosphere: 0,
    value_for_money: 0,
    overall_rating: 0,
    drinks_ordered: [],
    photos: [],
    videos: [],
    highlights: [],
    improvements: [],
    would_recommend: true
  });
  
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [newDrink, setNewDrink] = useState({ name: "", category: "cocktail", rating: 8, notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewVenueForm, setShowNewVenueForm] = useState(false);
  const [isPendingVenue, setIsPendingVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({ 
    name: "", 
    city: "", 
    country: "", 
    address: "", 
    category: "cocktail_bar",
    phone: "",
    website: "",
    instagram: "",
    opening_hours: ""
  });

  const { getVenues, addReview, addVenue, user, isSupabaseConfigured } = useAppData();
  const venues = getVenues();

  if (!user || !user.role) {
    return <Navigate to={createPageUrl("Community")} replace />;
  }

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return addReview({ ...reviewData, venue_id: selectedVenue });
    },
    onSuccess: () => {
      setIsSubmitting(false);
      if (isPendingVenue) {
        toast({
          title: "Recensione e locale inviati!",
          description: "Saranno visibili dopo l'approvazione dell'amministratore.",
        });
        navigate(createPageUrl("Explore"));
      } else {
        navigate(createPageUrl(`VenueDetail?id=${selectedVenue}`));
      }
    },
    onError: () => {
      setIsSubmitting(false);
    }
  });

  const handlePasteContent = (e) => {
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const val = String(formData.content ?? "");
    const newVal = val.slice(0, start) + text + val.slice(end);
    setFormData((prev) => ({ ...prev, content: newVal }));
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
    }, 0);
  };

  const createVenueMutation = useMutation({
    mutationFn: async (venueData) => {
      const venueWithCoords = {
        name: venueData.name,
        description: venueData.description || "",
        city: venueData.city,
        country: venueData.country || "Italia",
        address: venueData.address,
        category: venueData.category || "cocktail_bar",
        price_range: venueData.price_range || "€€",
        phone: venueData.phone || "",
        website: venueData.website || "",
        instagram: venueData.instagram || "",
        opening_hours: venueData.opening_hours || "",
        latitude: venueData.latitude ?? null,
        longitude: venueData.longitude ?? null,
        cover_image: venueData.cover_image || "",
        verified: false,
        featured: false,
      };
      return addVenue(venueWithCoords);
    },
    onSuccess: (newVenueData) => {
      setSelectedVenue(newVenueData.id);
      setIsPendingVenue(!!newVenueData.pending);
      setShowNewVenueForm(false);
      setNewVenue({ 
        name: "", 
        city: "", 
        country: "", 
        address: "", 
        category: "cocktail_bar",
        phone: "",
        website: "",
        instagram: "",
        opening_hours: ""
      });
    },
  });

  // Calculate overall rating
  useEffect(() => {
    const ratings = [formData.drink_quality, formData.staff_competence, formData.atmosphere, formData.value_for_money];
    const validRatings = ratings.filter(r => r > 0);
    if (validRatings.length > 0) {
      const avg = validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
      setFormData(prev => ({ ...prev, overall_rating: Math.round(avg * 10) / 10 }));
    }
  }, [formData.drink_quality, formData.staff_competence, formData.atmosphere, formData.value_for_money]);

  const handleRatingChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors.rating) setErrors((p) => ({ ...p, rating: undefined }));
  };

  const addDrink = () => {
    if (newDrink.name) {
      setFormData(prev => ({
        ...prev,
        drinks_ordered: [...prev.drinks_ordered, { ...newDrink }]
      }));
      setNewDrink({ name: "", category: "cocktail", rating: 8, notes: "" });
    }
  };

  const removeDrink = (index) => {
    setFormData(prev => ({
      ...prev,
      drinks_ordered: prev.drinks_ordered.filter((_, i) => i !== index)
    }));
  };

  const addPhotoFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const images = files.filter((f) => (f.type || "").startsWith("image/"));
    const videos = files.filter((f) => (f.type || "").startsWith("video/"));
    setPhotoFiles((prev) => [...prev, ...images]);
    setVideoFiles((prev) => [...prev, ...videos]);
    e.target.value = "";
  };

  const removePhoto = (index, isFile) => {
    if (isFile) {
      setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData(prev => ({
        ...prev,
        photos: (prev.photos || []).filter((_, i) => i !== index)
      }));
    }
  };

  const addVideoFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const images = files.filter((f) => (f.type || "").startsWith("image/"));
    const videos = files.filter((f) => (f.type || "").startsWith("video/"));
    setPhotoFiles((prev) => [...prev, ...images]);
    setVideoFiles((prev) => [...prev, ...videos]);
    e.target.value = "";
  };

  const removeVideo = (index, isFile) => {
    if (isFile) {
      setVideoFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData(prev => ({
        ...prev,
        videos: (prev.videos || []).filter((_, i) => i !== index)
      }));
    }
  };

  const toggleHighlight = (item) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.includes(item)
        ? prev.highlights.filter(h => h !== item)
        : [...prev.highlights, item]
    }));
  };

  const toggleImprovement = (item) => {
    setFormData(prev => ({
      ...prev,
      improvements: prev.improvements.includes(item)
        ? prev.improvements.filter(i => i !== item)
        : [...prev.improvements, item]
    }));
  };

  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const next = {};
    if (!selectedVenue) next.venue = "Seleziona un locale.";
    if (!formData.overall_rating || formData.overall_rating <= 0) next.rating = "Inserisci almeno una valutazione (qualità drink, staff, atmosfera o qualità/prezzo).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if ((photoFiles.length > 0 || videoFiles.length > 0) && !isSupabaseConfigured?.()) {
      setErrors(prev => ({ ...prev, _form: "Per caricare foto e video è necessario che Supabase sia configurato." }));
      return;
    }
    setIsSubmitting(true);
    try {
      let photoUrls = [...(formData.photos || [])];
      let videoUrls = [...(formData.videos || [])];
      if (isSupabaseConfigured?.()) {
        const totalFiles = photoFiles.length + videoFiles.length;
        if (photoFiles.length > 0) {
          const urls = await uploadMultipleToSupabaseStorage(
            photoFiles,
            "reviews",
            (current, total) => setUploadProgress({ current: current, total: totalFiles })
          );
          photoUrls.push(...urls);
        }
        if (videoFiles.length > 0) {
          const urls = await uploadMultipleToSupabaseStorage(
            videoFiles,
            "reviews",
            (current, total) => setUploadProgress({ current: photoFiles.length + current, total: totalFiles })
          );
          videoUrls.push(...urls);
        }
        setUploadProgress({ current: 0, total: 0 });
      }
      const reviewData = {
        ...formData,
        photos: photoUrls,
        videos: videoUrls,
        venue_id: selectedVenue,
        author_name: user?.name || "Anonimo",
        author_avatar: user?.avatar
      };
      createReviewMutation.mutate(reviewData);
    } catch (err) {
      setErrors(prev => ({ ...prev, _form: err?.message || "Errore caricamento file" }));
      setIsSubmitting(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const isValid = selectedVenue && formData.overall_rating > 0;

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link 
            to={createPageUrl(preselectedVenueId ? `VenueDetail?id=${preselectedVenueId}` : "Explore")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Scrivi Recensione</h1>
            <p className="text-stone-500">Condividi la tua esperienza</p>
          </div>
        </div>

        <div className="space-y-8">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errors._form || "Correggi i campi indicati sotto prima di inviare."}
            </div>
          )}
          {/* Venue Selection */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <Label className="text-base font-medium mb-3 block">Seleziona Locale *</Label>

            {!showNewVenueForm ? (
              <>
                <Select
                  value={selectedVenue}
                  onValueChange={(v) => {
                    setSelectedVenue(v);
                    if (errors.venue) setErrors((p) => ({ ...p, venue: undefined }));
                  }}
                >
                  <SelectTrigger className={`h-12 bg-stone-800/50 border-stone-700 ${errors.venue ? "border-red-500/50" : ""}`}>
                    <SelectValue placeholder="Cerca e seleziona un locale..." />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
                    {venues.map(venue => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.venue && <p className="mt-1.5 text-sm text-red-400">{errors.venue}</p>}

                <button
                  type="button"
                  onClick={() => setShowNewVenueForm(true)}
                  className="mt-3 text-amber-500 hover:text-amber-400 text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi un nuovo locale
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-medium">Nuovo locale</span>
                  <button
                    type="button"
                    onClick={() => setShowNewVenueForm(false)}
                    className="text-stone-500 hover:text-stone-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <Input
                  placeholder="Nome del locale *"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />

                <Input
                  placeholder="Indirizzo completo *"
                  value={newVenue.address}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Città *"
                    value={newVenue.city}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                  <Input
                    placeholder="Paese *"
                    value={newVenue.country}
                    onChange={(e) => setNewVenue(prev => ({ ...prev, country: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>

                <Select 
                  value={newVenue.category} 
                  onValueChange={(v) => setNewVenue(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="bg-stone-800/50 border-stone-700">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    <SelectItem value="cocktail_bar">Cocktail Bar</SelectItem>
                    <SelectItem value="rum_bar">Rum Bar</SelectItem>
                    <SelectItem value="wine_bar">Wine Bar</SelectItem>
                    <SelectItem value="speakeasy">Speakeasy</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Telefono"
                  value={newVenue.phone}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />

                <Input
                  placeholder="Sito web"
                  value={newVenue.website}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, website: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />

                <Input
                  placeholder="Instagram (solo username)"
                  value={newVenue.instagram}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, instagram: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />

                <Input
                  placeholder="Orari di apertura"
                  value={newVenue.opening_hours}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, opening_hours: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />

                <Button
                  type="button"
                  onClick={() => createVenueMutation.mutate(newVenue)}
                  disabled={!newVenue.name || !newVenue.city || !newVenue.country || !newVenue.address || createVenueMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950"
                >
                  {createVenueMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    "Crea locale e continua"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Ratings */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <Label className="text-base font-medium mb-6 block">Valutazioni *</Label>
            
            <div className="space-y-6">
              {ratingCategories.map(({ key, label, icon: Icon, description }) => (
                <div key={key}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-stone-500">{description}</p>
                    </div>
                  </div>
                  <Select
                    value={formData[key] ? String(formData[key]) : ""}
                    onValueChange={(v) => handleRatingChange(key, parseFloat(v))}
                  >
                    <SelectTrigger className="bg-stone-800/50 border-stone-700">
                      <SelectValue placeholder="Seleziona un giudizio" />
                    </SelectTrigger>
                    <SelectContent>
                      {(ratingOptions[key] || []).map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          <span className="text-stone-500">{label}</span>
                          <span className="text-stone-100 font-medium"> › {opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Overall Rating Display */}
              {formData.overall_rating > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30"
                >
                  <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">{formData.overall_rating.toFixed(1)}</p>
                    <p className="text-sm text-stone-500">Valutazione complessiva</p>
                  </div>
                </motion.div>
              )}
              {errors.rating && <p className="mt-2 text-sm text-red-400">{errors.rating}</p>}
            </div>
          </div>

          {/* Review Text */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Titolo (opzionale)</Label>
                <Input
                  placeholder="Un titolo per la tua recensione..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Racconta la tua esperienza</Label>
                <Textarea
                  placeholder="Descrivi la tua visita: cosa hai ordinato, com'era l'atmosfera, cosa ti ha colpito..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  onPaste={handlePasteContent}
                  className="bg-stone-800/50 border-stone-700 min-h-[120px]"
                />
              </div>

              <div>
                <Label className="mb-2 block">Data della visita</Label>
                <Input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Foto e Video */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <Label className="text-base font-medium mb-4 block flex items-center gap-2">
              <Image className="w-5 h-5 text-amber-500" />
              Foto e video
            </Label>
            <p className="text-sm text-stone-500 mb-4">Carica foto e video dal cellulare (fotocamera o galleria)</p>
            {uploadProgress.total > 0 && (
              <div className="mb-4 space-y-1">
                <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
                </div>
                <p className="text-xs text-stone-500">Caricamento {uploadProgress.current}/{uploadProgress.total}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-stone-400 mb-2 block">Foto</Label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  id="review-photos-camera"
                  onChange={addPhotoFiles}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  id="review-photos-gallery"
                  onChange={addPhotoFiles}
                  multiple
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("review-photos-camera")?.click()}
                    className="bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700"
                  >
                    Scatta foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("review-photos-gallery")?.click()}
                    className="bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Galleria
                  </Button>
                </div>
                <p className="text-xs text-stone-500 mt-1">max 5MB per immagine</p>
                {(formData.photos?.length > 0 || photoFiles.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.photos?.map((url, i) => (
                      <div key={`url-${i}`} className="relative group">
                        <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg" onError={(e) => e.target.style.display = "none"} />
                        <button type="button" onClick={() => removePhoto(i, false)} className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {photoFiles.map((f, i) => (
                      <div key={`file-${i}`} className="relative group">
                        <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 object-cover rounded-lg" />
                        <button type="button" onClick={() => removePhoto(i, true)} className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-stone-400 mb-2 block flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video
                </Label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  id="review-videos-camera"
                  onChange={addVideoFiles}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*,video/*"
                  id="review-videos-gallery"
                  onChange={addVideoFiles}
                  multiple
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("review-videos-camera")?.click()}
                    className="bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700"
                  >
                    Registra video
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("review-videos-gallery")?.click()}
                    className="bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Galleria
                  </Button>
                </div>
                <p className="text-xs text-stone-500 mt-1">max 10MB per video</p>
                {(formData.videos?.length > 0 || videoFiles.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.videos?.map((url, i) => (
                      <div key={`url-${i}`} className="flex items-center gap-2 px-3 py-2 bg-stone-800/50 rounded-lg">
                        <Video className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-stone-400 truncate max-w-[180px]">{url}</span>
                        <button type="button" onClick={() => removeVideo(i, false)} className="p-1 hover:bg-stone-700 rounded">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {videoFiles.map((f, i) => (
                      <div key={`file-${i}`} className="flex items-center gap-2 px-3 py-2 bg-stone-800/50 rounded-lg">
                        <Video className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-stone-400 truncate max-w-[120px]">{f.name}</span>
                        <button type="button" onClick={() => removeVideo(i, true)} className="p-1 hover:bg-stone-700 rounded">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drinks Ordered */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <Label className="text-base font-medium mb-4 block flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-500" />
              Drink ordinati
            </Label>
            
            {formData.drinks_ordered.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.drinks_ordered.map((drink, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                    <div>
                      <p className="font-medium">{drink.name}</p>
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <span>{drink.category}</span>
                        <span>•</span>
                        <span className="text-amber-500">{drink.rating}/10</span>
                      </div>
                    </div>
                    <button onClick={() => removeDrink(i)} className="p-1 hover:bg-stone-700 rounded">
                      <X className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Nome drink..."
                value={newDrink.name}
                onChange={(e) => setNewDrink(prev => ({ ...prev, name: e.target.value }))}
                className="bg-stone-800/50 border-stone-700"
              />
              <Select 
                value={newDrink.category} 
                onValueChange={(v) => setNewDrink(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger className="bg-stone-800/50 border-stone-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800">
                  <SelectItem value="cocktail">Cocktail</SelectItem>
                  <SelectItem value="rum">Rum</SelectItem>
                  <SelectItem value="whisky">Whisky</SelectItem>
                  <SelectItem value="wine">Vino</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1">
                <p className="text-sm text-stone-500 mb-1">Voto: {newDrink.rating}/10</p>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newDrink.rating}
                  onChange={(e) => setNewDrink(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>
              <Button 
                onClick={addDrink}
                disabled={!newDrink.name}
                className="bg-stone-800 hover:bg-stone-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Highlights & Improvements */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block text-emerald-400">
                  ✓ Punti di forza
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-stone-800/50 border-stone-700 text-stone-300 hover:bg-stone-700/50"
                    >
                      {formData.highlights.length > 0
                        ? `${formData.highlights.length} selezionati`
                        : "Seleziona..."}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] bg-stone-900 border-stone-700 p-2 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {highlightOptions.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-800 cursor-pointer"
                        >
                          <Checkbox
                            checked={formData.highlights.includes(item)}
                            onCheckedChange={() => toggleHighlight(item)}
                          />
                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block text-orange-400">
                  ↗ Aree di miglioramento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-stone-800/50 border-stone-700 text-stone-300 hover:bg-stone-700/50"
                    >
                      {formData.improvements.length > 0
                        ? `${formData.improvements.length} selezionati`
                        : "Seleziona..."}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] bg-stone-900 border-stone-700 p-2 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {improvementOptions.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-800 cursor-pointer"
                        >
                          <Checkbox
                            checked={formData.improvements.includes(item)}
                            onCheckedChange={() => toggleImprovement(item)}
                          />
                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <Label className="text-base font-medium mb-4 block">Lo consiglieresti?</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData(prev => ({ ...prev, would_recommend: true }))}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                  formData.would_recommend
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-stone-800 text-stone-400 border border-stone-700"
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                Sì, lo consiglio
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, would_recommend: false }))}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                  !formData.would_recommend
                    ? "bg-stone-700 text-stone-300 border border-stone-600"
                    : "bg-stone-800 text-stone-400 border border-stone-700"
                }`}
              >
                Con riserva
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200/80">
            <p className="mb-2">
              <strong>Disclaimer:</strong> Dichiaro che questa recensione rappresenta la mia opinione personale e mi assumo la responsabilità di quanto scritto.
            </p>
            <p className="text-xs text-amber-200/60">
              Le opinioni espresse appartengono agli utenti e non al titolare del blog. Ci riserviamo il diritto di rimuovere commenti offensivi o diffamatori.
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-lg rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Pubblicazione...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Pubblica Recensione
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}