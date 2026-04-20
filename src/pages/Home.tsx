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
      <div style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          background: "#111",
          borderRadius: 24,
          padding: "48px 48px 40px 48px",
          boxShadow: "0 4px 32px #0007",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 320,
          maxWidth: 420,
        }}>
          <h1 style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 48,
            marginBottom: 8,
            textAlign: "center",
          }}>Registrati</h1>
          <div style={{
            color: "#aaa",
            fontSize: 22,
            marginBottom: 32,
            textAlign: "center",
          }}>Scegli il tuo ruolo</div>
          <Link to="/registrazione" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 18,
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            width: 320,
            maxWidth: "80vw",
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Utente</Link>
          <Link to="/registrazione-bartender" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 18,
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            width: 320,
            maxWidth: "80vw",
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Bartender</Link>
          <Link to="/registrazione-owner" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 0,
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            width: 320,
            maxWidth: "80vw",
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Proprietario</Link>
        </div>
      </div>

      {/* Qui puoi aggiungere altre sezioni della homepage se necessario */}

      <div style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        background: "#181818e6",
        boxShadow: "0 -2px 16px #0008",
        padding: "18px 0 22px 0",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: 18,
        zIndex: 100,
      }}>
        <Link to="/registrazione" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 20,
          border: "none",
          borderRadius: 12,
          padding: "12px 36px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 160,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Utente</Link>
        <Link to="/registrazione-bartender" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 20,
          border: "none",
          borderRadius: 12,
          padding: "12px 36px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 160,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Bartender</Link>
        <Link to="/registrazione-owner" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 20,
          border: "none",
          borderRadius: 12,
          padding: "12px 36px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 160,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Proprietario</Link>
      </div>
    </div>
  );
}
