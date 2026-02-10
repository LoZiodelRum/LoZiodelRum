import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";

const categoryLabels = {
  all: "Tutti",
  rum: "Rum",
  cocktail: "Cocktail",
  cultura: "Cultura",
  intervista: "Intervista",
  guida: "Guida",
  evento: "Evento",
};

const categoryColors = {
  rum: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cocktail: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cultura: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  intervista: "bg-green-500/20 text-green-400 border-green-500/30",
  guida: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  evento: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function Magazine() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { getArticles } = useAppData();
  const raw = getArticles();
  const articlesList = Array.isArray(raw) ? raw : [];
  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return articlesList;
    return articlesList.filter((a) => a && a.category === selectedCategory);
  }, [selectedCategory, articlesList]);

  const featuredArticle = filteredArticles[0] ?? null;
  const otherArticles = filteredArticles.slice(1);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Filtri categoria come in allegato: Tutti in evidenza arancio */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${
                selectedCategory === key
                  ? "bg-orange-500 text-black"
                  : "bg-[#1c1c1e] text-zinc-400 border border-white/10 hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Articolo in evidenza: grande blocco con immagine, tag Cultura + In evidenza, titolo, descrizione, data */}
        {featuredArticle && (
          <Link to={createPageUrl(`ArticleDetail?id=${featuredArticle.id}`)}>
            <div className="relative h-[380px] md:h-[420px] rounded-2xl overflow-hidden mb-10 group">
              <img
                src={featuredArticle.cover_image || ""}
                alt={featuredArticle.title || ""}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${categoryColors[featuredArticle?.category] || categoryColors.cultura}`}
                >
                  {categoryLabels[featuredArticle?.category] || featuredArticle?.category || "Articolo"}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/20 text-white border border-white/30">
                  In evidenza
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h2 className="text-2xl md:text-4xl font-black mb-3 text-white leading-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-zinc-300 text-base md:text-lg mb-4 line-clamp-2">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(featuredArticle.created_date)}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Griglia articoli: 3 colonne, card con immagine, tag, titolo */}
        {otherArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map((article) => article && (
              <Link
                key={article.id}
                to={createPageUrl(`ArticleDetail?id=${article.id}`)}
                className="group block"
              >
                <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.cover_image || ""}
                      alt={article.title || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${categoryColors[article.category] || categoryColors.cultura}`}
                      >
                        {categoryLabels[article.category] || article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(article.created_date)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500 font-medium">
            Nessun articolo in questa categoria.
          </div>
        )}
      </div>
    </div>
  );
}
