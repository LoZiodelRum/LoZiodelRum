import React from "react";

interface Venue {
  id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
}

interface Props {
  venues: Venue[];
}

export default function RecommendedVenues({ venues }: Props) {
  return (
    <section className="bg-black pt-5 pb-2 px-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-lg">Locali consigliati</h3>
        <button className="text-amber-400 text-xs font-semibold">Vedi tutti</button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {venues.map((venue) => (
          <div key={venue.id} className="min-w-[180px] bg-stone-900 rounded-xl overflow-hidden shadow relative">
            <img src={venue.image} alt={venue.name} className="w-full h-24 object-cover" />
            <div className="absolute top-2 right-2 bg-black/80 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs text-amber-400 font-bold">
              <span>★</span>
              <span>{venue.rating}</span>
            </div>
            <div className="p-2">
              <div className="text-white font-semibold text-sm leading-tight truncate">{venue.name}</div>
              <div className="text-white/60 text-xs">{venue.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
