import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Store, User, Share2 } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800";

export default function CommunityPostDetail() {
  const { type, id } = useParams();
  const { getOwnerMessages, getCommunityPosts } = useAppData();
  const isOwner = type === "owner";
  const items = isOwner ? getOwnerMessages() : getCommunityPosts();
  const post = items.find((p) => p.id === id);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-stone-700 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-stone-400 font-medium mb-6">Contenuto non trovato</p>
          <Link to={createPageUrl("CommunityFeed")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna alla Bacheca
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = post.title || (post.content?.slice(0, 80) + (post.content?.length > 80 ? "…" : "")) || "Post";
  const location = post.venue_name || post.location || post.author_name || "";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: post.content?.slice(0, 100),
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
              src={post.image || DEFAULT_IMG}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_IMG;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                    <Store className="w-3.5 h-3.5" />
                    Dai proprietari
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                    <User className="w-3.5 h-3.5" />
                    Dalla community
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h1>
              {location && (
                <p className="text-stone-400 text-sm mt-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {location}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-6 pb-6 border-b border-stone-700">
              {post.author_name && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-sm">
                      {post.author_name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-stone-400">{post.author_name}</span>
                </div>
              )}
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-stone-300 text-base leading-relaxed whitespace-pre-wrap">
                {post.content || post.title}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
