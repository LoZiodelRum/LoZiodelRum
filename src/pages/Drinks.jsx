import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";

// Emoji come in allegato: 🍸 Martini per Cocktail/Gin/Vodka, 🥃 Tumbler per Rum/Whisky/Tequila/Mezcal/Brandy/Altri
const CATEGORY_EMOJI = {
  cocktail: "🍸",
  rum: "🥃",
  whisky: "🥃",
  gin: "🍸",
  vodka: "🍸",
  tequila: "🥃",
  mezcal: "🥃",
  brandy: "🥃",
  other: "🥃",
};
function getCategoryEmoji(catKey) {
  return CATEGORY_EMOJI[catKey] || "🥃";
}

// Ordine come nello screenshot: Cocktail per primo, poi Rum, Whisky, ecc.
const CATEGORIES_ORDER = [
  "Cocktail",
  "Rum",
  "Whisky",
  "Gin",
  "Vodka",
  "Tequila",
  "Mezcal",
  "Brandy",
  "Other",
];

const PREVIEWS_PER_CATEGORY = 6; // 2 righe x 3 colonne

function normCat(c) {
  return (c || "").toLowerCase().trim().replace(/\s+/g, "");
}

export default function Drinks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get("cat");
  // Se c'è ?cat=rum mostriamo la lista piena di quella categoria; altrimenti overview (sezioni con 6 anteprime)
  const activeCategory = catParam ? normCat(catParam) : null;

  const openCategory = (categoryKey) => {
    if (!categoryKey) {
      searchParams.delete("cat");
      setSearchParams(searchParams, { replace: true });
      return;
    }
    setSearchParams({ cat: categoryKey }, { replace: true });
  };

  const { getDrinks } = useAppData();
  const drinksList = getDrinks();
  const drinksByCategory = useMemo(() => {
    const byCat = {};
    const s = searchTerm.toLowerCase().trim();
    drinksList.forEach((d) => {
      const drinkCat = normCat(d.category);
      const matchesSearch =
        !s ||
        d.name.toLowerCase().includes(s) ||
        (d.brand || "").toLowerCase().includes(s) ||
        (d.origin || "").toLowerCase().includes(s);
      if (!matchesSearch) return;
      if (!byCat[drinkCat]) byCat[drinkCat] = [];
      byCat[drinkCat].push(d);
    });
    // Ordine alfabetico per nome in ogni categoria
    Object.keys(byCat).forEach((key) => {
      byCat[key].sort((a, b) => (a.name || "").localeCompare(b.name || "", "it"));
    });
    return byCat;
  }, [searchTerm, drinksList]);

  // In vista “lista categoria”: drink filtrati per categoria attiva + ricerca
  const filteredDrinks = useMemo(() => {
    if (!activeCategory) return [];
    const list = drinksByCategory[activeCategory] || [];
    return list;
  }, [activeCategory, drinksByCategory]);

  // Card singola drink (usata in griglia e in sezioni)
  const DrinkCard = ({ drink }) => (
    <Link
      to={`/drink/${drink.id}`}
      className="flex items-center bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 active:scale-[0.98] transition-all h-[130px] hover:border-white/10"
    >
      <div className="w-24 h-24 bg-[#2c2c2e] rounded-xl flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-xl border border-white/5">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="ml-5 flex-1 min-w-0">
        <h3 className="text-sm font-black text-white leading-tight truncate">
          {drink.name}
        </h3>
        <p className="text-[13px] text-zinc-500 font-bold truncate mt-0.5">
          {drink.brand}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="px-2.5 py-1 bg-black/40 rounded-lg border border-white/10">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              {drink.origin || "N/A"}
            </span>
          </div>
          <div className="px-2.5 py-1 bg-black/40 rounded-lg border border-white/10">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              {drink.abv}%
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="text-zinc-800 w-5 h-5 ml-1 shrink-0" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-20">
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-md p-4 pt-6 border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black tracking-tighter">Catalogo Drink</h1>
          <div className="w-10 h-10 bg-[#1c1c1e] rounded-full flex items-center justify-center border border-white/10 text-[10px] font-bold text-zinc-500">
            GP
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Cerca drink, marca, origine..."
            className="w-full bg-[#1c1c1e] rounded-xl py-4 pl-12 pr-4 outline-none text-lg border-none focus:ring-1 focus:ring-zinc-700 placeholder:text-zinc-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pulsanti categorie: su mobile in griglia 3 colonne (3 righe), su desktop una riga orizzontale */}
        <div className="grid grid-cols-3 md:flex md:flex-row md:flex-wrap gap-2 pb-1">
          {CATEGORIES_ORDER.map((cat) => {
            const key = normCat(cat);
            const isActive = activeCategory === key;
            return (
              <button
                key={cat}
                onClick={() => openCategory(isActive ? null : key)}
                className={`py-3 px-2 rounded-xl text-sm md:text-[11px] font-black uppercase tracking-tight border transition-all flex items-center justify-center gap-1.5 min-w-0 md:min-w-[5rem] ${
                  isActive
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-[#1c1c1e] text-zinc-500 border-white/5 hover:border-white/20 active:bg-[#2c2c2e]"
                }`}
              >
                <span className="shrink-0">{getCategoryEmoji(key)}</span>
                <span className="truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 pt-8">
        {activeCategory ? (
          /* Vista “pagina categoria”: lista completa della categoria selezionata */
          <div className="space-y-8">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black capitalize tracking-tight flex items-center gap-2">
                  <span>{getCategoryEmoji(activeCategory)}</span>
                  {CATEGORIES_ORDER.find((c) => normCat(c) === activeCategory) || activeCategory}
                </h2>
                <span className="bg-[#1c1c1e] text-zinc-500 text-[12px] px-2 py-0.5 rounded-md font-bold border border-white/5">
                  {filteredDrinks.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrinks.length > 0 ? (
                filteredDrinks.map((drink) => (
                  <DrinkCard key={drink.id} drink={drink} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-zinc-600 font-bold">
                    Nessun drink trovato in questa categoria.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Vista overview: una sezione per categoria con solo 6 anteprime (2 righe x 3 colonne) */
          <div className="space-y-8">
          <p className="text-zinc-500 text-lg font-medium mb-8">
            Esplora il nostro archivio di cocktail, distillati e vini
          </p>
          <div className="space-y-10">
            {CATEGORIES_ORDER.map((cat) => {
              const key = normCat(cat);
              const list = drinksByCategory[key] || [];
              const previews = list.slice(0, PREVIEWS_PER_CATEGORY);
              const displayName = cat === "Other" ? "Altri" : cat;
              if (list.length === 0) return null;
              return (
                <section key={cat}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <span>{getCategoryEmoji(key)}</span>
                      {displayName}
                    </h2>
                    <span className="bg-[#1c1c1e] text-zinc-500 text-[12px] px-2 py-0.5 rounded-md font-bold border border-white/5">
                      {list.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {previews.map((drink) => (
                      <DrinkCard key={drink.id} drink={drink} />
                    ))}
                  </div>
                  <Link
                    to={`/Drinks?cat=${encodeURIComponent(key)}`}
                    className="inline-flex items-center gap-1 mt-4 text-orange-500 font-bold text-sm hover:underline"
                  >
                    Vedi tutti i {displayName.toLowerCase()} <ChevronRight className="w-4 h-4" />
                  </Link>
                </section>
              );
            })}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
