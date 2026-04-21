
import React from "react";

export default function AboutSection() {
  return (
    <section className="px-0 pt-8 pb-32 text-center bg-black">
      <div className="flex flex-col items-center w-full">
        {/* Linea decorativa */}
        <div className="w-16 h-1 rounded-full bg-yellow-900/80 mb-6" />
        <h4 className="text-white font-extrabold text-2xl mb-3">Lo Zio del Rum</h4>
        <p className="text-white/80 text-lg mb-6 max-w-md mx-auto">Un viaggio nel mondo degli spiriti pregiati, selezionati con cura per la tua esperienza definitiva.</p>
        <div className="flex justify-center gap-6 mb-6">
          <div className="relative">
            <img src="/assets/avatar1.png" alt="avatar1" className="w-16 h-16 rounded-full border-4 border-black object-cover" />
            <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 border-2 border-black rounded-full" />
          </div>
          <div className="relative">
            <img src="/assets/avatar2.png" alt="avatar2" className="w-16 h-16 rounded-full border-4 border-black object-cover" />
            <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 border-2 border-black rounded-full" />
          </div>
          <div className="relative">
            <img src="/assets/avatar3.png" alt="avatar3" className="w-16 h-16 rounded-full border-4 border-black object-cover" />
            <span className="absolute bottom-2 right-2 w-4 h-4 bg-yellow-400 border-2 border-black rounded-full" />
          </div>
        </div>
        <div className="text-white/40 text-sm mt-2">
          © 2024 DRINKWISE APP. TUTTI I DIRITTI RISERVATI.
        </div>
      </div>
    </section>
  );
}
