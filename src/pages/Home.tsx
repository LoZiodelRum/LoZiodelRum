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
    },
  });

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-12 left-5 right-5">
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">DrinkWise</h1>
          <p className="text-primary font-heading italic text-lg mt-1">sul bere consapevole</p>
          <p className="text-white/70 text-sm mt-3 leading-relaxed">
            Esplora i migliori locali della tua città e scopri l'arte della mixology premium.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center mt-4 bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-full"
          >
            Entra nella community
          </Link>
        </div>
      </div>

      {/* Locali consigliati */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Locali consigliati</h2>
          <Link to="/mappa" className="text-primary text-xs font-medium">Vedi tutti</Link>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {venues.length > 0 ? venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          )) : (
            <>
              <div className="w-52 h-32 rounded-xl bg-card animate-pulse flex-shrink-0" />
              <div className="w-52 h-32 rounded-xl bg-card animate-pulse flex-shrink-0" />
            </>
          )}
        </div>
      </div>

      {/* Esplora Mappa CTA */}
      <div className="px-4 mt-6">
        <Link
          to="/mappa"
          className="flex items-center justify-between bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">ESPLORA MAPPA</h3>
              <p className="text-xs text-muted-foreground">Trova i locali più vicini a te</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </Link>
      </div>

      {/* Ultimi articoli */}
      <div className="px-4 mt-6">
        <h2 className="font-semibold text-base mb-3">Ultimi articoli</h2>
        <div className="space-y-3">
          <ArticleCard
            category="Cultura"
            title="L'arte dell'invecchiamento del Rum Agricole"
            readTime="5 min lettura"
          />
          <ArticleCard
            category="Mixology"
            title="I migliori 5 cocktail a base di Bourbon"
            readTime="8 min lettura"
          />
        </div>
      </div>

      {/* Il Baretto */}
      <div className="px-4 mt-8 mb-6 text-center">
        <h2 className="font-heading text-xl font-bold">Lo Zio del Rum</h2>
        <p className="text-muted-foreground text-xs mt-2 max-w-[260px] mx-auto">
          Un viaggio nel mondo degli spiriti pregiati, selezionati con cura per la tua esperienza definitiva.
        </p>
      </div>

      <div className="px-4 mb-6">
        <Link to="/baretto" className="block bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
              💬
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Il Baretto</h3>
              <p className="text-xs text-muted-foreground">Entra nella chat live</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </Link>
      </div>

      {/* Catalogo Drink */}
      <div className="px-4 mb-6">
        <Link to="/drink" className="block bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
              🍸
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Catalogo Drink</h3>
              <p className="text-xs text-muted-foreground">Esplora tutti i cocktail</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-4 pb-24 text-center">
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          © 2024 DrinkWise App. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
}

function ArticleCard({ category, title, readTime }) {
  return (
    <div className="bg-card rounded-xl p-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-bark flex-shrink-0 flex items-center justify-center">
        <span className="text-[10px] text-primary font-semibold bg-primary/20 px-1.5 py-0.5 rounded-full">
          {category}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{title}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {readTime}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Eye className="w-3 h-3" /> Approfondisci
          </span>
        </div>
      </div>
    </div>
  );
}