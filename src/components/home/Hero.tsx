import React from "react";

export default function Hero() {
  return (
    <section className="relative h-[340px] flex items-end justify-center overflow-hidden bg-black">
      <img
        src="/assets/hero-bg.jpg"
        alt="DrinkWise Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        style={{objectPosition: 'center'}}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
      <div className="relative z-10 w-full px-5 pb-8 flex flex-col items-start">
        <button className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-amber-500">⚡</span>
        </button>
        <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">DrinkWise</h1>
        <h2 className="text-base font-semibold text-amber-400 mb-2">sul bere consapevole</h2>
        <p className="text-white/90 text-sm mb-4">Esplora i migliori locali della tua città e scopri l’arte della mixology premium.</p>
        <button className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-5 rounded-full shadow-lg transition-all">Entra nella community</button>
      </div>
    </section>
  );
}
