import React from "react";

export default function AboutSection() {
  return (
    <section className="px-4 pt-4 pb-8 text-center">
      <h4 className="text-white font-bold text-base mb-2">Lo Zio del Rum</h4>
      <p className="text-white/80 text-sm mb-4">Un viaggio nel mondo degli spiriti pregiati, selezionati con cura per la tua esperienza definitiva.</p>
      <div className="flex justify-center gap-2 mb-2">
        <img src="/assets/avatar1.png" alt="avatar1" className="w-8 h-8 rounded-full border-2 border-white" />
        <img src="/assets/avatar2.png" alt="avatar2" className="w-8 h-8 rounded-full border-2 border-white" />
        <img src="/assets/avatar3.png" alt="avatar3" className="w-8 h-8 rounded-full border-2 border-white" />
      </div>
      <div className="text-white/40 text-xs">© 2024 DRINKWISE APP. TUTTI I DIRITTI RISERVATI.</div>
    </section>
  );
}
