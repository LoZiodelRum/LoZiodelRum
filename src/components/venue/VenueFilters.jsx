import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const categories = [
  { value: "all", label: "Tutte le categorie" },
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
  { value: "all", label: "Tutti i prezzi" },
  { value: "€", label: "€" },
  { value: "€€", label: "€€" },
  { value: "€€€", label: "€€€" },
  { value: "€€€€", label: "€€€€" }
];

export default function VenueFilters({ filters, onFilterChange, cities = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeCount = [
    filters.category !== "all",
    filters.city,
    filters.priceRange !== "all",
    filters.verified
  ].filter(Boolean).length;

  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "all",
      city: "",
      priceRange: "all",
      verified: false,
      sortBy: "rating"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            placeholder="Cerca locali, città..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-12 h-12 bg-stone-900/50 border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-xl"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 px-4 bg-stone-900/50 border border-stone-800 hover:bg-stone-800 rounded-xl text-stone-300">
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filtri
              {activeCount > 0 && (
                <Badge className="ml-2 bg-amber-500 text-stone-950 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs font-bold">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-stone-950 border-stone-800">
            <SheetHeader>
              <SheetTitle className="text-stone-100">Filtri</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-400">Città</label>
                <Select value={filters.city || "all"} onValueChange={(v) => updateFilter("city", v === "all" ? "" : v)}>
                  <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-300">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    <SelectItem value="all">Tutte</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-400">Categoria</label>
                <Select value={filters.category} onValueChange={(v) => updateFilter("category", v)}>
                  <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-300">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-400">Prezzo</label>
                <Select value={filters.priceRange} onValueChange={(v) => updateFilter("priceRange", v)}>
                  <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-300">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    {priceRanges.map(price => (
                      <SelectItem key={price.value} value={price.value}>{price.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-400">Ordina per</label>
                <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                  <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-300">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-800">
                    <SelectItem value="rating">Valutazione</SelectItem>
                    <SelectItem value="reviews">Più recensiti</SelectItem>
                    <SelectItem value="newest">Recenti</SelectItem>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-stone-900/50 rounded-lg border border-stone-800">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => updateFilter("verified", e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label className="text-sm text-stone-300 cursor-pointer">Solo verificati</label>
              </div>

              {activeCount > 0 && (
                <Button 
                  onClick={clearFilters}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  Cancella filtri
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.city && (
            <Badge className="bg-stone-800 text-stone-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {filters.city}
              <X className="w-3 h-3 cursor-pointer hover:text-stone-100" onClick={() => updateFilter("city", "")} />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge className="bg-stone-800 text-stone-300">
              {categories.find(c => c.value === filters.category)?.label}
              <X className="w-3 h-3 ml-1 cursor-pointer hover:text-stone-100" onClick={() => updateFilter("category", "all")} />
            </Badge>
          )}
          {filters.priceRange !== "all" && (
            <Badge className="bg-stone-800 text-stone-300">
              {filters.priceRange}
              <X className="w-3 h-3 ml-1 cursor-pointer hover:text-stone-100" onClick={() => updateFilter("priceRange", "all")} />
            </Badge>
          )}
          {filters.verified && (
            <Badge className="bg-stone-800 text-stone-300">
              Verificati
              <X className="w-3 h-3 ml-1 cursor-pointer hover:text-stone-100" onClick={() => updateFilter("verified", false)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}