import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Share2, Star, User, Wine, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppData } from "@/lib/AppDataContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getLabelForValue } from "@/lib/reviewRatings";
import { migrateHighlights, migrateImprovements } from "@/lib/highlightsImprovements";

const ratingLabels = {
  drink_quality: "Qualità Drink",
  staff_competence: "Competenza Staff",
  atmosphere: "Atmosfera",
  value_for_money: "Qualità/Prezzo",
};

export default function ReviewDetail() {
  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get("id");
  const { getReviewById, getVenueById } = useAppData();
  const review = getReviewById(reviewId);
  const venue = review ? getVenueById(review.venue_id) : null;

  if (!review) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4">
        <div className="text-center">
          <Star className="w-20 h-20 text-stone-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Recensione non trovata</h2>
          <p className="text-stone-500 mb-6">La recensione che stai cercando non esiste.</p>
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
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 lg:pb-16">
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/50 flex items-center justify-between">
        <Link
          to={venue ? createPageUrl(`VenueDetail?id=${review.venue_id}`) : createPageUrl("Explore")}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold text-sm">
            {venue?.name || "Locale"}
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-stone-400 hover:text-stone-100"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: review.title || "Recensione",
                text: review.content?.slice(0, 100) + "...",
                url: window.location.href,
              }).catch(() => {});
            }
          }}
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Contenuto */}
      <div className="px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6 md:p-8">
            {/* Header recensione */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-stone-800">
                  <AvatarImage src={review.author_avatar} />
                  <AvatarFallback className="bg-stone-800 text-amber-500">
                    <User className="w-7 h-7" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-stone-100 text-lg">
                    {review.author_name || "Anonimo"}
                  </p>
                  <p className="text-sm text-stone-500">
                    {review.visit_date
                      ? format(new Date(review.visit_date), "d MMMM yyyy", { locale: it })
                      : format(new Date(review.created_date), "d MMMM yyyy", { locale: it })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-amber-400 text-lg">{review.overall_rating?.toFixed(1)}</span>
              </div>
            </div>

            {/* Riferimento locale */}
            {venue && (
              <Link
                to={createPageUrl(`VenueDetail?id=${venue.id}`)}
                className="mb-6 p-4 bg-stone-800/30 rounded-xl flex items-center gap-3 hover:bg-stone-800/50 transition-colors block"
              >
                <img
                  src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100"}
                  alt={venue.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-stone-200">{venue.name}</p>
                  <p className="text-sm text-stone-500">{venue.city}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-stone-500 ml-auto rotate-180" />
              </Link>
            )}

            {/* Titolo e contenuto */}
            {review.title && (
              <h1 className="text-2xl md:text-3xl font-bold text-stone-100 mb-4">{review.title}</h1>
            )}
            {review.content && (
              <p className="text-stone-300 leading-relaxed mb-6 whitespace-pre-wrap">{review.content}</p>
            )}

            {/* Valutazioni */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {Object.entries(ratingLabels).map(([key, label]) =>
                review[key] ? (
                  <div key={key} className="flex items-center justify-between gap-2 p-3 bg-stone-800/30 rounded-lg">
                    <span className="text-sm font-medium text-stone-300">
                      {getLabelForValue(key, review[key])}
                    </span>
                    <span className="text-xs text-stone-500 flex-shrink-0 text-right">{label}</span>
                  </div>
                ) : null
              )}
            </div>

            {/* Drink ordinati */}
            {review.drinks_ordered && review.drinks_ordered.length > 0 && (
              <div className="mb-6">
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

            {/* Foto */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {review.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Foto ${i + 1}`}
                    className="h-24 w-24 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            )}

            {/* Video */}
            {review.videos && review.videos.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-stone-400">Video</p>
                <div className="space-y-3">
                  {review.videos.map((url, i) => {
                    const isYoutube = /youtube\.com|youtu\.be/i.test(url);
                    const isVimeo = /vimeo\.com/i.test(url);
                    if (isYoutube) {
                      const vid = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)?.[1];
                      return vid ? (
                        <div key={i} className="aspect-video rounded-xl overflow-hidden bg-stone-800">
                          <iframe
                            src={`https://www.youtube.com/embed/${vid}`}
                            title={`Video ${i + 1}`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline block truncate">
                          {url}
                        </a>
                      );
                    }
                    if (isVimeo) {
                      const vid = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
                      return vid ? (
                        <div key={i} className="aspect-video rounded-xl overflow-hidden bg-stone-800">
                          <iframe
                            src={`https://player.vimeo.com/video/${vid}`}
                            title={`Video ${i + 1}`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline block truncate">
                          {url}
                        </a>
                      );
                    }
                    return (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline block truncate">
                        Video {i + 1}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Highlights & Improvements */}
            <div className="flex flex-wrap gap-2 mb-6">
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

            {/* Raccomandazione */}
            {review.would_recommend !== undefined && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  review.would_recommend
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-stone-700/50 text-stone-400"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                {review.would_recommend ? "Lo consiglio" : "Con riserva"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
