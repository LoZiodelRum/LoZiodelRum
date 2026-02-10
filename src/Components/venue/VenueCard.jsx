import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Star, BadgeCheck, Wine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const categoryLabels = {
  cocktail_bar: "Cocktail Bar",
  rum_bar: "Rum Bar",
  wine_bar: "Wine Bar",
  speakeasy: "Speakeasy"
};

const categoryColors = {
  cocktail_bar: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  rum_bar: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  wine_bar: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  speakeasy: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  rooftop: "bg-sky-500/20 text-sky-400 border-sky-500/30"
};

export default function VenueCard({ venue, index = 0, compact = false }) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link 
          to={createPageUrl(`VenueDetail?id=${venue.id}`)}
          className="group relative h-40 rounded-2xl overflow-hidden block"
        >
          <img 
            src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"} 
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
          {venue.overall_rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-amber-950 text-amber-950" />
              <span className="font-bold text-amber-950 text-xs">
                {venue.overall_rating.toFixed(1)}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">{venue.name}</h3>
            <p className="text-stone-400 text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {venue.city}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={createPageUrl(`VenueDetail?id=${venue.id}`)}>
        <div className="group relative bg-stone-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-stone-800/50 hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10">
          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600"}
              alt={venue.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {venue.featured && (
                <Badge className="bg-amber-500 text-stone-950 border-0 font-semibold">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  In Evidenza
                </Badge>
              )}
              {venue.verified && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Verificato
                </Badge>
              )}
            </div>

            {/* Price Range */}
            <div className="absolute top-3 right-3">
              <span className="text-amber-400 font-semibold tracking-wider text-sm">
                {venue.price_range || "€€"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-5">
            <div className="mb-3">
              <h3 className="text-base md:text-lg font-semibold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                {venue.name}
              </h3>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-stone-400 text-sm flex-1 min-w-0">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{venue.city}, {venue.country}</span>
                </div>
                
                {venue.overall_rating && (
                  <div className="flex items-center gap-1.5 bg-amber-500/20 px-2 py-1 rounded-lg flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-amber-400 text-sm">
                      {venue.overall_rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(venue.categories || [venue.category]).filter(Boolean).map((cat, i) => (
                <Badge key={i} className={cn("border text-xs", categoryColors[cat])}>
                  <Wine className="w-3 h-3 mr-1" />
                  {categoryLabels[cat] || cat}
                </Badge>
              ))}
            </div>

            {venue.specialties && venue.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {venue.specialties.slice(0, 3).map((specialty, i) => (
                  <span 
                    key={i}
                    className="text-xs text-stone-500 bg-stone-800/50 px-2 py-0.5 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-stone-800/50">
              <span className="text-xs text-stone-500">
                {venue.review_count || 0} recensioni
              </span>
              <span className="text-xs text-amber-500 font-medium group-hover:translate-x-1 transition-transform">
                Scopri di più →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}