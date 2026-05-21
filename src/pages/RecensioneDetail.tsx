import "../App.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type ReviewDetail = {
  id: string;
  locale_id?: string | null;
  rating?: number | null;
  overall_rating?: number | null;
  autore?: string | null;
  author_name?: string | null;
  commento?: string | null;
  content?: string | null;
  descrizione?: string | null;
  titolo?: string | null;
  title?: string | null;
  visit_date?: string | null;
  created_at?: string | null;
};

type ReviewLocale = {
  nome?: string | null;
  image_url?: string | null;
  image?: string | null;
  citta?: string | null;
  indirizzo?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Data non disponibile";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Data non disponibile";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export default function RecensioneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [reviewLocale, setReviewLocale] = useState<ReviewLocale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadReview();
  }, [id]);

  async function loadReview() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("Recensioni")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Errore caricamento recensione:", error);
      setReview(null);
      setLoading(false);
      return;
    }

    setReview(data as ReviewDetail);

    const localeId = (data as ReviewDetail)?.locale_id;
    if (localeId) {
      const { data: localeData, error: localeError } = await supabase
        .from("Locali")
        .select("nome, image_url, image, citta, indirizzo")
        .eq("id", localeId)
        .single();

      if (localeError) {
        console.error("Errore caricamento locale recensione:", localeError);
        setReviewLocale(null);
      } else {
        setReviewLocale(localeData as ReviewLocale);
      }
    } else {
      setReviewLocale(null);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="page fade-in">Caricamento recensione...</div>;
  }

  if (!review) {
    return (
      <div className="page fade-in" style={{ color: "#fff" }}>
        <h1 style={{ marginBottom: 12 }}>Recensione non trovata</h1>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Torna indietro
        </button>
      </div>
    );
  }

  const venueName = reviewLocale?.nome || "Locale";
  const venueImage = reviewLocale?.image_url || reviewLocale?.image || "https://via.placeholder.com/1600x900";
  const venueCity = reviewLocale?.citta || "";
  const venueAddress = reviewLocale?.indirizzo || "";
  const title = review.titolo || review.title || `Recensione di ${venueName}`;
  const content = review.commento || review.content || review.descrizione || "Nessun testo disponibile.";
  const author = review.autore || review.author_name || "Utente";
  const dateValue = review.visit_date || review.created_at;

  return (
    <div className="fade-in" style={{ background: "#0b0b0b", color: "#fff", minHeight: "100vh" }}>
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "52vh",
          backgroundImage: `url(${venueImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.25))",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "28px clamp(16px, 4vw, 56px)" }}>
          <button
            className="btn-primary"
            onClick={() => navigate(-1)}
            style={{ marginBottom: 18 }}
          >
            Torna indietro
          </button>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 52px)", color: "#fff" }}>{venueName}</h1>
          <p style={{ marginTop: 8, color: "#e5e5e5" }}>{[venueCity, venueAddress].filter(Boolean).join(" - ")}</p>
        </div>
      </section>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 56px" }}>
        <div
          style={{
            background: "#111",
            border: "1px solid #232323",
            borderRadius: 16,
            padding: "20px clamp(16px, 3.5vw, 30px)",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(22px, 3vw, 34px)" }}>{title}</h2>
          </div>

          <p style={{ color: "#c9c9c9", marginBottom: 18 }}>{`Di ${author} - ${formatDate(dateValue)}`}</p>
          <p style={{ color: "#ececec", margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{content}</p>
        </div>
      </section>
    </div>
  );
}