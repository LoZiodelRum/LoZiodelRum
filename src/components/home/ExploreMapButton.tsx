
import React from "react";

export default function ExploreMapButton() {
  return (
    <div className="px-4 pt-2 pb-6">
      <button className="w-full bg-[#3a280e] hover:bg-yellow-900/80 text-white font-bold py-5 rounded-2xl flex items-center gap-4 text-lg shadow-xl transition-all relative border-none" style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)'}}>
        <span className="flex items-center justify-center w-10 h-10 bg-[#2a1d0a] rounded-full mr-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6l7.5-2.5M21 6l-7.5-2.5M3 6v13l7.5 2.5M3 6l7.5 2.5M21 6v13l-7.5 2.5M21 6l-7.5 2.5M12 21v-13"/></svg>
        </span>
        <div className="flex flex-col items-start flex-1">
          <span className="font-extrabold text-white text-lg leading-tight">ESPLORA MAPPA</span>
          <span className="text-white/70 text-sm font-normal mt-0.5">Trova i locali più vicini a te</span>
        </div>
        <span className="ml-auto text-yellow-400 text-2xl font-bold">→</span>
      </button>
    </div>
  );
}
