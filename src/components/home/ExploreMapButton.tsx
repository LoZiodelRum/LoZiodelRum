import React from "react";

export default function ExploreMapButton() {
  return (
    <div className="px-4 pt-2 pb-4">
      <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg transition-all">
        <span>ESPLORA MAPPA</span>
        <span className="text-xl">&rarr;</span>
      </button>
      <div className="text-white/60 text-xs mt-1 text-center">Trova i locali più vicini a te</div>
    </div>
  );
}
