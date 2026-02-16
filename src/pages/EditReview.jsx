/**
 * Modifica recensione – Supabase (reviews_cloud).
 * Nessun localStorage: updateReview/deleteReview su Supabase.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Trash2,
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
import { ratingOptions, getClosestValue } from "@/lib/reviewRatings";
import { highlightOptions, improvementOptions, migrateHighlights, migrateImprovements } from "@/lib/highlightsImprovements";

const ratingCategories = [
  { key: "drink_quality", label: "Qualità Drink", icon: Wine, description: "Gusto, presentazione, tecnica" },
  { key: "staff_competence", label: "Competenza Staff", icon: Users, description: "Conoscenza, consigli, professionalità" },
  { key: "atmosphere", label: "Atmosfera", icon: Sparkles, description: "Ambiente, musica, design" },
  { key: "value_for_money", label: "Qualità/Prezzo", icon: Coins, description: "Rapporto tra qualità e costo" },
];

export default function EditReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const reviewId = urlParams.get('id');
  
  const navigate = useNavigate();
  const { getReviewById, updateReview, deleteReview } = useAppData();
  const review = getReviewById(reviewId);

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
  
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newDrink, setNewDrink] = useState({ name: "", category: "cocktail", rating: 8, notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (review && reviewId) {
      setFormData({
        title: review.title || "",
        content: review.content || "",
        visit_date: review.visit_date || new Date().toISOString().split('T')[0],
        drink_quality: getClosestValue("drink_quality", review.drink_quality) || 0,
        staff_competence: getClosestValue("staff_competence", review.staff_competence) || 0,
        atmosphere: getClosestValue("atmosphere", review.atmosphere) || 0,
        value_for_money: getClosestValue("value_for_money", review.value_for_money) || 0,
        overall_rating: review.overall_rating || 0,
        drinks_ordered: review.drinks_ordered || [],
        photos: review.photos || [],
        videos: review.videos || [],
        highlights: migrateHighlights(review.highlights || []),
        improvements: migrateImprovements(review.improvements || []),
        would_recommend: review.would_recommend !== false
      });
    }
  }, [reviewId]);

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

  const updateReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return updateReview(reviewId, reviewData);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      navigate(createPageUrl(`VenueDetail?id=${review?.venue_id}`));
    },
    onError: () => {
      setIsSubmitting(false);
    }
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

  const addPhoto = () => {
    const url = (newPhotoUrl || "").trim();
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), url] }));
      setNewPhotoUrl("");
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const addVideo = () => {
    const url = (newVideoUrl || "").trim();
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), url] }));
      setNewVideoUrl("");
    }
  };

  const removeVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index)
    }));
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    updateReviewMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!reviewId || !review) return;
    deleteReview(reviewId);
    navigate(createPageUrl(`VenueDetail?id=${review.venue_id}`));
    setShowDeleteConfirm(false);
  };

  const isValid = formData.overall_rating > 0;

  if (reviewId && !review) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Star className="w-20 h-20 text-stone-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Recensione non trovata</h2>
          <p className="text-stone-500 mb-6">La recensione che stai cercando non esiste.</p>
          <Link to={createPageUrl("Profile")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna al profilo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link 
            to={createPageUrl(`VenueDetail?id=${review.venue_id}`)}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Modifica Recensione</h1>
            <p className="text-stone-500">Aggiorna la tua esperienza</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Elimina recensione"
            className="p-2 flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 rounded-2xl p-6 max-w-sm w-full border border-stone-800">
              <p className="mb-6 text-stone-200">Sei sicuro di voler eliminare questa recensione?</p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-stone-600 text-stone-400 hover:bg-stone-800"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Elimina
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
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
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-stone-400 mb-2 block">Foto (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="bg-stone-800/50 border-stone-700 flex-1"
                  />
                  <Button type="button" onClick={addPhoto} disabled={!newPhotoUrl?.trim()} className="bg-stone-800 hover:bg-stone-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.photos?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.photos.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="h-16 w-16 object-cover rounded-lg" onError={(e) => e.target.style.display = "none"} />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                  Video (URL)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://youtube.com/... o https://..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="bg-stone-800/50 border-stone-700 flex-1"
                  />
                  <Button type="button" onClick={addVideo} disabled={!newVideoUrl?.trim()} className="bg-stone-800 hover:bg-stone-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.videos?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.videos.map((url, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-stone-800/50 rounded-lg">
                        <Video className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-stone-400 truncate max-w-[180px]">{url}</span>
                        <button type="button" onClick={() => removeVideo(i)} className="p-1 hover:bg-stone-700 rounded">
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

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-lg rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Salva Modifiche
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}