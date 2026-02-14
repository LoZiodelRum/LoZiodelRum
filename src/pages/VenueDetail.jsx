import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  Instagram,
  ExternalLink,
  BookmarkPlus,
  Share2,
  Wine,
  Users,
  Sparkles,
  BadgeCheck,
  ChevronLeft,
  PenLine,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCard from "@/components/review/ReviewCard";
import RatingStars from "@/components/ui/RatingStars";
import { getLabelForValue, avgKeyToOptionKey } from "@/lib/reviewRatings";
import { motion } from "framer-motion";

const categoryLabels = {
  cocktail_bar: "Cocktail Bar",
  rum_bar: "Rum Bar",
  wine_bar: "Wine Bar",
  speakeasy: "Speakeasy",
  distillery: "Distilleria",
  enoteca: "Enoteca",
  pub: "Pub",
  rooftop: "Rooftop Bar",
  hotel_bar: "Hotel Bar"
};

const ratingCategories = [
  { key: "avg_drink_quality", label: "Qualità Drink", icon: Wine },
  { key: "avg_staff_competence", label: "Competenza Staff", icon: Users },
  { key: "avg_atmosphere", label: "Atmosfera", icon: Sparkles },
  { key: "avg_value", label: "Qualità/Prezzo", icon: Star },
];

export default function VenueDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const venueId = urlParams.get('id');

  const { getVenueById, getReviewsByVenueId, user: currentUser } = useAppData();
  const venue = venueId ? getVenueById(venueId) : null;
  const reviews = venueId ? getReviewsByVenueId(venueId) : [];
  const loadingVenue = false;
  const loadingReviews = false;

  if (loadingVenue) {
    return (
      <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-[40vh] w-full rounded-2xl mb-8" />
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Wine className="w-20 h-20 text-stone-700 mx-auto mb-6" />
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
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh]">
        <img
          src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920"}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
        
        {/* Back Button - sotto l'header su mobile e desktop */}
        <Link 
          to={createPageUrl("Explore")}
          className="absolute top-20 left-4 lg:top-24 flex items-center gap-2 px-3 py-2 bg-stone-950/50 backdrop-blur-sm rounded-xl text-stone-200 hover:bg-stone-950/70 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Indietro</span>
        </Link>

        {/* Actions */}
        <div className="absolute top-20 right-4 lg:top-24 flex gap-2 z-10">
          {currentUser?.role === 'admin' && (
            <Link to={createPageUrl(`EditVenue?id=${venueId}`)}>
              <Button size="icon" variant="secondary" className="bg-amber-500/90 backdrop-blur-sm hover:bg-amber-500 border-0 text-stone-950">
                <Edit className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <Button size="icon" variant="secondary" className="bg-stone-950/50 backdrop-blur-sm hover:bg-stone-950/70 border-0">
            <BookmarkPlus className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-stone-950/50 backdrop-blur-sm hover:bg-stone-950/70 border-0">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          {venue.featured && (
            <Badge className="bg-amber-500 text-stone-950 border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              In Evidenza
            </Badge>
          )}
          {venue.verified && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-sm">
              <BadgeCheck className="w-3 h-3 mr-1" />
              Verificato
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-20 relative z-10 pb-28 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/80 backdrop-blur-xl rounded-3xl border border-stone-800/50 p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(venue.categories || [venue.category]).filter(Boolean).map((cat, i) => (
                  <Badge key={i} className="bg-stone-800 text-stone-300 border-stone-700">
                    {categoryLabels[cat] || cat}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{venue.name}</h1>
              <div className="flex items-center gap-2 text-stone-400">
                <MapPin className="w-4 h-4" />
                <span>{venue.address || `${venue.city}, ${venue.country}`}</span>
              </div>
            </div>

            {/* Box valutazione e numero recensioni (0 se nessuna, aggiornato con nuove recensioni) */}
            <div className="flex items-center gap-4 bg-stone-800/50 px-5 py-3 rounded-2xl">
              {reviews.length > 0 && venue.overall_rating ? (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-400">
                      {venue.overall_rating.toFixed(1)}
                    </div>
                    <RatingStars rating={venue.overall_rating} size="sm" showValue={false} />
                  </div>
                  <div className="text-stone-500 text-sm">
                    <div>{reviews.length}</div>
                    <div>recensioni</div>
                  </div>
                </>
              ) : (
                <div className="text-stone-500 text-sm">
                  <div>0</div>
                  <div>recensioni</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-3 mb-6">
            {venue.price_range && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 px-3 py-1.5">
                {venue.price_range}
              </Badge>
            )}
            {venue.specialties?.map((spec, i) => (
              <Badge key={i} variant="outline" className="border-stone-700 text-stone-400">
                {spec}
              </Badge>
            ))}
          </div>

          {/* Description */}
          {venue.description && (
            <p className="text-stone-400 leading-relaxed mb-8">{venue.description}</p>
          )}

          {/* Rating Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {ratingCategories.map(({ key, label, icon: Icon }) => (
              venue[key] && (
                <div key={key} className="bg-stone-800/30 rounded-xl p-4">
                  <div className="flex flex-col items-center text-center gap-1">
                    <Icon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="text-xs text-stone-500">{label}</div>
                    <div className="text-base font-bold text-stone-100">
                      {getLabelForValue(avgKeyToOptionKey[key] || key, venue[key])}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Contact & Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Contact */}
            <div className="bg-stone-800/30 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                Contatti
              </h3>
              <div className="space-y-3">
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="flex items-center gap-3 text-stone-400 hover:text-amber-400 transition-colors">
                    <Phone className="w-4 h-4" />
                    {venue.phone}
                  </a>
                )}
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-400 hover:text-amber-400 transition-colors">
                    <Globe className="w-4 h-4" />
                    Sito web
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {venue.instagram && (
                  <a href={`https://instagram.com/${venue.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-400 hover:text-amber-400 transition-colors">
                    <Instagram className="w-4 h-4" />
                    @{venue.instagram}
                  </a>
                )}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-stone-800/30 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Orari
              </h3>
              <p className="text-stone-400">
                {venue.opening_hours || "Orari non disponibili"}
              </p>
            </div>
          </div>

          {/* Gallery */}
          {venue.gallery && venue.gallery.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Galleria</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {venue.gallery.map((img, i) => (
                  <img 
                    key={i}
                    src={img}
                    alt={`${venue.name} ${i + 1}`}
                    className="h-32 w-48 object-cover rounded-xl flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Recensioni ({reviews.length})
              </h3>
              <Link to={createPageUrl(`AddReview?venue=${venueId}`)}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                  <PenLine className="w-4 h-4 mr-2" />
                  Scrivi recensione
                </Button>
              </Link>
            </div>

            {loadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <ReviewCard key={review.id} review={review} index={i} currentUser={currentUser} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-800/20 rounded-2xl">
                <Star className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                <p className="text-stone-500">Nessuna recensione ancora</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}