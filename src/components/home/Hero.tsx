
import React from "react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[390px] flex flex-col justify-end overflow-hidden bg-black rounded-b-3xl" style={{boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)'}}>
      {/* Background image */}
      <img
        src="/assets/hero-bg.jpg"
        alt="DrinkWise Hero"
        className="absolute inset-0 w-full h-full object-cover"
        style={{objectPosition: 'center'}}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
      {/* Top icons */}
      <div className="absolute top-4 left-4 flex items-center z-20">
        <button className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md">
          <span className="text-xl text-yellow-500">⚡</span>
        </button>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
        <button className="w-9 h-9 rounded-xl bg-black/60 flex items-center justify-center">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm7 2-4.35-4.35"/></svg>
        </button>
        <button className="w-9 h-9 rounded-xl bg-black/60 flex items-center justify-center">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9zm-6 5v.01"/></svg>
        </button>
      </div>
      {/* Content */}
      <div className="relative z-10 w-full px-6 pb-8 pt-32 flex flex-col items-start">
        <h1 className="text-4xl font-extrabold text-white leading-tight mb-1 drop-shadow-lg">DrinkWise</h1>
        <h2 className="text-xl font-semibold text-yellow-400 italic mb-3 drop-shadow">sul bere consapevole</h2>
        <p className="text-white/90 text-base mb-6 max-w-xs drop-shadow">Esplora i migliori locali della tua città e scopri l'arte della mixology premium.</p>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-7 rounded-full shadow-xl text-lg transition-all w-full max-w-xs">Entra nella community</button>
      </div>
    </section>
  );
}
