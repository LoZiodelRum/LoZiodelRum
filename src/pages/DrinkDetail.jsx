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
      <div className="sticky top-0 z-50 flex justify-between items-center p-4 bg-black/80 backdrop-blur-lg border-b border-white/5">
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

      <div className="p-6 max-w-5xl mx-auto space-y-10 pb-32">
        {/* LAYOUT SPLIT: FOTO SINISTRA, DATI DESTRA */}
        <div className="flex flex-col md:flex-row gap-10 items-start pt-4">
          {/* Box Immagine - Forza la corrispondenza con la key */}
          <div className="w-full md:w-[380px] aspect-square bg-white rounded-[40px] flex items-center justify-center p-4 shadow-[0_0_50px_rgba(255,255,255,0.05)] shrink-0 overflow-hidden">
            <img 
              key={`detail-img-${drink.id}`} 
              src={drink.image} 
              alt={drink.name} 
              className="max-h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]" 
            />
          </div>

          {/* Dettagli Drink */}
          <div className="flex-1 space-y-6">
            <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-500 text-[11px] font-black uppercase rounded-lg border border-orange-500/20">
              {drink.category}
            </div>
            <h1 className="text-3xl font-black tracking-tighter leading-none">{drink.name}</h1>
            <p className="text-2xl text-zinc-500 font-bold tracking-tight">
              {isCocktail ? (drink.origin ? `${drink.origin}` : "Cocktail") : `${drink.origin || ""} · Single · ${drink.brand || ""}`.trim() || "—"}
            </p>
            
            {/* Griglia Badge Dati */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {!isCocktail && (
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                  <MapPin className="w-5 h-5 text-zinc-600" />
                  <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">{drink.origin || "N/A"}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <Droplets className="w-5 h-5 text-zinc-600" />
                <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">{drink.abv}% ABV</span>
              </div>
              {recipe?.glass && (
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 col-span-2 sm:col-span-1">
                  <Wine className="w-5 h-5 text-zinc-600" />
                  <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">{recipe.glass}</span>
                </div>
              )}
              {!isCocktail && (
                <>
                  <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <MapPin className="w-5 h-5 text-zinc-600" />
                    <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">Origine</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <Info className="w-5 h-5 text-zinc-600" />
                    <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">N/A</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* INGREDIENTI E PROPORZIONI (solo cocktail) */}
        {isCocktail && (
          <div className="space-y-4 pt-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <List className="w-7 h-7 text-orange-500" />
              Ingredienti e proporzioni
            </h2>
            {hasRecipe ? (
              <div className="space-y-6">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-baseline gap-4 p-3 bg-zinc-900/50 rounded-xl border border-white/5"
                    >
                      <span className="text-zinc-200 font-medium">{ing.name}</span>
                      <span className="text-orange-400 font-bold text-sm shrink-0">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
                {recipe.method && (
                  <div>
                    <h3 className="text-lg font-bold text-zinc-400 mb-2">Preparazione</h3>
                    <p className="text-zinc-400 leading-relaxed">{recipe.method}</p>
                  </div>
                )}
                {recipe.garnish && (
                  <p className="text-zinc-500 text-sm">
                    <span className="font-bold text-zinc-400">Garnish: </span>
                    {recipe.garnish}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 italic">Ingredienti non ancora inseriti per questo cocktail.</p>
            )}
          </div>
        )}

        {/* DESCRIZIONE */}
        <div className="space-y-4 pt-6">
          <h2 className="text-2xl font-black tracking-tight">Descrizione</h2>
          <p className="text-zinc-400 text-xl leading-relaxed font-medium">
            {drink.description || "Un distillato di eccellenza con note armoniose e un profilo aromatico persistente. Perfetto per degustazioni lisce o miscelazione di alta qualità."}
          </p>
        </div>

        <div className="pt-20 border-t border-white/5 text-center">
          <p className="text-zinc-600 font-bold text-lg">Hai assaggiato questo drink?</p>
        </div>
      </div>

      {/* FOOTER AZIONI */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black to-transparent flex justify-center items-center gap-4 z-[110]">
        <button className="bg-orange-500 text-black font-black px-12 py-5 rounded-full text-xl shadow-[0_15px_40px_rgba(249,115,22,0.4)] active:scale-95 transition-all">
          Scrivi una recensione
        </button>
        <button className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-black shadow-xl active:scale-95 transition-all">
          <Plus className="w-10 h-10" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}