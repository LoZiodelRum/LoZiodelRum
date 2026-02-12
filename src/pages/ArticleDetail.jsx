import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Calendar, Eye, Share2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/AppDataContext";

const categoryLabels = {
  rum: "Rum",
  cocktail: "Cocktail",
  cultura: "Cultura",
  intervista: "Intervista",
  guida: "Guida",
  evento: "Evento",
};

const categoryColors = {
  rum: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cocktail: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cultura: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  intervista: "bg-green-500/20 text-green-400 border-green-500/30",
  guida: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  evento: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function ArticleDetail() {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get("id");
  const { getArticleById } = useAppData();
  const article = getArticleById(articleId);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-4">
          <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium mb-6">Articolo non trovato</p>
          <Link to={createPageUrl("Magazine")}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-black font-bold">
              Torna al Magazine
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const views = article.views ?? 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      {/* Header con indietro e share */}
      <div className="sticky top-0 z-50 px-4 py-4 bg-black/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <Link
          to={createPageUrl("Magazine")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Magazine</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href,
              }).catch(() => {});
            }
          }}
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Immagine in evidenza */}
      <div className="relative h-[320px] sm:h-[380px] md:h-[420px] overflow-hidden">
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      {/* Contenuto: tag, titolo, intro, autore/date/views, corpo */}
      <div className="px-4 md:px-6 -mt-24 relative z-10 pb-28 lg:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#141414] rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl">
            {/* Tag categoria (es. Cultura) */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${categoryColors[article.category] || categoryColors.cultura}`}
              >
                {categoryLabels[article.category] || article.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6 text-white">
              {article.title}
            </h1>

            {/* Intro / excerpt */}
            <p className="text-xl text-zinc-400 leading-relaxed mb-6">
              {article.excerpt}
            </p>

            {/* Autore, data, visualizzazioni */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-zinc-500 pb-6 border-b border-white/10 mb-8">
              {article.author_name && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-sm">
                      {article.author_name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-zinc-400">{article.author_name}</span>
                </div>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-500" />
                {formatDate(article.created_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-zinc-500" />
                {views} visualizzazioni
              </span>
            </div>

            {/* Corpo articolo (Markdown da Article_export) */}
            <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-headings:text-white prose-img:rounded-xl prose-img:my-6">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
