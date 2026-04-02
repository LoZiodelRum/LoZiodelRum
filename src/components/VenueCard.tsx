import "../App.css";
import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, Wine } from "lucide-react";
import { motion } from "framer-motion";

const categoryLabels: any = {
  cocktail_bar: "Cocktail Bar",
  rum_bar: "Rum Bar",
  wine_bar: "Wine Bar",
  speakeasy: "Speakeasy"
};

const categoryColors: any = {
  cocktail_bar: "bg-amber-500/20 text-amber-400",
  rum_bar: "bg-orange-500/20 text-orange-400",
  wine_bar: "bg-rose-500/20 text-rose-400",
  speakeasy: "bg-purple-500/20 text-purple-400"
};

export default function VenueCard({ venue, index = 0, compact = false }: any) {

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link
          to={`/venue/${venue.id}`}
          className="group relative h-40 rounded-2xl overflow-hidden block"
        >
          <img
            src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"}
            className="w-full h-full object-cover group-hover:scale-110 transition"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {venue.overall_rating && (
            <div className="absolute top-3 right-3 bg-amber-500 px-2 py-1 rounded text-xs font-bold">
              ⭐ {venue.overall_rating}
            </div>
          )}

          <div className="absolute bottom-0 p-3 text-white">
            <h3 className="text-sm font-bold">{venue.name}</h3>
            <p className="text-xs text-gray-300 flex items-center gap-1">
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
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/venue/${venue.id}`}>
        <div className="bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-amber-500 transition">

          {/* IMAGE */}
          <div className="relative h-52">
            <img
              src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600"}
              className="w-full h-full object-cover group-hover:scale-110 transition"
            />

            {venue.featured && (
              <div className="absolute top-3 left-3 bg-amber-500 text-black px-2 py-1 text-xs rounded">
                In evidenza
              </div>
            )}

            {venue.verified && (
              <div className="absolute top-3 right-3 text-green-400">
                <BadgeCheck size={16} />
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-4">
            <h3 className="text-white font-semibold">{venue.name}</h3>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-400">
                {venue.city}, {venue.country}
              </span>

              {venue.overall_rating && (
                <span className="text-amber-400 font-bold">
                  ⭐ {venue.overall_rating}
                </span>
              )}
            </div>

            {/* CATEGORIES */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {(venue.categories || [venue.category]).filter(Boolean).map((cat: any, i: number) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded ${categoryColors[cat]}`}
                >
                  <Wine className="w-3 h-3 inline mr-1" />
                  {categoryLabels[cat] || cat}
                </span>
              ))}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              {venue.review_count || 0} recensioni
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}