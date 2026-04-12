import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

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
};

type Recensione = {
  id: string;
  locale_id: string;
  locale_nome?: string;
  immagine?: string | null;
  rating: number;
  autore: string;
};

type RecensioneRow = {
  id: string;
  locale_id?: string | null;
  rating?: number | null;
  overall_rating?: number | null;
  autore?: string | null;
  author_name?: string | null;
  created_at?: string | null;
  created_date?: string | null;
};

export default function Home() {
  const { isAdmin } = useUser();
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [editingLocaleId, setEditingLocaleId] = useState<string | null>(null);
  const [localeDraft, setLocaleDraft] = useState<Partial<Locale> | null>(null);
  const [savingLocaleId, setSavingLocaleId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void fetchLocali();
    void fetchArticoli();
    void fetchRecensioni();
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

  function startLocaleEdit(locale: Locale) {
    setEditingLocaleId(locale.id);
    setLocaleDraft({
      nome: locale.nome || "",
      citta: locale.citta || "",
      descrizione: locale.descrizione || "",
      descrizione_completa: locale.descrizione_completa || "",
    });
  }

  function cancelLocaleEdit() {
    setEditingLocaleId(null);
    setLocaleDraft(null);
  }

  async function saveLocaleEdit(localeId: string) {
    if (!localeDraft) return;

    const adminPassword =
      localStorage.getItem("adminPassword") ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      "";

    if (!adminPassword) {
      alert("Password admin non disponibile. Esci e rientra come admin.");
      return;
    }

    const changes = {
      nome: (localeDraft.nome || "").trim(),
      citta: (localeDraft.citta || "").trim(),
      descrizione: (localeDraft.descrizione || "").trim() || null,
      descrizione_completa: (localeDraft.descrizione_completa || "").trim() || null,
    };

    if (!changes.nome) {
      alert("Il nome del locale non puo essere vuoto.");
      return;
    }

    setSavingLocaleId(localeId);

    const endpoints = [
      "/api/admin-save-locale",
      "/.netlify/functions/admin-save-locale",
    ];

    let lastMessage = "Salvataggio locale fallito lato server.";

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword,
          },
          body: JSON.stringify({
            mode: "update",
            id: localeId,
            changes,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.ok) {
          lastMessage = "";
          break;
        }

        lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
      } catch (e: any) {
        lastMessage = e?.message || `Errore di rete su ${endpoint}`;
      }
    }

    setSavingLocaleId(null);

    if (lastMessage) {
      alert(lastMessage);
      return;
    }

    setLocali((prev) =>
      prev.map((locale) =>
        locale.id === localeId
          ? {
              ...locale,
              ...changes,
            }
          : locale
      )
    );

    cancelLocaleEdit();
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

    setArticoli(data ?? []);
  }

  async function fetchRecensioni() {
    const loadRows = async () => {
      const primary = await supabase
        .from("Recensioni")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!primary.error) return primary;

      const noOrder = await supabase
        .from("Recensioni")
        .select("*")
        .limit(6);

      if (!noOrder.error) return noOrder;

      const lowerCase = await supabase
        .from("recensioni")
        .select("*")
        .limit(6);

      return lowerCase;
    };

    const { data, error } = await loadRows();

    if (error) {
      console.error("Errore recensioni:", error);
      setRecensioni([]);
      return;
    }

    const rows = (data ?? []) as RecensioneRow[];
    const localeIds = Array.from(new Set(rows.map((r) => r.locale_id).filter(Boolean)));

    let localeById: Record<string, { nome?: string | null; image_url?: string | null; image?: string | null }> = {};
    if (localeIds.length) {
      const { data: localiData, error: localiError } = await supabase
        .from("Locali")
        .select("id, nome, image_url, image")
        .in("id", localeIds);

      if (localiError) {
        console.error("Errore lookup locali recensioni:", localiError);
      } else {
        localeById = (localiData ?? []).reduce((acc: any, locale: any) => {
          acc[locale.id] = locale;
          return acc;
        }, {});
      }
    }

    const mapped = rows.map((r) => ({
      id: r.id,
      locale_id: r.locale_id ?? "",
      locale_nome: (r.locale_id && localeById[r.locale_id]?.nome) ?? "Locale",
      immagine: (r.locale_id && (localeById[r.locale_id]?.image_url ?? localeById[r.locale_id]?.image)) ?? null,
      rating: r.rating ?? r.overall_rating ?? 0,
      autore: r.autore ?? r.author_name ?? "Utente",
    }));

    setRecensioni(mapped);
  }

  const reviewStats = useMemo(() => {
    const total = recensioni.length;
    const sum = recensioni.reduce((acc, item) => acc + (Number.isFinite(item.rating) ? item.rating : 0), 0);
    const average = total ? sum / total : 0;
    const normalizedAverage = Math.max(0, Math.min(5, average));

    const distribution = [
      { label: "Eccellente", stars: 5, count: 0 },
      { label: "Buono", stars: 4, count: 0 },
      { label: "Nella media", stars: 3, count: 0 },
      { label: "Scarso", stars: 2, count: 0 },
      { label: "Terribile", stars: 1, count: 0 },
    ];

    recensioni.forEach((item) => {
      const value = Number.isFinite(item.rating) ? item.rating : 0;
      const rounded = Math.min(5, Math.max(1, Math.round(value)));
      const bucket = distribution.find((entry) => entry.stars === rounded);
      if (bucket) bucket.count += 1;
    });

    const maxCount = distribution.reduce((acc, item) => Math.max(acc, item.count), 0);

    const ratingLabel =
      normalizedAverage >= 4.5
        ? "Eccellente"
        : normalizedAverage >= 3.8
          ? "Buono"
          : normalizedAverage >= 3
            ? "Nella media"
            : normalizedAverage >= 2
              ? "Scarso"
              : "Terribile";

    return {
      total,
      average: normalizedAverage,
      ratingLabel,
      distribution,
      maxCount,
    };
  }, [recensioni]);

  return (
    <div
      style={{
        background: "#0b0b0b",
        color: "#fff",
        margin: 0,
        padding: 0,
        minHeight: "100vh",
      }}
    >
      <style>{`
        .home-review-box {
          background: #f2f3f2;
          border-radius: 8px;
          padding: 8px 10px;
          color: #163f28;
          max-width: 570px;
          margin: 0 auto;
        }

        .home-review-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 3px;
        }

        .home-review-title {
          margin: 0;
          color: #163f28;
          font-size: clamp(10px, 1.1vw, 14px);
        }

        .home-review-write-btn {
          border: 1px solid #184d2f;
          background: #0b5f2e;
          color: #fff;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          padding: 5px 9px;
          transition: filter 0.2s ease;
        }

        .home-review-write-btn:hover {
          filter: brightness(1.05);
        }

        .home-review-links {
          margin-bottom: 8px;
        }

        .home-review-link {
          color: #163f28;
          font-weight: 600;
          text-decoration: underline;
          font-size: clamp(9px, 0.9vw, 12px);
        }

        .home-review-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          align-items: start;
        }

        .home-review-left {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px;
          align-items: start;
        }

        .home-review-score {
          text-align: center;
          min-width: 48px;
        }

        .home-review-score-value {
          margin: 0;
          color: #0f5130;
          font-size: clamp(20px, 2.1vw, 28px);
          line-height: 1;
          font-weight: 700;
        }

        .home-review-score-label {
          margin: 3px 0 0;
          color: #184d2f;
          font-size: clamp(9px, 0.85vw, 12px);
          font-weight: 700;
        }

        .home-review-dots {
          margin-top: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3px;
          color: #184d2f;
          font-size: clamp(8px, 0.8vw, 10px);
        }

        .home-review-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #138a3b;
          display: inline-block;
        }

        .home-review-total {
          opacity: 0.85;
          font-weight: 500;
        }

        .home-review-distribution {
          display: grid;
          gap: 4px;
          margin-top: 2px;
        }

        .home-review-dist-row {
          display: grid;
          grid-template-columns: 54px 1fr 16px;
          gap: 4px;
          align-items: center;
        }

        .home-review-dist-label,
        .home-review-dist-count {
          font-size: clamp(8px, 0.8vw, 10px);
          color: #184d2f;
        }

        .home-review-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: #d9ddd9;
          overflow: hidden;
        }

        .home-review-fill {
          height: 100%;
          border-radius: 999px;
          background: #138a3b;
        }

        .home-review-right {
          border-left: 1px solid #d7dbd7;
          padding-left: 9px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 8px;
        }

        .home-review-metric-label {
          margin: 0 0 3px;
          color: #184d2f;
          font-size: clamp(8px, 0.8vw, 10px);
          font-weight: 700;
        }

        .home-review-metric-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4px;
          align-items: center;
        }

        .home-review-metric-score {
          color: #184d2f;
          font-size: clamp(8px, 0.8vw, 10px);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .home-review-box {
            border-radius: 10px;
            padding: 10px 8px;
            margin-left: 16px;
            margin-right: 16px;
          }

          .home-review-title {
            font-size: 13px;
            font-weight: 800;
          }

          .home-review-link {
            font-size: 11px;
            font-weight: 700;
          }

          .home-review-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .home-review-write-btn {
            width: 100%;
            font-size: 12px;
            font-weight: 800;
            padding: 6px 8px;
          }

          .home-review-content {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .home-review-left {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .home-review-score {
            text-align: left;
            min-width: 0;
          }

          .home-review-score-value {
            font-size: 27px;
          }

          .home-review-score-label {
            font-size: 13px;
            font-weight: 800;
          }

          .home-review-dots {
            justify-content: flex-start;
          }

          .home-review-dist-row {
            grid-template-columns: 54px 1fr 16px;
            gap: 4px;
          }

          .home-review-dist-label,
          .home-review-dist-count,
          .home-review-metric-score,
          .home-review-metric-label {
            font-size: 11px;
            font-weight: 700;
          }

          .home-review-track {
            height: 7px;
          }

          .home-review-right {
            border-left: none;
            border-top: 1px solid #d7dbd7;
            padding-left: 0;
            padding-top: 7px;
            grid-template-columns: 1fr;
            gap: 5px;
          }

          .home-review-right > div {
            display: grid;
            grid-template-columns: 56px 1fr auto;
            align-items: center;
            gap: 4px;
          }

          .home-review-metric-label {
            margin: 0;
            white-space: nowrap;
          }

          .home-review-metric-row {
            display: contents;
          }

          .hero-section {
            display: flex !important;
            min-height: 84vh !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 88px !important;
            align-items: flex-start !important;
          }
          .hero-mobile-content { margin-top: 34px !important; padding-bottom: 10px !important; }
          .hero-mobile-badge {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            border: 1px solid rgba(245, 166, 35, 0.35) !important;
            background: rgba(245, 166, 35, 0.14) !important;
            color: #f5a623 !important;
            border-radius: 999px !important;
            width: fit-content !important;
            font-size: 12px !important;
            padding: 6px 10px !important;
            margin: 0 auto 16px auto !important;
          }
          .hero-mobile-title { font-size: clamp(28px, 7.2vw, 38px) !important; line-height: 1.08 !important; }
          .hero-mobile-title span {
            font-size: inherit !important;
            line-height: inherit !important;
            font-weight: inherit !important;
          }
          .hero-mobile-title-line {
            display: block !important;
            white-space: nowrap !important;
          }
          .hero-mobile-subtitle {
            font-size: clamp(14px, 5vw, 20px) !important;
            line-height: 1.4 !important;
            max-width: 300px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-mobile-buttons {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            margin-top: 34px !important;
            margin-bottom: 88px !important;
          }
          .hero-mobile-buttons {
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
          }
          .hero-mobile-btn {
            width: 52% !important;
            justify-content: flex-start !important;
            font-size: 0.7rem !important;
            padding: 8px 16px !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .content-section {
            padding: 10px 2px !important;
            max-width: 100% !important;
          }
          .content-section-first { padding-top: 104px !important; margin-top: 76px !important; }
          .section-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 0 2px !important;
          }
          .card-box {
            width: calc(100vw - 8px) !important;
            max-width: none !important;
            margin: 0 auto !important;
            height: auto !important;
            aspect-ratio: 16 / 10 !important;
            border-radius: 18px !important;
          }
          .section-header { margin-bottom: 16px !important; }
          .section-title { font-size: clamp(16px, 4.5vw, 20px) !important; line-height: 1.08 !important; }
          .community-section h2 { font-size: clamp(16px, 4.5vw, 20px) !important; }
          .community-section p { font-size: clamp(11px, 3vw, 13px) !important; }
          .section-subtitle { display: block !important; color: #8f8f8f !important; margin-top: 6px !important; font-size: clamp(14px, 3.8vw, 16px) !important; }
          .section-link { display: none !important; }
          .card-title { font-size: clamp(11px, 3.2vw, 14px) !important; line-height: 1.15 !important; }
          .card-subtitle { font-size: clamp(10px, 2.8vw, 12px) !important; }
          .card-rating { font-size: clamp(10px, 2.8vw, 12px) !important; padding: 4px 8px !important; top: 8px !important; right: 8px !important; }
          .card-content { padding: 10px !important; }
          .card-title-clamp {
            display: -webkit-box !important;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Solo Locali: box piu larghi su mobile, testo invariato */
          .locali-section {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .locali-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .locali-card {
            width: 100% !important;
            min-height: 220px !important;
            aspect-ratio: 16 / 10 !important;
            border-radius: 18px !important;
          }
        }

        @media (max-width: 1024px) {
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .card-box { border-radius: 20px !important; }
        }

        @media (min-width: 390px) and (max-width: 430px) {
          .content-section { padding: 10px 2px !important; }
          .section-grid { gap: 12px !important; }
          .section-title { font-size: 18px !important; }
          .card-box { border-radius: 16px !important; }
          .card-title { font-size: 13px !important; }
          .card-subtitle { font-size: 10px !important; }
          .card-content { padding: 10px !important; }
          .card-title-clamp {
            -webkit-line-clamp: 3;
          }
        }

        @media (max-width: 380px) {
          .hero-mobile-title { font-size: 32px !important; }
          .hero-mobile-btn { font-size: 0.65rem !important; padding: 7px 14px !important; }
          .content-section { padding: 10px 2px !important; }
          .section-grid { gap: 10px !important; }
          .card-box { border-radius: 14px !important; }
          .card-title { font-size: 11px !important; }
          .card-subtitle { font-size: 10px !important; }
          .card-content { padding: 8px !important; }
          .card-rating { font-size: 10px !important; padding: 3px 6px !important; }
          .card-title-clamp {
            -webkit-line-clamp: 3;
          }
        }

        @media (min-width: 769px) {
          .content-section { padding: 40px 60px !important; }
          .content-section-first { margin-top: 68px !important; }
          .section-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 20px !important; }
          .card-box { height: 220px !important; aspect-ratio: auto !important; }
        }
      `}</style>

      <div
        className="hero-section"
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundImage: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 0,
          borderRadius: 0,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.9))" }} />
        <div className="hero-mobile-content" style={{ position: "relative", zIndex: 2, maxWidth: "90%", padding: "0 20px" }}>
          <p className="hero-mobile-badge" style={{ display: "none" }}>La community del bere consapevole</p>
          <h1 className="hero-mobile-title" style={{ fontSize: "clamp(28px, 7vw, 48px)", marginBottom: 20, fontWeight: 800, lineHeight: 1.2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <span className="hero-mobile-title-line" style={{ color: "#ffffff" }}>Scopri i migliori</span>
            <span className="hero-mobile-title-line" style={{ color: "#f5a623" }}>locali del mondo</span>
          </h1>
          <p className="hero-mobile-subtitle" style={{ opacity: 0.85, marginBottom: 30, fontSize: "clamp(14px, 2.5vw, 18px)" }}>
            Recensioni autentiche, esperienze uniche, cultura del bere. Trova cocktail bar, rum bar e locali d'eccellenza nella tua citta.
          </p>
          <div className="hero-mobile-buttons" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="hero-mobile-btn"
              onClick={() => navigate("/venues")}
              style={{
                background: "#f5a623",
                color: "#0b0b0b",
                border: "none",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ArrowRight size={20} strokeWidth={2.5} />
              Esplora Locali
            </button>
            <button
              className="hero-mobile-btn"
              onClick={() => navigate("/mappa")}
              style={{
                background: "#f5a623",
                color: "#0b0b0b",
                border: "none",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MapPin size={20} strokeWidth={2.5} />
              Vedi Mappa
            </button>
          </div>
        </div>
      </div>

      <section className="content-section content-section-first locali-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "68px auto 0" }}>
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Locali in evidenza</h2>
          </div>
          <Link className="section-link" to="/venues" style={{ color: "#f5a623", textDecoration: "none" }}>Vedi tutti</Link>
        </div>
        <div className="section-grid locali-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
          {locali.map((l) => (
            <article
              key={l.id}
              className="card-box locali-card"
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                textDecoration: "none",
                height: 220,
                display: "flex",
                alignItems: "flex-end",
                color: "#fff",
              }}
            >
              {editingLocaleId === l.id && localeDraft ? (
                <>
                  <img src={l.image_url ?? "https://via.placeholder.com/400x300"} alt={l.nome} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.55))", zIndex: 1 }} />
                  <div style={{ position: "relative", zIndex: 2, width: "100%", padding: 12, display: "grid", gap: 8 }}>
                    <input
                      value={localeDraft.nome ?? ""}
                      onChange={(e) => setLocaleDraft((prev) => ({ ...(prev || {}), nome: e.target.value }))}
                      placeholder="Nome locale"
                      style={{ borderRadius: 8, border: "1px solid #334155", background: "rgba(2,6,23,0.72)", color: "#fff", padding: "6px 8px", fontSize: 13 }}
                    />
                    <input
                      value={localeDraft.citta ?? ""}
                      onChange={(e) => setLocaleDraft((prev) => ({ ...(prev || {}), citta: e.target.value }))}
                      placeholder="Citta"
                      style={{ borderRadius: 8, border: "1px solid #334155", background: "rgba(2,6,23,0.72)", color: "#fff", padding: "6px 8px", fontSize: 13 }}
                    />
                    <textarea
                      value={localeDraft.descrizione ?? ""}
                      onChange={(e) => setLocaleDraft((prev) => ({ ...(prev || {}), descrizione: e.target.value }))}
                      placeholder="Testo breve"
                      rows={2}
                      style={{ borderRadius: 8, border: "1px solid #334155", background: "rgba(2,6,23,0.72)", color: "#fff", padding: "6px 8px", fontSize: 12, resize: "none" }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => saveLocaleEdit(l.id)}
                        disabled={savingLocaleId === l.id}
                        style={{ border: "none", borderRadius: 8, background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 12, padding: "6px 10px", cursor: "pointer", opacity: savingLocaleId === l.id ? 0.7 : 1 }}
                      >
                        {savingLocaleId === l.id ? "Salvataggio..." : "Salva"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelLocaleEdit}
                        style={{ border: "1px solid #64748b", borderRadius: 8, background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 600, fontSize: 12, padding: "6px 10px", cursor: "pointer" }}
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={`/venue/${l.id}`}
                    style={{ position: "absolute", inset: 0, zIndex: 1 }}
                    aria-label={`Apri scheda ${l.nome}`}
                  />
                  <img src={l.image_url ?? "https://via.placeholder.com/400x300"} alt={l.nome} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", zIndex: 2 }} />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => startLocaleEdit(l)}
                      style={{ position: "absolute", top: 10, left: 10, zIndex: 3, border: "none", borderRadius: 8, background: "rgba(245,166,35,0.95)", color: "#111", fontWeight: 700, fontSize: 12, padding: "6px 10px", cursor: "pointer" }}
                    >
                      Modifica
                    </button>
                  )}
                  <div className="card-content" style={{ position: "relative", zIndex: 3, padding: 16, width: "100%" }}>
                    <h3 className="card-title" style={{ margin: "0 0 4px 0", fontSize: 18 }}>{l.nome}</h3>
                    <p className="card-subtitle" style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{l.citta}</p>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 className="section-title" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Ultimi Articoli</h2>
        </div>
        <div className="section-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
          {articoli.map((a) => (
            <Link
              key={a.id}
              to={`/magazine/${a.id}`}
              className="card-box"
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                textDecoration: "none",
                height: 220,
                display: "flex",
                alignItems: "flex-end",
                color: "#fff",
              }}
            >
              <img src={a.immagine ?? "https://via.placeholder.com/400x300"} alt={a.titolo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(0.9)", transformOrigin: "center", zIndex: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 35%, transparent 65%)", zIndex: 1 }} />
              <div className="card-content" style={{ position: "relative", zIndex: 2, padding: "16px 16px 8px 16px", width: "100%" }}>
                <h3 className="card-title card-title-clamp" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{a.titolo}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div className="home-review-box">
          <div className="home-review-top">
            <h2 className="home-review-title">Recensioni</h2>
            <button className="home-review-write-btn" onClick={() => navigate("/community")}>Scrivi una recensione</button>
          </div>

          <div className="home-review-links">
            <Link className="home-review-link" to="/community">Tutte le recensioni ({reviewStats.total})</Link>
          </div>

          <div className="home-review-content">
            <div className="home-review-left">
              <div className="home-review-score">
                <p className="home-review-score-value">{reviewStats.average.toFixed(1).replace(".", ",")}</p>
                <p className="home-review-score-label">{reviewStats.ratingLabel}</p>
                <div className="home-review-dots" aria-label={`Valutazione media ${reviewStats.average.toFixed(1)} su 5`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="home-review-dot" style={{ opacity: index < Math.round(reviewStats.average) ? 1 : 0.28 }} />
                  ))}
                  <span className="home-review-total">({reviewStats.total})</span>
                </div>
              </div>

              <div className="home-review-distribution">
                {reviewStats.distribution.map((row) => {
                  const ratio = reviewStats.maxCount > 0 ? (row.count / reviewStats.maxCount) * 100 : 0;
                  return (
                    <div key={row.label} className="home-review-dist-row">
                      <span className="home-review-dist-label">{row.label}</span>
                      <div className="home-review-track">
                        <div className="home-review-fill" style={{ width: `${ratio}%` }} />
                      </div>
                      <span className="home-review-dist-count">{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="home-review-right">
              {[
                { label: "Servizio", value: reviewStats.average },
                { label: "Cibo", value: reviewStats.average },
                { label: "Qualita/prezzo", value: reviewStats.average },
                { label: "Atmosfera", value: reviewStats.average },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="home-review-metric-label">{metric.label}</p>
                  <div className="home-review-metric-row">
                    <div className="home-review-track">
                      <div className="home-review-fill" style={{ width: `${(Math.max(0, Math.min(5, metric.value)) / 5) * 100}%` }} />
                    </div>
                    <span className="home-review-metric-score">{metric.value.toFixed(1).replace(".", ",")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-section community-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", marginBottom: 16, fontWeight: 800 }}>Unisciti alla community</h2>
        <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#aaa", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Condividi le tue esperienze, scopri nuovi locali e contribuisci alla cultura del bere consapevole.
        </p>
        <button onClick={() => navigate("/crea")} style={{ background: "#f5a623", color: "#0b0b0b", border: "none", padding: "14px 32px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 16 }}>
          Inizia a recensire
        </button>
      </section>

      <div style={{ height: 60 }} />
    </div>
  );
}
