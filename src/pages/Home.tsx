import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Zap, ArrowRight, Clock, Eye, MapPin } from 'lucide-react';
import VenueCard from '../components/VenueCard';

export default function Home() {

  // ⚠️ DA COLLEGARE A SUPABASE
  const { data: venues = [] } = useQuery({
    queryKey: ['venues-home'],
    queryFn: async () => {
      return []; // ← placeholder temporaneo
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-preview'],
    queryFn: async () => {
      return []; // ← placeholder temporaneo

    import { useEffect, useState } from "react";
    import { Link } from "react-router-dom";
    import { MapPin, Star, ArrowRight, Menu, Bell, Search } from "lucide-react";
    import { supabase } from "../lib/supabaseClient";

    type Venue = {
      id: string;
      name: string;
      city: string;
      image: string;
      rating: number;
    };

    type Article = {
      id: string;
      image: string;
      category: string;
      title: string;
      time: string;
      link: string;
    };

    export default function Home() {
      const [venues, setVenues] = useState<Venue[]>([]);
      const [articles, setArticles] = useState<Article[]>([]);

      useEffect(() => {
        fetchVenues();
        fetchArticles();
      }, []);

      async function fetchVenues() {
        const { data, error } = await supabase
          .from("locali")
          .select("id, nome, citta, image_url, overall_rating")
          .order("overall_rating", { ascending: false })
          .limit(6);
        if (!error && data) {
          setVenues(
            data.map((l: any) => ({
              id: l.id,
              name: l.nome,
              city: l.citta,
              image: l.image_url || "/assets/venue1.jpg",
              rating: l.overall_rating ?? 4.8,
            }))
          );
        }
      }

      async function fetchArticles() {
        const { data, error } = await supabase
          .from("articoli")
          .select("id, titolo, immagine, categoria, tempo_lettura")
          .eq("pubblicato", true)
          .order("created_at", { ascending: false })
          .limit(6);
        if (!error && data) {
          setArticles(
            data.map((a: any) => ({
              id: a.id,
              image: a.immagine || "/assets/article1.jpg",
              category: a.categoria || "Cultura",
              title: a.titolo,
              time: a.tempo_lettura ? String(a.tempo_lettura) : "5",
              link: `/magazine/${a.id}`,
            }))
          );
        }
      }

      return (
        <div className="min-h-screen w-full bg-[#18120b] flex flex-col items-center pb-[80px]">
          {/* HERO */}
          <section className="w-full max-w-[390px] mx-auto relative rounded-b-3xl overflow-hidden shadow-xl bg-black">
            <img src="/assets/hero-bg.jpg" alt="DrinkWise Hero" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
            {/* Top icons */}
            <div className="absolute top-3 left-3 flex items-center z-20">
              <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
                <span className="text-xl text-yellow-500">⚡</span>
              </button>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button className="w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center">
                <Search size={18} className="text-white" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center">
                <Bell size={18} className="text-white" />
              </button>
            </div>
            {/* Content */}
            <div className="relative z-10 w-full px-6 pt-24 pb-8 flex flex-col items-start">
              <h1 className="text-3xl font-extrabold text-white leading-tight mb-1 drop-shadow-lg">DrinkWise</h1>
              <h2 className="text-lg font-semibold text-yellow-400 italic mb-3 drop-shadow">sul bere consapevole</h2>
              <p className="text-white/90 text-base mb-6 max-w-xs drop-shadow">Esplora i migliori locali della tua città e scopri l'arte della mixology premium.</p>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-7 rounded-full shadow-xl text-base transition-all w-full max-w-xs">Entra nella community</button>
            </div>
          </section>

          {/* LOCALi CONSIGLIATI */}
          <section className="w-full max-w-[390px] mx-auto bg-black pt-6 pb-2 px-0">
            <div className="flex items-center justify-between px-5 mb-3">
              <h3 className="text-white font-bold text-lg">Locali consigliati</h3>
              <Link to="/venues" className="text-yellow-500 text-base font-semibold">Vedi tutti</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar px-4">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="min-w-[240px] max-w-[240px] bg-[#18120b] rounded-2xl overflow-hidden shadow-lg relative flex-shrink-0"
                  style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
                >
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-32 object-cover"
                    style={{ borderBottomLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}
                  />
                  {/* Badge rating */}
                  <div className="absolute top-3 right-3 bg-yellow-900/90 rounded-full px-3 py-1 flex items-center gap-1 text-base text-yellow-400 font-bold shadow">
                    <Star size={16} className="text-yellow-400" fill="#FFD600" />
                    <span>{venue.rating}</span>
                  </div>
                  <div className="p-4 pt-3">
                    <div className="text-white font-extrabold text-base leading-tight mb-1 truncate flex items-center">
                      {venue.name}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                      <MapPin size={14} className="text-yellow-500" />
                      <span className="text-white/80 text-sm font-normal ml-1">{venue.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ESPLORA MAPPA */}
          <section className="w-full max-w-[390px] mx-auto px-4 pt-2 pb-6">
            <button className="w-full bg-[#3a280e] hover:bg-yellow-900/80 text-white font-bold py-5 rounded-2xl flex items-center gap-4 text-lg shadow-xl transition-all relative border-none" style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)'}}>
              <span className="flex items-center justify-center w-10 h-10 bg-[#2a1d0a] rounded-full mr-2">
                <MapPin size={22} className="text-yellow-400" />
              </span>
              <div className="flex flex-col items-start flex-1">
                <span className="font-extrabold text-white text-base leading-tight">ESPLORA MAPPA</span>
                <span className="text-white/70 text-sm font-normal mt-0.5">Trova i locali più vicini a te</span>
              </div>
              <span className="ml-auto text-yellow-400 text-2xl font-bold"><ArrowRight size={22} /></span>
            </button>
          </section>

          {/* ULTIMI ARTICOLI */}
          <section className="w-full max-w-[390px] mx-auto px-0 pt-2 pb-6">
            <h3 className="text-white font-bold text-lg mb-4 px-5">Ultimi articoli</h3>
            <div className="flex flex-col gap-4 px-4">
              {articles.map((a) => (
                <Link
                  href={a.link}
                  key={a.id}
                  className="flex gap-4 bg-[#18120b] rounded-2xl p-4 items-center shadow-lg min-h-[90px] max-w-full"
                  style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
                >
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-block bg-yellow-900/80 text-yellow-400 text-xs font-bold rounded-lg px-3 py-1 mb-2">
                      {a.category}
                    </div>
                    <div className="text-white font-extrabold text-sm leading-tight truncate mb-2">
                      {a.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <span className="flex items-center gap-1">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1"/></svg>
                        {a.time} min lettura
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h8M8 8h8"/></svg>
                        Approfondisci
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ABOUT/FOOTER */}
          <section className="w-full max-w-[390px] mx-auto px-0 pt-8 pb-32 text-center bg-black">
            <div className="flex flex-col items-center w-full">
              <div className="w-16 h-1 rounded-full bg-yellow-900/80 mb-6" />
              <h4 className="text-white font-extrabold text-lg mb-3">Lo Zio del Rum</h4>
              <p className="text-white/80 text-base mb-6 max-w-md mx-auto">Un viaggio nel mondo degli spiriti pregiati, selezionati con cura per la tua esperienza definitiva.</p>
              <div className="flex justify-center gap-6 mb-6">
                <div className="relative">
                  <img src="/assets/avatar1.png" alt="avatar1" className="w-12 h-12 rounded-full border-4 border-black object-cover" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 border-2 border-black rounded-full" />
                </div>
                <div className="relative">
                  <img src="/assets/avatar2.png" alt="avatar2" className="w-12 h-12 rounded-full border-4 border-black object-cover" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 border-2 border-black rounded-full" />
                </div>
                <div className="relative">
                  <img src="/assets/avatar3.png" alt="avatar3" className="w-12 h-12 rounded-full border-4 border-black object-cover" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-400 border-2 border-black rounded-full" />
                </div>
              </div>
              <div className="text-white/40 text-xs mt-2">
                © 2024 DRINKWISE APP. TUTTI I DIRITTI RISERVATI.
              </div>
            </div>
          </section>

          {/* BOTTOM NAV */}
          <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-black/40 z-50 flex justify-around items-center h-[70px] px-2 max-w-[390px] mx-auto" style={{boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.18)'}}>
            {[
              { label: "Home", icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 5l9 6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.5z"/><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10"/></svg>, to: "/", active: true },
              { label: "Mappa", icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6l7.5-2.5M21 6l-7.5-2.5M3 6v13l7.5 2.5M3 6l7.5 2.5M21 6v13l-7.5 2.5M21 6l-7.5 2.5M12 21v-13"/></svg>, to: "/mappa" },
              { label: "Crea", icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>, to: "/crea" },
              { label: "Community", icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/><circle cx="17" cy="11" r="4" stroke="#fff" strokeWidth="2"/></svg>, to: "/community" },
              { label: "Profilo", icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2"/><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a7 7 0 0 1 14 0v1"/></svg>, to: "/profilo" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${item.active ? 'text-yellow-400' : 'text-white/70'}`}
                aria-label={item.label}
              >
                <span className="mb-1">{item.icon}</span>
                <span className={`text-xs font-semibold ${item.active ? 'text-yellow-400' : 'text-white/70'}`}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      );
    }