import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { ChevronLeft, Save, Loader2, Wine, Trash2 } from "lucide-react";
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

export default function EditDrink() {
  const urlParams = new URLSearchParams(window.location.search);
  const drinkId = urlParams.get("id");
  const navigate = useNavigate();
  const { getDrinkById, updateDrink, deleteDrink } = useAppData();
  const drink = getDrinkById(drinkId);

  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    brand: "",
    origin: "",
    description: "",
    image: "",
    abv: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (drink && drinkId) {
      setFormData({
        name: drink.name || "",
        category: (drink.category || "other").toLowerCase(),
        brand: drink.brand || "",
        origin: drink.origin || "",
        description: drink.description || "",
        image: drink.image || "",
        abv: drink.abv != null ? String(drink.abv) : "",
      });
    }
  }, [drinkId]);

  const updateDrinkMutation = useMutation({
    mutationFn: (data) =>
      updateDrink(drinkId, {
        ...data,
        abv: Number(data.abv) || 0,
      }),
    onSuccess: () => {
      setIsSubmitting(false);
      navigate(createPageUrl(`DrinkDetail?id=${drinkId}`));
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!formData.name?.trim()) return;
    setIsSubmitting(true);
    updateDrinkMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!drinkId || !drink) return;
    deleteDrink(drinkId);
    navigate(createPageUrl("Drinks"));
    setShowDeleteConfirm(false);
  };

  if (drinkId && !drink) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Wine className="w-16 h-16 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">Drink non trovato.</p>
          <Link to={createPageUrl("Drinks")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna al catalogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={createPageUrl("Drinks")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Modifica drink</h1>
            <p className="text-stone-500">{drink?.name}</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name?.trim() || isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-4"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salva"}
          </Button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Elimina drink"
            className="p-2 flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 rounded-2xl p-6 max-w-sm w-full border border-stone-800">
              <p className="mb-6 text-stone-200">Sei sicuro di voler eliminare questo drink?</p>
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

        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Nome *</Label>
            <Input
              placeholder="Nome del drink"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <div>
            <Label className="mb-2 block">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, category: v }))
              }
            >
              <SelectTrigger className="bg-stone-800/50 border-stone-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-800">
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Brand</Label>
              <Input
                placeholder="Marca"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                className="bg-stone-800/50 border-stone-700"
              />
            </div>
            <div>
              <Label className="mb-2 block">Origine</Label>
              <Input
                placeholder="Paese / regione"
                value={formData.origin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, origin: e.target.value }))
                }
                className="bg-stone-800/50 border-stone-700"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Gradazione (ABV %)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="40"
              value={formData.abv}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, abv: e.target.value }))
              }
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <div>
            <Label className="mb-2 block">Descrizione</Label>
            <Textarea
              placeholder="Descrizione del drink..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <div>
            <Label className="mb-2 block">Immagine (URL)</Label>
            <Input
              placeholder="https://..."
              value={formData.image}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image: e.target.value }))
              }
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!formData.name?.trim() || isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Salva modifiche
          </Button>
        </div>
      </div>
    </div>
  );
}
