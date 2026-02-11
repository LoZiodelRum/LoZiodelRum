import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  TrendingUp, 
  Wine,
  Sparkles,
  ChevronRight,
  Settings,
  Save,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VenueCard from "@/components/venue/VenueCard";
import ReviewCard from "@/components/review/ReviewCard";
import { useAppData } from "@/lib/AppDataContext";
import { motion } from "framer-motion";

const featuredCities = [
  { name: "Milano", image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=400", count: 45 },
  { name: "Roma", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400", count: 38 },
  { name: "Firenze", image: "https://images.unsplash.com/photo-1748641172448-e33ba1d0390b?w=400", count: 22 },
  { name: "Napoli", image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400", count: 18 },
  { name: "Torino", image: "https://images.unsplash.com/photo-1746788151344-5b602982710e?w=400", count: 15 },
  { name: "Bologna", image: "https://images.unsplash.com/photo-1682369551300-8901c39f2487?w=400", count: 12 },
];

const categories = [
  { name: "Cocktail Bar", value: "cocktail_bar", icon: "🍸" },
  { name: "Rum Bar", value: "rum_bar", icon: "🥃" },
  { name: "Wine Bar", value: "wine_bar", icon: "🍷" },
  { name: "Speakeasy", value: "speakeasy", icon: "🚪" }
];

export default function Home() {
  const [editMode, setEditMode] = useState(false);
  const [heroSettings, setHeroSettings] = useState(() => {
    const saved = localStorage.getItem('heroSettings');
    return saved ? JSON.parse(saved) : {
      text1: "Scopri i migliori",
      text2: "locali del mondo",
      text1Size: 72,
      text2Size: 72,
      text1Color: "#ffffff",
      text2Color: "#f59e0b"
    };
  });

  const { getVenues, getReviews, getArticles, user: currentUser } = useAppData();
  const venuesList = getVenues();
  const reviewsList = getReviews();
  const articlesList = getArticles();

  const featuredVenues = venuesList.filter((v) => v.featured).sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0)).slice(0, 6);
  const loadingVenues = false;

  const recentReviews = [...reviewsList].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 4);
  const loadingReviews = false;

  const getVenueForReview = (venueId) => venuesList.find((v) => v.id === venueId);

  const recentArticles = [...articlesList].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6);
  const loadingArticles = false;

  const saveSettings = () => {
    localStorage.setItem('heroSettings', JSON.stringify(heroSettings));
    setEditMode(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen home-page-root">
      {/* Hero Section: su mobile .home-page-root in index.css abbassa tutto */}
      <section className="relative h-[70vh] lg:h-[80vh] flex items-start lg:items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920"
            alt="Bar atmosphere"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/50 to-stone-950" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {isAdmin && !editMode && (
            <div className="fixed top-20 right-4 sm:top-24 sm:right-6 z-50">
              <Button
                onClick={() => setEditMode(true)}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold shadow-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Modifica Hero
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
              La community del bere consapevole
            </span>
            
            <h1 className="font-bold leading-[1.1] space-y-2 text-balance">
              <span 
                className="block max-w-[100vw] break-words"
                style={{ 
                  color: heroSettings.text1Color,
                  fontSize: `clamp(1.5rem, 5vw, ${heroSettings.text1Size}px)`
                }}
              >
                {heroSettings.text1}
              </span>
              <span 
                className="block gradient-text max-w-[100vw] break-words"
                style={{ 
                  fontSize: `clamp(1.5rem, 5vw, ${heroSettings.text2Size}px)`
                }}
              >
                {heroSettings.text2}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Recensioni autentiche, esperienze uniche, cultura del bere. 
              Trova cocktail bar, rum bar e locali d'eccellenza nella tua città.
            </p>

            <div className="home-hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center pt-4">
              <Link to={createPageUrl("Explore")}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-8 h-14 rounded-xl text-base shadow-lg shadow-amber-500/25">
                  Esplora Locali
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("Map")}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-8 h-14 rounded-xl text-base shadow-lg shadow-amber-500/25">
                  <MapPin className="w-5 h-5 mr-2" />
                  Vedi Mappa
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Editor Panel */}
          {editMode && isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-20 right-6 w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="bg-stone-800 px-5 py-4 border-b border-stone-700 flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-400">Editor Hero</h3>
                <Button
                  onClick={() => setEditMode(false)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-stone-400 hover:text-stone-100"
                >
                  ✕
                </Button>
              </div>
              
              <div className="p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-4">
                  <Label className="text-stone-300 text-xs font-semibold uppercase">Prima Riga</Label>
                  <Input
                    value={heroSettings.text1}
                    onChange={(e) => setHeroSettings({...heroSettings, text1: e.target.value})}
                    className="bg-stone-800 border-stone-600 h-9 text-sm"
                    placeholder="Testo prima riga"
                  />
                  <div>
                    <div className="flex justify-between text-xs text-stone-400 mb-2">
                      <span>Dimensione</span>
                      <span className="font-medium text-amber-400">{heroSettings.text1Size}px</span>
                    </div>
                    <Slider
                      value={[heroSettings.text1Size]}
                      onValueChange={(val) => setHeroSettings({...heroSettings, text1Size: val[0]})}
                      min={24}
                      max={96}
                      step={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={heroSettings.text1Color}
                      onChange={(e) => setHeroSettings({...heroSettings, text1Color: e.target.value})}
                      className="w-12 h-9 p-1 bg-stone-800 border-stone-600 cursor-pointer"
                    />
                    <Input
                      value={heroSettings.text1Color}
                      onChange={(e) => setHeroSettings({...heroSettings, text1Color: e.target.value})}
                      className="flex-1 bg-stone-800 border-stone-600 h-9 text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="border-t border-stone-700"></div>

                <div className="space-y-4">
                  <Label className="text-stone-300 text-xs font-semibold uppercase">Seconda Riga</Label>
                  <Input
                    value={heroSettings.text2}
                    onChange={(e) => setHeroSettings({...heroSettings, text2: e.target.value})}
                    className="bg-stone-800 border-stone-600 h-9 text-sm"
                    placeholder="Testo seconda riga"
                  />
                  <div>
                    <div className="flex justify-between text-xs text-stone-400 mb-2">
                      <span>Dimensione</span>
                      <span className="font-medium text-amber-400">{heroSettings.text2Size}px</span>
                    </div>
                    <Slider
                      value={[heroSettings.text2Size]}
                      onValueChange={(val) => setHeroSettings({...heroSettings, text2Size: val[0]})}
                      min={24}
                      max={96}
                      step={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={heroSettings.text2Color}
                      onChange={(e) => setHeroSettings({...heroSettings, text2Color: e.target.value})}
                      className="w-12 h-9 p-1 bg-stone-800 border-stone-600 cursor-pointer"
                    />
                    <Input
                      value={heroSettings.text2Color}
                      onChange={(e) => setHeroSettings({...heroSettings, text2Color: e.target.value})}
                      className="flex-1 bg-stone-800 border-stone-600 h-9 text-sm"
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>

                <Button
                  onClick={saveSettings}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold h-10 text-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salva Modifiche
                </Button>
              </div>

            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-stone-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Esplora per categoria</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={createPageUrl(`Explore?category=${cat.value}`)}
                  className="group flex flex-col items-center p-6 bg-stone-900/50 rounded-2xl border border-stone-800/50 hover:border-amber-500/30 hover:bg-stone-800/50 transition-all"
                >
                  <span className="text-4xl mb-3">{cat.icon}</span>
                  <span className="font-medium text-stone-300 group-hover:text-amber-400 transition-colors text-center">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-16 px-6 bg-stone-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Star className="w-7 h-7 text-amber-500" />
                Locali in Evidenza
              </h2>
              <p className="text-stone-500 mt-1">Selezionati dalla nostra redazione</p>
            </div>
            <Link 
              to={createPageUrl("Explore")}
              className="hidden md:flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium"
            >
              Vedi tutti
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {loadingVenues ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative h-40 rounded-2xl overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : featuredVenues.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredVenues.map((venue, i) => (
                <VenueCard key={venue.id} venue={venue} index={i} compact={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-900/30 rounded-2xl">
              <Wine className="w-16 h-16 text-stone-700 mx-auto mb-4" />
              <p className="text-stone-500">Nessun locale in evidenza al momento</p>
              <Link to={createPageUrl("AddVenue")}>
                <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-stone-950">
                  Aggiungi il primo locale
                </Button>
              </Link>
            </div>
          )}

          <Link 
            to={createPageUrl("Explore")}
            className="md:hidden flex items-center justify-center gap-2 text-amber-500 mt-6 font-medium"
          >
            Vedi tutti i locali
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-amber-500" />
                Ultimi Articoli
              </h2>
              <p className="text-stone-500 mt-1">Dal nostro magazine</p>
            </div>
            <Link 
              to={createPageUrl("Magazine")}
              className="hidden md:flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium"
            >
              Vedi tutti
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {loadingArticles ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative h-40 rounded-2xl overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={createPageUrl(`ArticleDetail?id=${article.id}`)}
                    className="group relative h-40 rounded-2xl overflow-hidden block"
                  >
                    <img 
                      src={article.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">{article.title}</h3>
                      <p className="text-stone-400 text-xs mt-1">
                        {new Date(article.created_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-900/30 rounded-2xl">
              <BookOpen className="w-16 h-16 text-stone-700 mx-auto mb-4" />
              <p className="text-stone-500">Nessun articolo ancora</p>
            </div>
          )}

          <Link 
            to={createPageUrl("Magazine")}
            className="md:hidden flex items-center justify-center gap-2 text-amber-500 mt-6 font-medium"
          >
            Vedi tutti gli articoli
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16 px-6 bg-stone-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-amber-500" />
                Ultime Recensioni
              </h2>
              <p className="text-stone-500 mt-1">Dalla community</p>
            </div>
            <Link 
              to={createPageUrl("Community")}
              className="hidden md:flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium"
            >
              Vedi tutte
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {loadingReviews ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative h-40 rounded-2xl overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : recentReviews.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentReviews.map((review, i) => {
                const venue = getVenueForReview(review.venue_id);
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      to={createPageUrl(`VenueDetail?id=${review.venue_id}`)}
                      className="group relative h-40 rounded-2xl overflow-hidden block"
                    >
                      <img 
                        src={venue?.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"} 
                        alt={venue?.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 fill-amber-950 text-amber-950" />
                        <span className="font-bold text-amber-950 text-xs">
                          {review.overall_rating}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">
                          {venue?.name || "Locale"}
                        </h3>
                        <p className="text-stone-400 text-xs mt-1">
                          {review.author_name || "Anonimo"} • {new Date(review.created_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-stone-900/30 rounded-2xl">
              <Star className="w-16 h-16 text-stone-700 mx-auto mb-4" />
              <p className="text-stone-500">Nessuna recensione ancora</p>
              <Link to={createPageUrl("AddReview")}>
                <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-stone-950">
                  Scrivi la prima recensione
                </Button>
              </Link>
            </div>
          )}

          <Link 
            to={createPageUrl("Community")}
            className="md:hidden flex items-center justify-center gap-2 text-amber-500 mt-6 font-medium"
          >
            Vedi tutte le recensioni
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Unisciti alla community
          </h2>
          <p className="text-stone-400 text-lg mb-8 max-w-2xl mx-auto">
            Condividi le tue esperienze, scopri nuovi locali e contribuisci 
            alla cultura del bere consapevole.
          </p>
          <Link to={createPageUrl("AddReview")}>
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-8 h-12 rounded-xl">
              Inizia a Recensire
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}