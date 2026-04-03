import "../App.css";
import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

type Locale = {
  id: string;
  nome: string;
  citta: string;
  image_url: string | null;
};

type Articolo = {
  id: string;
  titolo: string;
  immagine: string | null;
};

type Recensione = {
  id: string;
  locale_id: string;
  locale_nome?: string;
  immagine?: string;
  rating: number;
  autore: string;
};

export default function Home() {
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocali();
    fetchArticoli();
    fetchRecensioni();
  }, []);

  async function fetchLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("*")
      .eq("status", "approved")
      .limit(8);

    if (error) {
      console.error("Errore locali:", error);
      return;
    }

    setLocali((data || []).slice(0, 6));
  }

  async function fetchDrinks() {
    const [{ data: cocktailData, error: cocktailError }, { data: distillatiData, error: distillatiError }] = await Promise.all([
      supabase.from("cocktail").select("id,nome,immagine,immagine_url").limit(6),
      supabase.from("distillati").select("id,nome,categoria,immagine,immagine_url").limit(6),
    ]);

    if (cocktailError || distillatiError) {
      console.error("Errore drink:", cocktailError || distillatiError);
      return;
    }

    const cocktail = (cocktailData || []).map((c: any) => ({
      import "../App.css";
      import React from "react";
      import { useEffect, useState } from "react";
      import { supabase } from "../lib/supabaseClient";
      import { Link, useNavigate } from "react-router-dom";

      type Locale = {
        id: string;
        nome: string;
        citta: string;
        image_url: string | null;
      };

      type Articolo = {
        id: string;
        titolo: string;
        immagine: string | null;
      };

      type Recensione = {
        id: string;
        locale_id: string;
        locale_nome?: string;
        immagine?: string;
        rating: number;
        autore: string;
      };

      export default function Home() {
        const [locali, setLocali] = useState<Locale[]>([]);
        const [articoli, setArticoli] = useState<Articolo[]>([]);
        const [recensioni, setRecensioni] = useState<Recensione[]>([]);
        const [menuOpen, setMenuOpen] = useState(false);
        const navigate = useNavigate();

        useEffect(() => {
          fetchLocali();
          fetchArticoli();
          fetchRecensioni();
        }, []);

        async function fetchLocali() {
          const { data, error } = await supabase
            .from("Locali")
            .select("*")
            .eq("status", "approved")
            .limit(8);

          if (error) {
            console.error("Errore locali:", error);
            return;
          }

          setLocali((data || []).slice(0, 4));
        }

        async function fetchArticoli() {
          const { data, error } = await supabase
            .from("articoli")
            .select("*")
            .eq("pubblicato", true)
            .limit(6);

          if (error) {
            console.error("Errore articoli:", error);
            return;
          }

          setArticoli((data || []).slice(0, 4));
        }

        async function fetchRecensioni() {
          const { data, error } = await supabase
            .from("Recensioni")
            .select("*, Locali(nome, image_url)")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(4);

          if (error) {
            console.error("Errore recensioni:", error);
            return;
          }

          const mapped = (data || []).map((r: any) => ({
            id: r.id,
            locale_id: r.locale_id,
            locale_nome: r.Locali?.nome || "Locale",
            immagine: r.Locali?.image_url || null,
            rating: r.rating || 0,
            autore: r.autore || "Utente",
          }));

          setRecensioni(mapped);
        }

        function handleAdminAccess() {
          const password = window.prompt("Inserisci la password admin");

          if (password === "850877") {
            navigate("/admin/users");
          } else if (password !== null) {
            alert("Password errata");
          }
        }

        return (
          <div style={{ background: "#0b0b0b", color: "#fff", margin: 0, padding: 0, minHeight: "100vh" }}>
            <style>{`
              @media (max-width: 768px) {
                .navbar-desktop { display: none !important; }
                .navbar-mobile { display: flex !important; }
                .hero-section { padding-top: 60px !important; }
                .content-section { padding: 16px !important; }
                .section-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
                .card-box { height: 180px !important; }
              }
              @media (min-width: 769px) {
                .navbar-mobile { display: none !important; }
                .navbar-desktop { display: flex !important; }
                .menu-mobile { display: none !important; }
                .content-section { padding: 40px 60px !important; }
                .section-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 20px !important; }
                .card-box { height: 220px !important; }
              }
            `}</style>