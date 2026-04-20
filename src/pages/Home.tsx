import "../App.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import BarettoPreview from "../components/BarettoPreview";

type Locale = {
  id: string;
  nome: string;
  citta: string;
  descrizione?: string | null;
  descrizione_completa?: string | null;
  image_url: string | null;
};

type Articolo = {
  id: string;
  titolo: string;
  immagine: string | null;
  pubblicato?: boolean;
};

const HOME_HERO_VIDEO_VERSION = "2026-04-15-07";
const heroVideoSrc = `/public/hero-video.mp4?v=${HOME_HERO_VIDEO_VERSION}`;

export default function Home() {
    // Funzioni placeholder per evitare errori di compilazione
    function saveLocaleEdit(id: string) {}
    function cancelLocaleEdit() {}
    function startLocaleEdit(l: Locale) {}
  const { isAdmin } = useUser();
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [editingLocaleId, setEditingLocaleId] = useState<string | null>(null);
  const [localeDraft, setLocaleDraft] = useState<Partial<Locale> | null>(null);
  const [savingLocaleId, setSavingLocaleId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void fetchLocali();
    void fetchArticoli();
  }, []);

  async function fetchLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("id, nome, citta, descrizione, descrizione_completa, image_url")
      .eq("status", "approved")
      .limit(6);

    if (error) {
      console.error("Errore locali:", error);
      return;
    }
    setLocali(data ?? []);
  }

  // Funzione fetchArticoli
  async function fetchArticoli() {
    const { data, error } = await supabase
      .from("Articoli")
      .select("id, titolo, immagine, pubblicato")
      .eq("pubblicato", true)
      .order("id", { ascending: false })
      .limit(4);
    if (error) {
      console.error("Errore articoli:", error);
      return;
    }
    setArticoli(data ?? []);
  }

  // Ritorno del JSX
  return (
    <div style={{ background: "#0b0b0b", minHeight: "100vh", width: "100vw" }}>
      {/* Altri contenuti della homepage qui... */}

      <div style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        background: "#181818e6",
        boxShadow: "0 -2px 16px #0008",
        padding: "10px 0 12px 0",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        zIndex: 100,
      }}>
        <Link to="/registrazione" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 80,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Utente</Link>
        <Link to="/registrazione-bartender" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 80,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Bartender</Link>
        <Link to="/registrazione-owner" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 80,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Proprietario</Link>
      </div>
    </div>
  );
}
