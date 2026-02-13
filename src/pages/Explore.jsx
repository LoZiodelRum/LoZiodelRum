import { useState } from "react";
import { Wine, List, Grid3X3, GlassWater, Plus } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VenueCard from "@/components/venue/VenueCard";
import VenueFilters from "@/components/venue/VenueFilters";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Explore() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  const initialCity = urlParams.get('city') || '';

  const [filters, setFilters] = useState({
    search: "",
    category: initialCategory,
    city: initialCity,
    priceRange: "all",
    verified: false,
    sortBy: "rating"
  });

  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("venues");

  const { getVenues, getDrinks } = useAppData();
  const venues = [...getVenues()].sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
  const isLoading = false;
  const drinks = getDrinks();
  const drinksLoading = false;

  // Get unique cities
  const cities = [...new Set(venues.map(v => v.city).filter(Boolean))].sort();

  // Filter venues
  const filteredVenues = venues.filter(venue => {
    const searchMatch = !filters.search || 
      venue.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      venue.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
      venue.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const venueCategories = venue.categories || (venue.category ? [venue.category] : []);
    const categoryMatch = filters.category === "all" || venueCategories.includes(filters.category);
    const cityMatch = !filters.city || venue.city === filters.city;
    const priceMatch = filters.priceRange === "all" || venue.price_range === filters.priceRange;
    const verifiedMatch = !filters.verified || venue.verified;
    const approvalMatch = !venue.pending_approval;

    return searchMatch && categoryMatch && cityMatch && priceMatch && verifiedMatch && approvalMatch;
  });

  // Filter drinks
  const filteredDrinks = drinks.filter(drink => {
    const searchMatch = !filters.search || 
      drink.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      drink.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
      drink.origin?.toLowerCase().includes(filters.search.toLowerCase());
    
    return searchMatch;
  });

  // Sort venues
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    switch (filters.sortBy) {
      case "rating":
        return (b.overall_rating || 0) - (a.overall_rating || 0);
      case "reviews":
        return (b.review_count || 0) - (a.review_count || 0);
      case "newest":
        return new Date(b.created_date) - new Date(a.created_date);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-6 pt-8 pb-28 lg:pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Esplora</h1>
          <p className="text-stone-500">
            Scopri locali e drink d'eccellenza
          </p>
        </div>

        {/* Tabs + Aggiungi locale */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 bg-stone-900/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("venues")}
              className={`px-6 py-2 rounded-lg transition-all font-medium ${
                activeTab === "venues"
                  ? "bg-stone-800 text-amber-400"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Locali ({sortedVenues.length})
            </button>
            <button
              onClick={() => setActiveTab("drinks")}
              className={`px-6 py-2 rounded-lg transition-all font-medium ${
                activeTab === "drinks"
                  ? "bg-stone-800 text-amber-400"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Drink ({filteredDrinks.length})
            </button>
          </div>
          <Link to={createPageUrl("AddVenue")}>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 h-9 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi un locale
            </Button>
          </Link>
        </div>

        {/* Content based on active tab */}
        {activeTab === "venues" ? (
          <>
            {/* Filters */}
            <div className="mb-8">
              <VenueFilters 
                filters={filters} 
                onFilterChange={setFilters}
                cities={cities}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 bg-stone-900/50 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" 
                      ? "bg-stone-800 text-amber-400" 
                      : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list" 
                      ? "bg-stone-800 text-amber-400" 
                      : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-stone-900/50 rounded-2xl overflow-hidden">
                <Skeleton className="h-52 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedVenues.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1 max-w-3xl"
          }`}>
            {sortedVenues.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Wine className="w-20 h-20 text-stone-800 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-stone-300 mb-2">
              Nessun locale trovato
            </h3>
            <p className="text-stone-500 max-w-md mx-auto">
              Prova a modificare i filtri o la ricerca per trovare altri risultati.
            </p>
            <Button 
              className="mt-6 bg-amber-500 hover:bg-amber-600 text-stone-950"
              onClick={() => setFilters({
                search: "",
                category: "all",
                city: "",
                priceRange: "all",
                verified: false,
                sortBy: "rating"
              })}
            >
              Cancella filtri
            </Button>
          </motion.div>
        )}
          </>
        ) : (
          <>
            {/* Drinks Grid */}
            {drinksLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : filteredDrinks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrinks.map((drink, i) => (
                  <Link key={drink.id} to={createPageUrl(`DrinkDetail?id=${drink.id}`)}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-stone-900/50 rounded-2xl border border-stone-800/50 hover:border-amber-500/30 p-4 transition-all group"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-28 rounded-xl bg-stone-800/50 overflow-hidden flex-shrink-0">
                          {drink.image ? (
                            <img src={drink.image} alt={drink.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              🥃
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold group-hover:text-amber-400 transition-colors">
                            {drink.name}
                          </h3>
                          {drink.brand && (
                            <p className="text-sm text-stone-500">{drink.brand}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {drink.category && (
                              <Badge variant="outline" className="border-stone-700 text-stone-500 text-xs">
                                {drink.category}
                              </Badge>
                            )}
                            {drink.origin && (
                              <Badge variant="outline" className="border-stone-700 text-stone-500 text-xs">
                                {drink.origin}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <GlassWater className="w-20 h-20 text-stone-800 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-stone-300 mb-2">
                  Nessun drink trovato
                </h3>
                <p className="text-stone-500">
                  Prova a modificare la ricerca.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}