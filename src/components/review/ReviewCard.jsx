/**
 * Card recensione – Supabase (reviews_cloud).
 * Nessun localStorage: deleteReview su Supabase.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "@/lib/AppDataContext";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Heart, MessageCircle, Share2, ThumbsUp, Wine, Star, User, Edit, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { getLabelForValue } from "@/lib/reviewRatings";
import { migrateHighlights, migrateImprovements } from "@/lib/highlightsImprovements";

const ratingLabels = {
  drink_quality: "Qualità Drink",
  staff_competence: "Competenza Staff",
  atmosphere: "Atmosfera",
  value_for_money: "Qualità/Prezzo"
};

export default function ReviewCard({ review, showVenue = false, venue = null, index = 0, currentUser = null }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteReview } = useAppData();
  
  const canEdit = currentUser && (currentUser.role === 'admin' || review.created_by === currentUser.email);

  const handleDelete = () => {
    deleteReview(review.id);
    setShowDeleteConfirm(false);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-stone-900/30 backdrop-blur-sm rounded-2xl border border-stone-800/50 p-6 hover:border-stone-700/50 transition-colors overflow-visible"
    >
      <Link
        to={createPageUrl(`ReviewDetail?id=${review.id}`)}
        className="block cursor-pointer hover:opacity-95 transition-opacity"
      >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-stone-800">
            <AvatarImage src={review.author_avatar} />
            <AvatarFallback className="bg-stone-800 text-amber-500">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-stone-100">
              {review.author_name || "Anonimo"}
            </p>
            <p className="text-sm text-stone-500">
              {review.visit_date 
                ? format(new Date(review.visit_date), "d MMMM yyyy", { locale: it })
                : format(new Date(review.created_date), "d MMMM yyyy", { locale: it })
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-xl">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="font-bold text-amber-400">{review.overall_rating?.toFixed(1)}</span>
        </div>
      </div>

      {/* Venue Reference */}
      {showVenue && venue && (
        <div className="mb-4 p-3 bg-stone-800/30 rounded-xl flex items-center gap-3">
          <img 
            src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100"} 
            alt={venue.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-stone-200">{venue.name}</p>
            <p className="text-sm text-stone-500">{venue.city}</p>
          </div>
        </div>
      )}

      {/* Title & Content */}
      {review.title && (
        <h4 className="text-lg font-semibold text-stone-100 mb-2">{review.title}</h4>
      )}
      {review.content && (
        <p className="text-stone-400 leading-relaxed mb-4">{review.content}</p>
      )}

      {/* Ratings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {Object.entries(ratingLabels).map(([key, label]) => (
          review[key] && (
            <div key={key} className="flex items-center justify-between gap-2 p-3 bg-stone-800/30 rounded-lg">
              <span className="text-xs text-stone-500 flex-shrink-0">{label}</span>
              <span className="text-sm font-medium text-stone-100">
                {getLabelForValue(key, review[key])}
              </span>
            </div>
          )
        ))}
      </div>

      {/* Drinks Ordered */}
      {review.drinks_ordered && review.drinks_ordered.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-400 mb-2 flex items-center gap-2">
            <Wine className="w-4 h-4" />
            Drink ordinati
          </p>
          <div className="flex flex-wrap gap-2">
            {review.drinks_ordered.map((drink, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="bg-stone-800/50 border-stone-700 text-stone-300"
              >
                {drink.name}
                {drink.rating && (
                  <span className="ml-1 text-amber-500">• {drink.rating}</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.photos.map((photo, i) => (
            <img 
              key={i}
              src={photo}
              alt={`Foto ${i + 1}`}
              className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Videos indicator */}
      {review.videos && review.videos.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-stone-500">
          <Video className="w-4 h-4 text-amber-500" />
          <span>{review.videos.length} video allegat{review.videos.length === 1 ? "o" : "i"}</span>
        </div>
      )}

      {/* Highlights & Improvements (migrati per compatibilità con vecchie recensioni) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {migrateHighlights(review.highlights)?.map((h, i) => (
          <Badge key={`h-${i}`} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            ✓ {h}
          </Badge>
        ))}
        {migrateImprovements(review.improvements)?.map((imp, i) => (
          <Badge key={`i-${i}`} className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            ↗ {imp}
          </Badge>
        ))}
      </div>

      {/* Recommendation */}
      {review.would_recommend !== undefined && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          review.would_recommend 
            ? "bg-emerald-500/20 text-emerald-400" 
            : "bg-stone-700/50 text-stone-400"
        }`}>
          <ThumbsUp className="w-4 h-4" />
          {review.would_recommend ? "Lo consiglio" : "Con riserva"}
        </div>
      )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-800/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`text-stone-400 hover:text-amber-500 ${liked ? "text-amber-500" : ""}`}
        >
          <Heart className={`w-4 h-4 mr-1.5 ${liked ? "fill-current" : ""}`} />
          {likesCount > 0 && likesCount}
        </Button>
        <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-200">
          <MessageCircle className="w-4 h-4 mr-1.5" />
          Commenta
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {canEdit && (
            <>
              <Link to={createPageUrl(`EditReview?id=${review.id}`)}>
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                  <Edit className="w-4 h-4 mr-1.5" />
                  Modifica
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => setShowDeleteConfirm(true)}
                title="Elimina recensione"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-200">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
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
    </motion.div>
  );
}