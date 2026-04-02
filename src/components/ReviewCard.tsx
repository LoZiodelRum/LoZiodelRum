import "../App.css";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Heart,
  MessageCircle,
  Share2,
  Wine,
  Star,
  User,
  Edit,
} from "lucide-react";

export default function ReviewCard({
  review,
  showVenue = false,
  venue = null,
  currentUser = null,
}: any) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review?.likes_count || 0);

  const canEdit =
    currentUser &&
    (currentUser.role === "admin" ||
      review?.created_by === currentUser?.email);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  // 🔑 compatibilità Supabase
  const date =
    review?.visit_date || review?.created_at || review?.created_date;

  const author = review?.author_name || "Anonimo";

  const rating =
    review?.overall_rating !== undefined
      ? Number(review.overall_rating).toFixed(1)
      : "N/A";

  return (
    <div className="bg-stone-900/30 backdrop-blur-sm rounded-2xl border border-stone-800/50 p-6 hover:border-stone-700/50 transition-colors">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-stone-800 flex items-center justify-center border border-stone-700">
            <User className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-stone-100">{author}</p>
            <p className="text-sm text-stone-500">
              {date
                ? format(new Date(date), "d MMMM yyyy", { locale: it })
                : "Data non disponibile"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-xl">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="font-bold text-amber-400">{rating}</span>
        </div>
      </div>

      {/* VENUE */}
      {showVenue && venue && (
        <div className="mb-4 p-3 bg-stone-800/30 rounded-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-stone-700" />
          <div>
            <p className="font-medium text-stone-200">
              {venue?.name || "Locale"}
            </p>
            <p className="text-sm text-stone-500">
              {venue?.city || ""}
            </p>
          </div>
        </div>
      )}

      {/* TITLE */}
      {review?.title && (
        <h4 className="text-lg font-semibold text-stone-100 mb-2">
          {review.title}
        </h4>
      )}

      {/* CONTENT */}
      <p className="text-stone-400 leading-relaxed mb-4">
        {review?.content || "Nessun contenuto"}
      </p>

      {/* DRINKS */}
      {review?.drinks_ordered?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-400 mb-2 flex items-center gap-2">
            <Wine className="w-4 h-4" />
            Drink ordinati
          </p>
          <div className="flex flex-wrap gap-2">
            {review.drinks_ordered.map((drink: any, i: number) => (
              <span
                key={i}
                className="text-xs text-amber-400 bg-stone-800 px-2 py-1 rounded"
              >
                {drink?.name || "Drink"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-800/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm ${
            liked ? "text-amber-500" : "text-stone-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          {likesCount}
        </button>

        <button className="flex items-center gap-1 text-sm text-stone-400">
          <MessageCircle className="w-4 h-4" />
          Commenta
        </button>

        <div className="ml-auto flex items-center gap-2">
          {canEdit && (
            <button className="flex items-center gap-1 text-sm text-amber-500">
              <Edit className="w-4 h-4" />
              Modifica
            </button>
          )}

          <button className="text-stone-400">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}