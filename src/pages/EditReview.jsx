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
  Wine,
  Users,
  Sparkles,
  Coins,
  ThumbsUp,
  Send,
  Loader2
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
import { motion } from "framer-motion";

const ratingCategories = [
  { key: "drink_quality", label: "Qualità Drink", icon: Wine, description: "Gusto, presentazione, tecnica" },
  { key: "staff_competence", label: "Competenza Staff", icon: Users, description: "Conoscenza, consigli, professionalità" },
  { key: "atmosphere", label: "Atmosfera", icon: Sparkles, description: "Ambiente, musica, design" },
  { key: "value_for_money", label: "Qualità/Prezzo", icon: Coins, description: "Rapporto tra qualità e costo" },
];

const highlightOptions = [
  "Cocktail eccezionali",
  "Carta rum straordinaria",
  "Staff preparatissimo",
  "Atmosfera unica",
  "Ottimo rapporto Q/P",
  "Selezione vini top",
  "Ingredienti premium",
  "Location suggestiva"
];

const improvementOptions = [
  "Servizio lento",
  "Prezzi elevati",
  "Rumoroso",
  "Cocktail inconsistenti",
  "Poca varietà",
  "Difficile da trovare"
];

export default function EditReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const reviewId = urlParams.get('id');
  
  const navigate = useNavigate();
  const { getReviewById, updateReview } = useAppData();
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
    highlights: [],
    improvements: [],
    would_recommend: true
  });
  
  const [newDrink, setNewDrink] = useState({ name: "", category: "cocktail", rating: 8, notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (review) {
      setFormData({
        title: review.title || "",
        content: review.content || "",
        visit_date: review.visit_date || new Date().toISOString().split('T')[0],
        drink_quality: review.drink_quality || 0,
        staff_competence: review.staff_competence || 0,
        atmosphere: review.atmosphere || 0,
        value_for_money: review.value_for_money || 0,
        overall_rating: review.overall_rating || 0,
        drinks_ordered: review.drinks_ordered || [],
        photos: review.photos || [],
        highlights: review.highlights || [],
        improvements: review.improvements || [],
        would_recommend: review.would_recommend !== false
      });
    }
  }, [review]);

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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Modifica Recensione</h1>
            <p className="text-stone-500">Aggiorna la tua esperienza</p>
          </div>
        </div>

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
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRatingChange(key, i + 1)}
                        className={`flex-1 h-10 rounded-lg transition-all ${
                          i + 1 <= formData[key]
                            ? "bg-amber-500 hover:bg-amber-400"
                            : "bg-stone-800 hover:bg-stone-700"
                        }`}
                      >
                        <span className="text-xs font-medium">{i + 1}</span>
                      </button>
                    ))}
                  </div>
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
                <div className="flex flex-wrap gap-2">
                  {highlightOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleHighlight(item)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        formData.highlights.includes(item)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block text-orange-400">
                  ↗ Aree di miglioramento
                </Label>
                <div className="flex flex-wrap gap-2">
                  {improvementOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleImprovement(item)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        formData.improvements.includes(item)
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
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