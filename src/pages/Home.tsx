import { useEffect, useState } from "react";
import Hero from "../components/home/Hero";
import RecommendedVenues from "../components/home/RecommendedVenues";
import ExploreMapButton from "../components/home/ExploreMapButton";
import ArticlesList from "../components/home/ArticlesList";
import AboutSection from "../components/home/AboutSection";
import BottomNav from "../components/home/BottomNav";
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
          link: `/articolo/${a.id}`,
        }))
      );
    }
  }

  return (
    <div className="bg-black min-h-screen w-full relative pb-[80px]">
      <Hero />
      <RecommendedVenues venues={venues} />
      <ExploreMapButton />
      <ArticlesList articles={articles} />
      <AboutSection />
      <BottomNav />
    </div>
  );
}