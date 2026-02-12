import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Calendar, Share2 } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800";

export default function CommunityEventDetail() {
  const { id } = useParams();
  const { getCommunityEvents } = useAppData();
  const events = getCommunityEvents();
  const event = events.find((e) => e.id === id);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-stone-700 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-stone-400 font-medium mb-6">Evento non trovato</p>
          <Link to={createPageUrl("CommunityFeed")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna alla Bacheca
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description || event.location,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen relative pt-8 pb-28 lg:pb-12">
      <div className="fixed inset-0 z-0 bg-stone-700" />

      {/* Barra sticky con tasto indietro */}
      <div className="sticky top-14 lg:top-16 z-40 px-4 md:px-6 py-3 bg-stone-700/95 backdrop-blur-md border-b border-stone-600 flex items-center justify-between">
        <Link
          to={createPageUrl("CommunityFeed")}
          className="inline-flex items-center gap-2 text-stone-300 hover:text-amber-500 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Indietro
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-stone-400 hover:text-amber-500"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 pt-8">
        <article className="rounded-2xl overflow-hidden border border-stone-600 bg-stone-900/80 backdrop-blur-sm shadow-xl">
          <div className="relative h-56 md:h-72">
            <img
              src={event.image || DEFAULT_IMG}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_IMG;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Calendar className="w-3.5 h-3.5" />
                  Evento
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{event.title}</h1>
              <p className="text-stone-400 text-sm mt-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 shrink-0" />
                {formatDate(event.date)}
              </p>
              {event.location && (
                <p className="text-stone-400 text-sm mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {event.location}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-6 pb-6 border-b border-stone-700">
              {event.author_name && (
                <span className="text-stone-400">{event.author_name}</span>
              )}
            </div>

            {event.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-stone-300 text-base leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
