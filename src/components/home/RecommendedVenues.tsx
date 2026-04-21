
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
    <section className="bg-black pt-6 pb-2 px-0">
      <div className="flex items-center justify-between px-5 mb-3">
        <h3 className="text-white font-bold text-2xl">Locali consigliati</h3>
        <button className="text-yellow-500 text-base font-semibold">Vedi tutti</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar px-4">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="min-w-[260px] max-w-[260px] bg-[#18120b] rounded-2xl overflow-hidden shadow-lg relative flex-shrink-0"
            style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
          >
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-36 object-cover"
              style={{ borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}
            />
            {/* Badge rating */}
            <div className="absolute top-3 right-3 bg-yellow-900/90 rounded-full px-3 py-1 flex items-center gap-1 text-base text-yellow-400 font-bold shadow">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#FFD600" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span>{venue.rating}</span>
            </div>
            <div className="p-4 pt-3">
              <div className="text-white font-extrabold text-lg leading-tight mb-1 truncate flex items-center">
                {venue.name}
              </div>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2.5" fill="#FFD600"/></svg>
                <span className="text-white/80 text-sm font-normal ml-1">{venue.city}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
