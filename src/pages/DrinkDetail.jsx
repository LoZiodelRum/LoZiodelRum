import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Share2, MapPin, Droplets, Info, Plus, Wine, List } from "lucide-react";
import { useAppData } from "@/lib/AppDataContext";
import { cocktailRecipes } from "@/data/cocktailRecipes";

export default function DrinkDetail() {
  const { id: idParam } = useParams();
  const [searchParams] = useSearchParams();
  const id = idParam || searchParams.get("id");
  const navigate = useNavigate();
  const { getDrinkById } = useAppData();
  const drink = getDrinkById(id);
  if (!drink) return null;

  const isCocktail = drink.category === "cocktail";
  const recipe = isCocktail ? cocktailRecipes[drink.id] : null;
  const hasRecipe = recipe?.ingredients?.length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-sans antialiased overflow-y-auto">
      {/* HEADER NAVIGAZIONE */}
      <div className="sticky top-0 z-50 flex justify-between items-center px-4 py-3 bg-black/80 backdrop-blur-lg border-b border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-white/10 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-bold font-sans">Torna al catalogo</span>
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"><Share2 className="w-5 h-5" /></button>
          <button className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all rotate-180"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6 pb-28">
        {/* LAYOUT SPLIT: FOTO SINISTRA, DATI DESTRA */}
        <div className="flex flex-col md:flex-row gap-6 items-start pt-2">
          {/* Box Immagine */}
          <div className="w-full max-w-[240px] md:w-[240px] mx-auto md:mx-0 aspect-square bg-white rounded-xl flex items-center justify-center p-3 shadow-[0_0_50px_rgba(255,255,255,0.05)] shrink-0 overflow-hidden">
            <img 
              key={`detail-img-${drink.id}`} 
              src={drink.image} 
              alt={drink.name} 
              className="w-full h-full object-cover object-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]" 
            />
          </div>

          {/* Dettagli Drink */}
          <div className="flex-1 space-y-4 min-w-0">
            <div className="inline-block px-2.5 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase rounded-lg border border-orange-500/20">
              {drink.category}
            </div>
            <h1 className="text-2xl font-black tracking-tighter leading-tight">{drink.name}</h1>
            <p className="text-lg text-zinc-500 font-bold tracking-tight">
              {isCocktail ? (drink.origin ? `${drink.origin}` : "Cocktail") : `${drink.origin || ""} · Single · ${drink.brand || ""}`.trim() || "—"}
            </p>
            
            {/* Griglia Badge Dati */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {!isCocktail && (
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <MapPin className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span className="text-xs font-black text-zinc-300 uppercase tracking-widest truncate">{drink.origin || "N/A"}</span>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <Droplets className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">{drink.abv}% ABV</span>
              </div>
              {recipe?.glass && (
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                  <Wine className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span className="text-xs font-black text-zinc-300 uppercase tracking-widest truncate">{recipe.glass}</span>
                </div>
              )}
              {!isCocktail && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                    <MapPin className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">Origine</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                    <Info className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">N/A</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* INGREDIENTI E PROPORZIONI (solo cocktail) */}
        {isCocktail && (
          <div className="space-y-3 pt-4">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <List className="w-5 h-5 text-orange-500" />
              Ingredienti e proporzioni
            </h2>
            {hasRecipe ? (
              <div className="space-y-4">
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-baseline gap-3 py-2 px-2.5 bg-zinc-900/50 rounded-lg border border-white/5"
                    >
                      <span className="text-zinc-200 text-sm font-medium truncate">{ing.name}</span>
                      <span className="text-orange-400 font-bold text-xs shrink-0">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
                {recipe.method && (
                  <div>
                    <h3 className="text-base font-bold text-zinc-400 mb-1">Preparazione</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{recipe.method}</p>
                  </div>
                )}
                {recipe.garnish && (
                  <p className="text-zinc-500 text-xs">
                    <span className="font-bold text-zinc-400">Garnish: </span>
                    {recipe.garnish}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 italic text-sm">Ingredienti non ancora inseriti per questo cocktail.</p>
            )}
          </div>
        )}

        {/* DESCRIZIONE */}
        <div className="space-y-2 pt-4">
          <h2 className="text-xl font-black tracking-tight">Descrizione</h2>
          <p className="text-zinc-400 text-base leading-relaxed font-medium">
            {drink.description || "Un distillato di eccellenza con note armoniose e un profilo aromatico persistente. Perfetto per degustazioni lisce o miscelazione di alta qualità."}
          </p>
        </div>

        <div className="pt-10 border-t border-white/5 text-center">
          <p className="text-zinc-600 font-bold text-base">Hai assaggiato questo drink?</p>
        </div>
      </div>

      {/* FOOTER AZIONI */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-black via-black to-transparent flex justify-center items-center gap-3 z-[110]">
        <button className="bg-orange-500 text-black font-black px-7 py-3 rounded-full text-base shadow-[0_10px_28px_rgba(249,115,22,0.4)] active:scale-95 transition-all">
          Scrivi una recensione
        </button>
        <button className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black shadow-lg active:scale-95 transition-all">
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}