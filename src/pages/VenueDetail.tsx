import "../App.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext"; // ✅ AGGIUNTO
import Navbar from "../components/Navbar";

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
  commento?: string | null;
  testo?: string | null;
  created_at: string;
  author_name?: string | null;
  utente_id?: string | null;
  voto?: number | null;
  status?: string | null;
  servizio?: number | null;
  qualita_drink?: number | null;
  qualita_prezzo?: number | null;
  atmosfera?: number | null;
  tags?: string | null;
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

    try {
      const { error } = await supabase.from("Recensioni").insert({
        locale_id: id,
        commento: reviewForm.comment,
        voto: reviewForm.ratingGenerale,
        author_name: user?.email || user?.id || "admin",
        status: "pending",
        servizio: reviewForm.servizio || null,
        qualita_drink: reviewForm.qualitaDrink || null,
        qualita_prezzo: reviewForm.qualitaPrezzo || null,
        atmosfera: reviewForm.atmosfera || null,
        tags: reviewForm.tags.length > 0 ? reviewForm.tags.join(",") : null,
      });

      if (error) {
        console.error("Errore Supabase:", error);
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
      await fetchRecensioni();
    } catch (err) {
      console.error("Errore non previsto:", err);
      alert("Errore imprevisto. Controlla la console.");
    }
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

  // Calcola rating generale da voto o da media delle 4 categorie
  const ratedReviews = recensioni
    .map((rec) => {
      const general = parseScore(rec.voto);
      if (general > 0) return general;
      const cats = [rec.servizio, rec.qualita_drink, rec.qualita_prezzo, rec.atmosfera].map(parseScore).filter(s => s > 0);
      return cats.length > 0 ? cats.reduce((a, b) => a + b, 0) / cats.length : 0;
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
    <>
      <Navbar />
      <div className="fade-in venue-detail-page" style={{ color: "white" }}>
        <style>{`
          .venue-review-box {
            background: #f2f3f2;
            border-radius: 14px;
            padding: 10px 14px;
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
            gap: 8px;
            flex-wrap: nowrap;
          }

          .rvb-section-title {
            font-size: 11px;
            font-weight: 700;
            color: #0b6b3a;
            margin: 0 0 4px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .rvb-row {
            display: grid;
            grid-template-columns: 88px 1fr 30px;
            gap: 6px;
            align-items: center;
          }

          .rvb-label {
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rvb-track {
            width: 100%;
            height: 6px;
            background: #dde8dd;
            border-radius: 999px;
            overflow: hidden;
          }

          .rvb-fill {
            height: 100%;
            border-radius: 999px;
            transition: width 0.3s ease;
          }

          .rvb-val {
            font-size: 11px;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
          }

          .rvb-divider {
            border-top: 1px solid #d0d8d0;
            margin: 6px 0;
          }

          .rvb-score-meta {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          @media (max-width: 768px) {
            .rvb-score-meta {
              flex-direction: row;
              gap: 6px;
              justify-content: center;
              align-items: baseline;
            }
          }

          @media (max-width: 400px) {
            .rvb-row {
              grid-template-columns: 76px 1fr 26px;
            }
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
              <div style={{ textAlign: "center", margin: "8px 0" }}>
                <div style={{ fontSize: "30px", fontWeight: 800, color: "#0b6b3a", lineHeight: 1 }}>
                  {reviewAverage.toFixed(1).replace(".", ",")}
                </div>
                <div className="rvb-score-meta">
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0b6b3a" }}>
                    {reviewLabel}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    Basato su {recensioni.length} {recensioni.length === 1 ? "recensione" : "recensioni"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", margin: "8px 0", fontSize: 13, color: "#999" }}>
                Nessuna recensione ancora
              </div>
            )}

            {/* BARRE DISTRIBUZIONE */}
            {reviewAverage > 0 && (
              <div>
                <p className="rvb-section-title">Distribuzione voti</p>
                <div style={{ display: "grid", gap: 4 }}>
                  {reviewDistribution.map((row) => {
                    const width = maxDistributionCount > 0 ? (row.count / maxDistributionCount) * 100 : 0;
                    return (
                      <div key={row.label} className="rvb-row">
                        <span className="rvb-label">{row.label}</span>
                        <div className="rvb-track">
                          <div className="rvb-fill" style={{ width: `${width}%`, background: row.color }} />
                        </div>
                        <span className="rvb-val">{row.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VALUTAZIONI DETTAGLIATE */}
            {reviewAverage > 0 && (
              <div>
                <div className="rvb-divider" />
                <p className="rvb-section-title">Valutazioni dettagliate</p>
                <div style={{ display: "grid", gap: 4 }}>
                  {[
                    { label: "👤 Servizio", value: avgServizio },
                    { label: "🍸 Qualità drink", value: avgQualitaDrink },
                    { label: "💰 Qualità/prezzo", value: avgQualitaPrezzo },
                    { label: "✨ Atmosfera", value: avgAtmosfera },
                  ].map((metric) => (
                    <div key={metric.label} className="rvb-row">
                      <span className="rvb-label">{metric.label}</span>
                      <div className="rvb-track">
                        <div className="rvb-fill" style={{ width: `${(metric.value / 5) * 100}%`, background: "#0b6b3a" }} />
                      </div>
                      <span className="rvb-val">
                        {metric.value > 0 ? metric.value.toFixed(1).replace(".", ",") : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>



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
        </div>
      </div>
    </>
  );
}