import "../App.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext"; // ✅ AGGIUNTO

type Locale = {
  id: string;
  nome: string;
  indirizzo: string;
  citta: string;
  provincia: string;
  paese: string;
  telefono: string;
  sito: string;
  instagram: string;
  tiktok?: string;
  descrizione: string;
  descrizione_completa: string;
  image: string;
  image_url: string;
  video_url?: string;
  categoria?: string;
  orari: string;
  price_range: string;
  verificato?: boolean | string | number;
  in_evidenza?: boolean | string | number;

  qualita_drink: string;
  competenza_staff: string;
  atmosfera: string;
  qualita_prezzo: string;
};

type Recensione = {
  id: string;
  locale_id: string;
  commento: string;
  created_at: string;
  autore?: string | null;
  rating?: number | null;
  overall_rating?: number | null;
  rating_generale?: number | null;
  servizio?: number | null;
  qualita_drink?: number | null;
  qualita_prezzo?: number | null;
  atmosfera?: number | null;
  tags?: string[] | null;
};

type Media = {
  id: string;
  entity_id: string;
  entity_type: string;
  url_file: string;
  tipo: string; // image | video
  approvato: boolean;
};

const REVIEWS_RESET_AT = "2026-04-12T00:00:00.000Z";

export default function VenueDetail() {
  const { id } = useParams();
  const { isAdmin, user } = useUser();

  const [locale, setLocale] = useState<Locale | null>(null);
  const [form, setForm] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    ratingGenerale: 0,
    comment: "",
    servizio: 0,
    qualitaDrink: 0,
    qualitaPrezzo: 0,
    atmosfera: 0,
    tags: [] as string[],
    agreeToTerms: false,
  });
  const [reviewUploading, setReviewUploading] = useState(false);

  useEffect(() => {
    fetchLocale();
    fetchRecensioni();
    fetchMedia();
  }, []);

  useEffect(() => {
    setImageLoadError(false);
  }, [locale?.id, locale?.image_url, locale?.image]);

  function normalizeImageUrl(value?: string | null) {
    const raw = (value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("blob:") || raw.startsWith("/")) {
      return raw;
    }
    if (raw.startsWith("//")) return `https:${raw}`;
    if (raw.startsWith("www.")) return `https://${raw}`;
    return `https://${raw}`;
  }

  async function fetchLocale() {
    const { data } = await supabase
      .from("Locali")
      .select("*")
      .eq("id", id)
      .single();

    setLocale(data);
    setForm(data);
  }

  async function fetchRecensioni() {
    const { data } = await supabase
      .from("Recensioni")
      .select("*")
      .eq("locale_id", id)
      .gte("created_at", REVIEWS_RESET_AT)
      .order("created_at", { ascending: false });

    if (data) setRecensioni(data);
  }

  async function fetchMedia() {
    const { data } = await supabase
      .from("Media")
      .select("*")
      .eq("entity_id", id)
      .eq("entity_type", "locale")
      .eq("approvato", true);

    if (data) setMedia(data);
  }

  async function handleSave() {
    const adminPassword =
      localStorage.getItem("adminPassword") ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      "";

    let error: any = null;

    const normalizedImage = normalizeImageUrl(form.image_url || form.image);

    if (adminPassword) {
      const isNetlifyHost = typeof window !== "undefined" && window.location.hostname.includes("netlify");
      const endpoints = isNetlifyHost
        ? ["/.netlify/functions/admin-save-locale", "/api/admin-save-locale"]
        : ["/api/admin-save-locale", "/.netlify/functions/admin-save-locale"];

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
              id: form.id,
              changes: {
                ...form,
                image: normalizedImage,
                image_url: normalizedImage,
              },
            }),
          });

          const payload = await response.json().catch(() => ({}));
          if (response.ok && payload?.ok) {
            lastMessage = "";
            break;
          }

          lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;

          // Fallback to the alternate platform endpoint only when route is missing.
          if (response.status !== 404) {
            break;
          }
        } catch (e: any) {
          lastMessage = e?.message || `Errore di rete su ${endpoint}`;
        }
      }

      if (lastMessage) {
        error = { message: lastMessage };
      }
    } else {
      const result = await supabase
        .from("Locali")
        .update({
          ...form,
          image: normalizedImage,
          image_url: normalizedImage,
        })
        .eq("id", form.id);

      error = result.error;
    }

    if (error) {
      alert(`Errore salvataggio: ${error?.message || "sconosciuto"}`);
      return;
    }

    setLocale(form);
    setIsEditorOpen(false);
    alert("Salvato ✅");
  }

  async function handleDelete() {
    const ok = confirm("Eliminare locale?");
    if (!ok) return;

    const adminPassword =
      localStorage.getItem("adminPassword") ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      "";

    let error: any = null;

    if (adminPassword) {
      const endpoints = [
        "/api/admin-save-locale",
        "/.netlify/functions/admin-save-locale",
      ];

      let lastMessage = "Eliminazione locale fallita lato server.";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": adminPassword,
            },
            body: JSON.stringify({
              mode: "delete",
              id: form.id,
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

      if (lastMessage) {
        error = { message: lastMessage };
      }
    } else {
      const result = await supabase.from("Locali").delete().eq("id", form.id);
      error = result.error;
    }

    if (error) {
      alert(error.message || "Errore eliminazione");
      return;
    }

    window.location.href = "/";
  }

  async function handleImageUpload(file: File) {
    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("drink-images")
      .upload(fileName, file);

    if (error) {
      alert("Errore upload");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("drink-images")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    setForm({
      ...form,
      image: url,
      image_url: url,
    });

    setUploading(false);
  }

  async function handleReviewPhotoUpload(file: File) {
    if (!file) return;

    setReviewUploading(true);

    const fileName = `review-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("drink-images")
      .upload(fileName, file);

    if (error) {
      alert("Errore upload foto");
      setReviewUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("drink-images")
      .getPublicUrl(fileName);

    setReviewUploading(false);
  }

  async function handleReviewSubmit() {
    if (!user && !isAdmin) {
      alert("Devi essere loggato per scrivere una recensione");
      return;
    }

    if (!reviewForm.agreeToTerms) {
      alert("Devi accettare i termini");
      return;
    }

    if (reviewForm.ratingGenerale === 0) {
      alert("Seleziona una valutazione generale");
      return;
    }

    // Calcola media delle valutazioni dettagliate
    const avgDetailed = reviewForm.servizio && reviewForm.qualitaDrink && reviewForm.qualitaPrezzo && reviewForm.atmosfera
      ? (reviewForm.servizio + reviewForm.qualitaDrink + reviewForm.qualitaPrezzo + reviewForm.atmosfera) / 4
      : reviewForm.ratingGenerale;

    const { error } = await supabase.from("Recensioni").insert({
      locale_id: id,
      commento: reviewForm.comment,
      overall_rating: reviewForm.ratingGenerale,
      rating: avgDetailed,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Errore salvataggio:", error);
      alert(`Errore salvataggio: ${error.message}`);
      return;
    }

    alert("Recensione pubblicata! ✅");
    setIsReviewModalOpen(false);
    setReviewForm({
      ratingGenerale: 0,
      comment: "",
      servizio: 0,
      qualitaDrink: 0,
      qualitaPrezzo: 0,
      atmosfera: 0,
      tags: [],
      agreeToTerms: false,
    });

    // Refresh reviews
    fetchRecensioni();
  }

  if (!locale) return <div className="page fade-in">Caricamento...</div>;

  const placeholder = (value: string | null | undefined, label: string) =>
    value && value !== "" ? value : `Non disponibile (${label})`;

  const toBool = (value: unknown) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return ["1", "true", "si", "s", "yes", "y", "on"].includes(normalized);
    }
    return false;
  };

  const giudizio = (value: string | null | undefined) => {
    const map: Record<string, string> = { "1": "Scarsa", "2": "Discreta", "3": "Buona", "4": "Ottima", "5": "Eccellente" };
    if (!value || value === "") return "Non valutato";
    return map[value] ?? value;
  };

  const firstMediaImage = normalizeImageUrl(media.find((m) => m.tipo === "foto")?.url_file || "");
  const placeholderHero = "https://via.placeholder.com/1600x900?text=Lo+Zio+del+Rum";
  const imageMain = normalizeImageUrl(locale.image_url) || normalizeImageUrl(locale.image) || firstMediaImage;
  const videoMain =
    locale.video_url || media.find((m) => m.tipo === "video")?.url_file || "";
  const categoria = locale.categoria || "Categoria non disponibile";
  const fullAddress = [locale.indirizzo, locale.citta, locale.provincia, locale.paese]
    .filter(Boolean)
    .join(", ");
  const verified = toBool(locale.verificato);
  const featured = toBool(locale.in_evidenza);
  const website = locale.sito?.startsWith("http") ? locale.sito : locale.sito ? `https://${locale.sito}` : "";
  const editorLabelStyle = { color: "#f5a623", fontSize: 12, display: "block", marginBottom: 4 };
  const editorFieldStyle = { borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" };
  const sectionTitleStyle = { color: "#f5a623" };

  const parseScore = (value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(5, parsed));
  };

  // Calcola rating generale da rating_generale o da media delle 4 categorie
  const ratedReviews = recensioni
    .map((rec) => {
      const general = parseScore(rec.rating_generale ?? rec.overall_rating ?? rec.rating);
      if (general > 0) return general;
      const avg = (parseScore(rec.servizio) + parseScore(rec.qualita_drink) + parseScore(rec.qualita_prezzo) + parseScore(rec.atmosfera)) / 4;
      return avg > 0 ? avg : 0;
    })
    .filter((score) => score > 0);

  const reviewAverage = ratedReviews.length
    ? ratedReviews.reduce((acc, score) => acc + score, 0) / ratedReviews.length
    : 0;

  // Calcola medie per categoria
  const avgServizio = recensioni.length
    ? recensioni.map((r) => parseScore(r.servizio)).filter(s => s > 0).reduce((a, b) => a + b, 0) / 
      recensioni.filter(r => parseScore(r.servizio) > 0).length || 0
    : 0;

  const avgQualitaDrink = recensioni.length
    ? recensioni.map((r) => parseScore(r.qualita_drink)).filter(s => s > 0).reduce((a, b) => a + b, 0) / 
      recensioni.filter(r => parseScore(r.qualita_drink) > 0).length || 0
    : 0;

  const avgQualitaPrezzo = recensioni.length
    ? recensioni.map((r) => parseScore(r.qualita_prezzo)).filter(s => s > 0).reduce((a, b) => a + b, 0) / 
      recensioni.filter(r => parseScore(r.qualita_prezzo) > 0).length || 0
    : 0;

  const avgAtmosfera = recensioni.length
    ? recensioni.map((r) => parseScore(r.atmosfera)).filter(s => s > 0).reduce((a, b) => a + b, 0) / 
      recensioni.filter(r => parseScore(r.atmosfera) > 0).length || 0
    : 0;

  const reviewDistribution = [
    { label: "Eccellente", stars: 5, count: 0, color: "#16a34a" },
    { label: "Buono", stars: 4, count: 0, color: "#22c55e" },
    { label: "Nella media", stars: 3, count: 0, color: "#eab308" },
    { label: "Scarso", stars: 2, count: 0, color: "#f97316" },
    { label: "Terribile", stars: 1, count: 0, color: "#ef4444" },
  ];

  ratedReviews.forEach((score) => {
    const rounded = Math.max(1, Math.min(5, Math.round(score)));
    const bucket = reviewDistribution.find((entry) => entry.stars === rounded);
    if (bucket) bucket.count += 1;
  });

  const maxDistributionCount = reviewDistribution.reduce((acc, row) => Math.max(acc, row.count), 0);

  const reviewLabel =
    reviewAverage >= 4.5
      ? "Eccellente"
      : reviewAverage >= 3.8
        ? "Buono"
        : reviewAverage >= 3
          ? "Nella media"
          : reviewAverage >= 2
            ? "Scarso"
            : "Terribile";

  const reviewMetrics = [
    { label: "Servizio", value: reviewAverage },
    { label: "Cibo", value: reviewAverage },
    { label: "Qualita/prezzo", value: reviewAverage },
    { label: "Atmosfera", value: reviewAverage },
  ];

  return (
    <div className="fade-in venue-detail-page" style={{ color: "white" }}>
      <style>{`
        .venue-review-box {
          background: #f2f3f2;
          border-radius: 16px;
          padding: 18px 20px;
          color: #184d2f;
          width: 100%;
          box-sizing: border-box;
        }

        .venue-review-box * {
          color: #0b6b3a !important;
        }

        .venue-review-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .venue-review-write {
          text-decoration: none;
          border: 1px solid #0b6b3a;
          background: #e8f4ec;
          color: #0b6b3a !important;
          border-radius: 999px;
          padding: 8px 14px;
          font-weight: 700;
          font-size: 14px;
        }

        .venue-review-all-link,
        .venue-review-all-link:visited {
          color: #0b6b3a !important;
        }

        .venue-review-score-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 8px;
        }

        .venue-review-score-row p {
          margin: 0;
        }

        .venue-review-rows,
        .venue-review-metric-rows {
          display: grid;
          gap: 6px;
        }

        .venue-review-row {
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr) 28px;
          gap: 8px;
          align-items: center;
        }

        .venue-review-label {
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .venue-review-track {
          width: 100%;
          height: 8px;
          background: #d9ddd9;
          border-radius: 999px;
          overflow: hidden;
        }

        .venue-review-fill {
          height: 100%;
          background: #138a3b;
          border-radius: 999px;
        }

        .venue-review-count {
          font-size: 12px;
          font-weight: 700;
          text-align: right;
        }

        .venue-review-divider {
          border-top: 1px solid #d7dbd7;
          margin-top: 8px;
          padding-top: 8px;
        }

        @media (min-width: 1024px) {
          .venue-review-box {
            width: 50%;
            margin: 0 auto;
          }
        }
      `}</style>

      {isAdmin && (
        <button
          type="button"
          onClick={() => {
            setForm(locale);
            setIsEditorOpen(true);
          }}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 1100,
            background: "#f5a623",
            color: "#111",
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Modifica
        </button>
      )}

      {/* HERO */}
      <div className="venue-hero">
        <img
          src={imageLoadError ? placeholderHero : (imageMain || placeholderHero)}
          alt={locale.nome}
          onError={() => setImageLoadError(true)}
        />
      </div>

      <div className="content-wrapper venue-section venue-header-panel">
        <div className="venue-hero-info">
          <h1>{locale.nome}</h1>

          <p>{fullAddress || placeholder(locale.indirizzo, "indirizzo")}</p>

          <div className="venue-meta-row">
            <span className="badge-category">{categoria}</span>
            <span className="badge-category">{placeholder(locale.price_range, "fascia prezzo")}</span>
            {verified && <span className="badge-category gold-badge">Verificato</span>}
            {featured && <span className="badge-category gold-badge">In evidenza</span>}
            <span className="badge-category">{placeholder(locale.orari, "orari")}</span>
          </div>
        </div>
      </div>

      {/* CONTATTI & SOCIAL */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title" style={sectionTitleStyle}>Contatti e Social</h2>
        <div className="venue-meta-row">
          {locale.telefono && (
            <a className="contact-chip" href={`tel:${locale.telefono}`}>
              TEL {locale.telefono}
            </a>
          )}
          {website && (
            <a className="contact-chip" href={website} target="_blank" rel="noreferrer">
              WEB Sito
            </a>
          )}
          {locale.instagram && (
            <a
              className="contact-chip"
              href={locale.instagram.startsWith("http") ? locale.instagram : `https://instagram.com/${locale.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
            >
              IG Instagram
            </a>
          )}
          {locale.tiktok && (
            <a
              className="contact-chip"
              href={locale.tiktok.startsWith("http") ? locale.tiktok : `https://www.tiktok.com/@${locale.tiktok.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          )}
          {!locale.telefono && !website && !locale.instagram && !locale.tiktok && <p>Nessun contatto disponibile.</p>}
        </div>
      </div>

      {/* VALUTAZIONI */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title" style={sectionTitleStyle}>Valutazioni</h2>
        <div className="grid-wrapper" style={{ gap: 20, marginTop: 12 }}>
        {[
          { label: "Qualità Drink", value: locale.qualita_drink },
          { label: "Competenza Staff", value: locale.competenza_staff },
          { label: "Atmosfera", value: locale.atmosfera },
          { label: "Qualità/Prezzo", value: locale.qualita_prezzo },
        ].map((item) => (
          <div key={item.label} className="rating-box">
            <p>{item.label}</p>
            <div className="rating-value">{giudizio(item.value)}</div>
          </div>
        ))}
        </div>
      </div>

      {/* DESCRIZIONE */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title" style={sectionTitleStyle}>Descrizione</h2>
        <p className="venue-description">
          {locale.descrizione_completa || locale.descrizione || "Descrizione non disponibile"}
        </p>
      </div>

      {/* MEDIA */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title" style={sectionTitleStyle}>Foto e Video</h2>

        {videoMain && (
          <video className="venue-main-video" src={videoMain} controls />
        )}

        {media.length === 0 && <p>Nessun contenuto disponibile</p>}

        <div className="grid-wrapper" style={{ gap: 10, marginTop: 20 }}>
          {media.map((m) => {
            if (m.tipo === "foto") {
              return (
                <img key={m.id} src={m.url_file} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              );
            }

            if (m.tipo === "video") {
              return (
                <video key={m.id} src={m.url_file} controls style={{ width: "100%", height: 150 }} />
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* RECENSIONI BOX IN FONDO */}
      <div className="content-wrapper venue-section" style={{ marginBottom: 60 }}>
        <div className="venue-review-box">
          <div className="venue-review-head">
            <h2 style={{ margin: 0, fontSize: "clamp(18px, 3.2vw, 28px)", fontWeight: 800 }}>Recensioni</h2>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              style={{
                border: "2px solid #0b6b3a",
                background: "transparent",
                color: "#0b6b3a",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "#e8f4ec";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "transparent";
              }}
            >
              Racconta la tua esperienza
            </button>
          </div>

          {/* VOTO CENTRALE */}
          {reviewAverage > 0 ? (
            <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
              <div style={{ fontSize: "48px", fontWeight: 800, color: "#0b6b3a", lineHeight: 1 }}>
                {reviewAverage.toFixed(1).replace(".", ",")}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0b6b3a", marginTop: 4 }}>
                {reviewLabel}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Basato su {recensioni.length} {recensioni.length === 1 ? "recensione" : "recensioni"}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20, fontSize: 14, color: "#999" }}>
              Nessuna recensione ancora
            </div>
          )}

          {/* BARRE DISTRIBUZIONE */}
          {reviewAverage > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0b6b3a", marginBottom: 12 }}>Distribuzione voti</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {reviewDistribution.map((row) => {
                  const width = maxDistributionCount > 0 ? (row.count / maxDistributionCount) * 100 : 0;
                  return (
                    <div key={row.label} style={{ display: "grid", gridTemplateColumns: "80px 1fr 40px", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0b6b3a" }}>{row.label}</span>
                      <div style={{
                        width: "100%",
                        height: 8,
                        background: "#e0e0e0",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${width}%`,
                          height: "100%",
                          background: row.color,
                          borderRadius: "999px",
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0b6b3a", textAlign: "right" }}>{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VALUTAZIONI DETTAGLIATE */}
          {reviewAverage > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0b6b3a", marginBottom: 12 }}>Valutazioni dettagliate</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { label: "Servizio", icon: "👤", value: avgServizio },
                  { label: "Qualità drink", icon: "🍸", value: avgQualitaDrink },
                  { label: "Qualità/prezzo", icon: "💰", value: avgQualitaPrezzo },
                  { label: "Atmosfera", icon: "✨", value: avgAtmosfera },
                ].map((metric) => (
                  <div key={metric.label} style={{ display: "grid", gridTemplateColumns: "80px 1fr 50px", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0b6b3a" }}>
                      {metric.icon} {metric.label}
                    </span>
                    <div style={{
                      width: "100%",
                      height: 6,
                      background: "#e0e0e0",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${(metric.value / 5) * 100}%`,
                        height: "100%",
                        background: "#0b6b3a",
                        borderRadius: "999px",
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0b6b3a", textAlign: "right" }}>
                      {metric.value.toFixed(1).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isAdmin && isEditorOpen && form && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.75)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            style={{
              width: "min(760px, 96vw)",
              maxHeight: "86vh",
              overflow: "auto",
              background: "#0b1220",
              border: "1px solid #334155",
              borderRadius: 14,
              padding: 16,
              display: "grid",
              gap: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, color: "#f8fafc" }}>Modifica scheda locale</h3>

            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              }}
            />
            {uploading && <p style={{ margin: 0 }}>Upload immagine in corso...</p>}

            <label style={editorLabelStyle}>URL immagine anteprima</label>
            <input
              value={form.image_url || form.image || ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value, image: e.target.value })}
              placeholder="https://..."
              style={editorFieldStyle}
            />

            <label style={editorLabelStyle}>Nome</label>
            <input value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome" style={editorFieldStyle} />
            <label style={editorLabelStyle}>Indirizzo</label>
            <input value={form.indirizzo || ""} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} placeholder="Indirizzo" style={editorFieldStyle} />
            <label style={editorLabelStyle}>Citta</label>
            <input value={form.citta || ""} onChange={(e) => setForm({ ...form, citta: e.target.value })} placeholder="Citta" style={editorFieldStyle} />
            <label style={editorLabelStyle}>Telefono</label>
            <input value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Telefono" style={editorFieldStyle} />
            <label style={editorLabelStyle}>Sito</label>
            <input value={form.sito || ""} onChange={(e) => setForm({ ...form, sito: e.target.value })} placeholder="Sito" style={editorFieldStyle} />
            <label style={editorLabelStyle}>TikTok</label>
            <input value={form.tiktok || ""} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="TikTok" style={editorFieldStyle} />
            <label style={editorLabelStyle}>Instagram</label>
            <input value={form.instagram || ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="Instagram" style={editorFieldStyle} />
            <label style={editorLabelStyle}>Descrizione breve</label>
            <textarea value={form.descrizione || ""} onChange={(e) => setForm({ ...form, descrizione: e.target.value })} placeholder="Descrizione breve" rows={3} style={editorFieldStyle} />
            <label style={editorLabelStyle}>Descrizione completa</label>
            <textarea value={form.descrizione_completa || ""} onChange={(e) => setForm({ ...form, descrizione_completa: e.target.value })} placeholder="Descrizione completa" rows={6} style={editorFieldStyle} />

            <h4 style={{ margin: "8px 0 4px", color: "#f97316" }}>Dati Tecnici</h4>

            <label style={editorLabelStyle}>Orari apertura</label>
            <textarea value={form.orari || ""} onChange={(e) => setForm({ ...form, orari: e.target.value })} placeholder="Orari apertura (es. Mar-Dom 20:00-03:00)" rows={2} style={editorFieldStyle} />

            <label style={editorLabelStyle}>Fascia prezzo</label>
            <select value={form.price_range || ""} onChange={(e) => setForm({ ...form, price_range: e.target.value })} style={editorFieldStyle}>
              <option value="">Seleziona</option>
              <option value="€">€ — Molto economico</option>
              <option value="€€">€€ — Economico</option>
              <option value="€€€">€€€ — Medio</option>
              <option value="€€€€">€€€€ — Alto</option>
              <option value="€€€€€">€€€€€ — Molto alto</option>
            </select>

            <label style={editorLabelStyle}>Qualità Drink</label>
            <select value={form.qualita_drink || ""} onChange={(e) => setForm({ ...form, qualita_drink: e.target.value })} style={editorFieldStyle}>
              <option value="">Seleziona</option>
              <option value="1">Scarsa</option>
              <option value="2">Discreta</option>
              <option value="3">Buona</option>
              <option value="4">Ottima</option>
              <option value="5">Eccellente</option>
            </select>

            <label style={editorLabelStyle}>Competenza Staff</label>
            <select value={form.competenza_staff || ""} onChange={(e) => setForm({ ...form, competenza_staff: e.target.value })} style={editorFieldStyle}>
              <option value="">Seleziona</option>
              <option value="1">Scarsa</option>
              <option value="2">Discreta</option>
              <option value="3">Buona</option>
              <option value="4">Ottima</option>
              <option value="5">Eccellente</option>
            </select>

            <label style={editorLabelStyle}>Atmosfera</label>
            <select value={form.atmosfera || ""} onChange={(e) => setForm({ ...form, atmosfera: e.target.value })} style={editorFieldStyle}>
              <option value="">Seleziona</option>
              <option value="1">Scarsa</option>
              <option value="2">Discreta</option>
              <option value="3">Buona</option>
              <option value="4">Ottima</option>
              <option value="5">Eccellente</option>
            </select>

            <label style={editorLabelStyle}>Qualità/Prezzo</label>
            <select value={form.qualita_prezzo || ""} onChange={(e) => setForm({ ...form, qualita_prezzo: e.target.value })} style={editorFieldStyle}>
              <option value="">Seleziona</option>
              <option value="1">Scarso</option>
              <option value="2">Discreto</option>
              <option value="3">Buono</option>
              <option value="4">Ottimo</option>
              <option value="5">Eccellente</option>
            </select>
            <div style={{ display: "flex", gap: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ccc" }}>
                <input type="checkbox" checked={!!form.verificato} onChange={(e) => setForm({ ...form, verificato: e.target.checked })} />
                Verificato
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ccc" }}>
                <input type="checkbox" checked={!!form.in_evidenza} onChange={(e) => setForm({ ...form, in_evidenza: e.target.checked })} />
                In Evidenza
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={handleSave} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>Salva</button>
              <button onClick={handleDelete} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>Elimina</button>
              <button onClick={() => setIsEditorOpen(false)} style={{ background: "#334155", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 600, cursor: "pointer" }}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            overflowY: "auto",
          }}
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            style={{
              width: "min(700px, 96vw)",
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              display: "grid",
              gap: 24,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TITLE */}
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>Racconta la tua esperienza</h2>

            {/* VOTO GENERALE - 5 STARS */}
            <div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
                Come valuti complessivamente?
              </label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, ratingGenerale: star })}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: "2px solid #0b6b3a",
                        background: reviewForm.ratingGenerale >= star ? "#0b6b3a" : "#fff",
                        cursor: "pointer",
                        fontSize: 20,
                        transition: "all 0.2s ease",
                        transform: reviewForm.ratingGenerale >= star ? "scale(1.1)" : "scale(1)",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.transform = "scale(1.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.transform = reviewForm.ratingGenerale >= star ? "scale(1.1)" : "scale(1)";
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {reviewForm.ratingGenerale > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0b6b3a" }}>{reviewForm.ratingGenerale}.0</span>
                )}
              </div>
            </div>

            {/* VALUTAZIONI DETTAGLIATE CON SLIDERS */}
            <div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
                Valutazioni dettagliate
              </label>
              <div style={{ display: "grid", gap: 16 }}>
                {[
                  { key: "servizio", label: "👤 Servizio", icon: "👤" },
                  { key: "qualitaDrink", label: "🍸 Qualità drink", icon: "🍸" },
                  { key: "qualitaPrezzo", label: "💰 Qualità/prezzo", icon: "💰" },
                  { key: "atmosfera", label: "✨ Atmosfera", icon: "✨" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0b6b3a" }}>
                        {(reviewForm as any)[key] || "—"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={(reviewForm as any)[key] || 0}
                      onChange={(e) => setReviewForm({
                        ...reviewForm,
                        [key]: parseInt(e.target.value),
                      })}
                      style={{
                        width: "100%",
                        height: 6,
                        borderRadius: "999px",
                        background: `linear-gradient(to right, #0b6b3a 0%, #0b6b3a ${((reviewForm as any)[key] || 0) * 20}%, #e0e0e0 ${((reviewForm as any)[key] || 0) * 20}%, #e0e0e0 100%)`,
                        border: "none",
                        cursor: "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* TAG RAPIDI */}
            <div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
                Aggiungi tag (seleziona più elementi)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                {[
                  { id: "cocktail", label: "🍸 Ottimi cocktail" },
                  { id: "music", label: "🎧 Bella musica" },
                  { id: "expensive", label: "💸 Prezzi alti" },
                  { id: "basic", label: "🧊 Drink basic" },
                  { id: "top", label: "🔥 Esperienza top" },
                  { id: "average", label: "😐 Nella media" },
                ].map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      const newTags = reviewForm.tags.includes(tag.id)
                        ? reviewForm.tags.filter(t => t !== tag.id)
                        : [...reviewForm.tags, tag.id];
                      setReviewForm({ ...reviewForm, tags: newTags });
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "2px solid #0b6b3a",
                      background: reviewForm.tags.includes(tag.id) ? "#0b6b3a" : "#fff",
                      color: reviewForm.tags.includes(tag.id) ? "#fff" : "#0b6b3a",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* COMMENTO */}
            <div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                Il tuo commento
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Racconta cosa hai bevuto, l'atmosfera e cosa ti è piaciuto..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            {/* TERMS CHECKBOX */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={reviewForm.agreeToTerms}
                onChange={(e) => setReviewForm({ ...reviewForm, agreeToTerms: e.target.checked })}
                style={{ marginTop: 4, cursor: "pointer", width: 18, height: 18 }}
              />
              <span style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>
                Dichiaro che questa recensione è frutto della mia esperienza, che rappresenta la mia opinione autentica di questo ristorante, che non ho relazioni personali o aziendali con tale struttura e che non mi sono stati offerti incentivi o pagamenti da tale azienda per scriverla.
              </span>
            </label>

            {/* ACTION BUTTONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewForm.agreeToTerms || reviewForm.ratingGenerale === 0}
                style={{
                  background: reviewForm.agreeToTerms && reviewForm.ratingGenerale > 0 ? "#0b6b3a" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: 14,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: reviewForm.agreeToTerms && reviewForm.ratingGenerale > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  boxShadow: reviewForm.agreeToTerms && reviewForm.ratingGenerale > 0 ? "0 4px 12px rgba(11, 107, 58, 0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (reviewForm.agreeToTerms && reviewForm.ratingGenerale > 0) {
                    (e.target as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(11, 107, 58, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (reviewForm.agreeToTerms && reviewForm.ratingGenerale > 0) {
                    (e.target as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(11, 107, 58, 0.3)";
                  }
                }}
              >
                Pubblica recensione
              </button>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                style={{
                  background: "#f0f0f0",
                  color: "#111827",
                  border: "none",
                  borderRadius: 8,
                  padding: 14,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#f0f0f0";
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}