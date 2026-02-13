import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { 
  ChevronLeft, 
  Wine,
  MapPin,
  Flame,
  Send,
  Loader2,
  Plus,
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

const categories = [
  { value: "cocktail", label: "Cocktail" },
  { value: "rum", label: "Rum" },
  { value: "whisky", label: "Whisky" },
  { value: "gin", label: "Gin" },
  { value: "vodka", label: "Vodka" },
  { value: "tequila", label: "Tequila" },
  { value: "mezcal", label: "Mezcal" },
  { value: "brandy", label: "Brandy" },
  { value: "cognac", label: "Cognac" },
  { value: "wine", label: "Vino" },
  { value: "champagne", label: "Champagne" },
  { value: "beer", label: "Birra" },
  { value: "amaro", label: "Amaro" },
  { value: "vermouth", label: "Vermouth" },
  { value: "other", label: "Altro" },
];

const flavorOptions = [
  "Vaniglia", "Caramello", "Spezie", "Agrumi", "Frutta tropicale",
  "Miele", "Legno", "Fumo", "Erbe", "Floreale", "Cioccolato",
  "Mandorla", "Caffè", "Pepe", "Zenzero", "Menta"
];

export default function AddDrink() {
  const navigate = useNavigate();
  const { addDrink } = useAppData();
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    brand: "",
    origin: "",
    description: "",
    image: "",
    abv: null,
    age: "",
    tasting_notes: {
      nose: "",
      palate: "",
      finish: ""
    },
    flavor_profile: [],
    cocktail_recipe: {
      ingredients: [],
      method: "",
      glass: "",
      garnish: ""
    }
  });

  const [newIngredient, setNewIngredient] = useState({ name: "", amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const createDrinkMutation = useMutation({
    mutationFn: (drinkData) => addDrink(drinkData),
    onSuccess: (data) => {
      navigate(createPageUrl(`DrinkDetail?id=${data.id}`));
    },
  });

  const toggleFlavor = (flavor) => {
    setFormData(prev => ({
      ...prev,
      flavor_profile: prev.flavor_profile.includes(flavor)
        ? prev.flavor_profile.filter(f => f !== flavor)
        : [...prev.flavor_profile, flavor]
    }));
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      setFormData(prev => ({
        ...prev,
        cocktail_recipe: {
          ...prev.cocktail_recipe,
          ingredients: [...prev.cocktail_recipe.ingredients, { ...newIngredient }]
        }
      }));
      setNewIngredient({ name: "", amount: "" });
    }
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      cocktail_recipe: {
        ...prev.cocktail_recipe,
        ingredients: prev.cocktail_recipe.ingredients.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    const next = {};
    if (!formData.name?.trim()) next.name = "Inserisci il nome del drink.";
    if (!formData.category) next.category = "Seleziona una categoria.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    createDrinkMutation.mutate({
      ...formData,
      rating_count: 0
    });
  };

  const isValid = formData.name && formData.category;
  const isCocktail = formData.category === 'cocktail';

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link 
            to={createPageUrl("Drinks")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Aggiungi Drink</h1>
            <p className="text-stone-500">Arricchisci il nostro catalogo</p>
          </div>
        </div>

        <div className="space-y-6">
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

            {Object.keys(errors).length > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                Correggi i campi indicati sotto prima di inviare.
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Nome *</Label>
                <Input
                  placeholder="Es. Negroni, Diplomatico Reserva Exclusiva..."
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`bg-stone-800/50 border-stone-700 ${errors.name ? "border-red-500/50" : ""}`}
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => {
                      setFormData(prev => ({ ...prev, category: v }));
                      if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
                    }}
                  >
                    <SelectTrigger className={`bg-stone-800/50 border-stone-700 ${errors.category ? "border-red-500/50" : ""}`}>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-800 [&_span]:text-stone-100 [&_[role='option']]:text-stone-100">
                       {categories.map(cat => (
                         <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                  {errors.category && <p className="mt-1.5 text-sm text-red-400">{errors.category}</p>}
                </div>

                <div>
                  <Label className="mb-2 block">Sottocategoria</Label>
                  <Input
                    placeholder="Es. Single Malt, Agricolo..."
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Marca/Produttore</Label>
                  <Input
                    placeholder="Es. Diplomatico, Campari..."
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>

                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    Origine
                  </Label>
                  <Input
                    placeholder="Es. Venezuela, Scozia..."
                    value={formData.origin}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <Flame className="w-4 h-4 text-stone-500" />
                    ABV %
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="40"
                    value={formData.abv || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, abv: parseFloat(e.target.value) || null }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Invecchiamento</Label>
                  <Input
                    placeholder="Es. 12 anni, NAS..."
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Descrizione</Label>
                <Textarea
                  placeholder="Descrivi il drink: storia, produzione, caratteristiche..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700 min-h-[100px]"
                />
              </div>

              <div>
                <Label className="mb-2 block">Immagine (URL)</Label>
                <Input
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Flavor Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Profilo Aromatico</h2>
            <div className="flex flex-wrap gap-2">
              {flavorOptions.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => toggleFlavor(flavor)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.flavor_profile.includes(flavor)
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600"
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tasting Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Note di Degustazione</h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Naso</Label>
                <Input
                  placeholder="Aromi percepiti al naso..."
                  value={formData.tasting_notes.nose}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tasting_notes: { ...prev.tasting_notes, nose: e.target.value }
                  }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
              <div>
                <Label className="mb-2 block">Palato</Label>
                <Input
                  placeholder="Sapori percepiti in bocca..."
                  value={formData.tasting_notes.palate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tasting_notes: { ...prev.tasting_notes, palate: e.target.value }
                  }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
              <div>
                <Label className="mb-2 block">Finale</Label>
                <Input
                  placeholder="Persistenza e retrogusto..."
                  value={formData.tasting_notes.finish}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tasting_notes: { ...prev.tasting_notes, finish: e.target.value }
                  }))}
                  className="bg-stone-800/50 border-stone-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Cocktail Recipe (only if category is cocktail) */}
          {isCocktail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Ricetta Cocktail</h2>
              
              <div className="space-y-4">
                {/* Ingredients */}
                <div>
                  <Label className="mb-2 block">Ingredienti</Label>
                  
                  {formData.cocktail_recipe.ingredients.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.cocktail_recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-stone-800/50 rounded-lg">
                          <span>{ing.amount} {ing.name}</span>
                          <button onClick={() => removeIngredient(i)}>
                            <X className="w-4 h-4 text-stone-500 hover:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Quantità (es. 45ml)"
                      value={newIngredient.amount}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, amount: e.target.value }))}
                      className="bg-stone-800/50 border-stone-700 w-32"
                    />
                    <Input
                      placeholder="Ingrediente"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-stone-800/50 border-stone-700 flex-1"
                    />
                    <Button onClick={addIngredient} className="bg-stone-800 hover:bg-stone-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Metodo</Label>
                  <Textarea
                    placeholder="Descrivi come preparare il cocktail..."
                    value={formData.cocktail_recipe.method}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cocktail_recipe: { ...prev.cocktail_recipe, method: e.target.value }
                    }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Bicchiere</Label>
                    <Input
                      placeholder="Es. Coupette, Old Fashioned..."
                      value={formData.cocktail_recipe.glass}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cocktail_recipe: { ...prev.cocktail_recipe, glass: e.target.value }
                      }))}
                      className="bg-stone-800/50 border-stone-700"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Guarnizione</Label>
                    <Input
                      placeholder="Es. Twist di arancia..."
                      value={formData.cocktail_recipe.garnish}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cocktail_recipe: { ...prev.cocktail_recipe, garnish: e.target.value }
                      }))}
                      className="bg-stone-800/50 border-stone-700"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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
                Aggiungi Drink
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}