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
    overallRating: 0,
    comment: "",
    title: "",
    serviceRating: 0,
    foodRating: 0,
    qualityPriceRating: 0,
    atmosphereRating: 0,
    agreeToTerms: false,
    photoUrl: "",
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

    const url = data.publicUrl;

    setReviewForm({
      ...reviewForm,
      photoUrl: url,
    });

    setReviewUploading(false);
  }

  async function handleReviewSubmit() {
    if (!user) {
      alert("Devi essere loggato per scrivere una recensione");
      return;
    }

    if (!reviewForm.agreeToTerms) {
      alert("Devi accettare i termini");
      return;
    }

    if (reviewForm.overallRating === 0) {
      alert("Seleziona una valutazione generale");
      return;
    }

    const overallScore = (
      reviewForm.serviceRating +
      reviewForm.foodRating +
      reviewForm.qualityPriceRating +
      reviewForm.atmosphereRating
    ) / 4 || reviewForm.overallRating;

    const { error } = await supabase.from("Recensioni").insert({
      locale_id: id,
      commento: reviewForm.comment,
      titolo: reviewForm.title,
      overall_rating: reviewForm.overallRating,
      rating: overallScore,
      photo_url: reviewForm.photoUrl,
      servizio: reviewForm.serviceRating,
      cibo: reviewForm.foodRating,
      qualita_prezzo: reviewForm.qualityPriceRating,
      atmosfera: reviewForm.atmosphereRating,
      autore: user.email || user.id,
      created_at: new Date().toISOString(),
    });

    if (error) {
      alert(`Errore salvataggio: ${error.message}`);
      return;
    }

    alert("Recensione pubblicata! ✅");
    setIsReviewModalOpen(false);
    setReviewForm({
      overallRating: 0,
      comment: "",
      title: "",
      serviceRating: 0,
      foodRating: 0,
      qualityPriceRating: 0,
      atmosphereRating: 0,
      agreeToTerms: false,
      photoUrl: "",
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

  const ratedReviews = recensioni
    .map((rec) => parseScore(rec.rating ?? rec.overall_rating))
    .filter((score) => score > 0);

  const reviewAverage = ratedReviews.length
    ? ratedReviews.reduce((acc, score) => acc + score, 0) / ratedReviews.length
    : 0;

  const reviewDistribution = [
    { label: "Eccellente", stars: 5, count: 0 },
    { label: "Buono", stars: 4, count: 0 },
    { label: "Nella media", stars: 3, count: 0 },
    { label: "Scarso", stars: 2, count: 0 },
    { label: "Terribile", stars: 1, count: 0 },
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
              className="venue-review-write"
              style={{ border: "1px solid #0b6b3a", background: "#e8f4ec", color: "#0b6b3a", borderRadius: "999px", padding: "8px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Scrivi una recensione
            </button>
          </div>

          <div style={{ marginTop: 8, marginBottom: 12 }}>
            <Link to="/community" className="venue-review-all-link" style={{ fontWeight: 700, textDecoration: "underline", fontSize: 14 }}>
              Tutte le recensioni ({recensioni.length})
            </Link>
          </div>

          <div>
            <div className="venue-review-score-row">
              <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{reviewAverage.toFixed(1).replace(".", ",")}</p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{reviewLabel}</p>
            </div>

            <div className="venue-review-rows">
              {reviewDistribution.map((row) => {
                const width = maxDistributionCount > 0 ? (row.count / maxDistributionCount) * 100 : 0;
                return (
                  <div key={row.label} className="venue-review-row">
                    <span className="venue-review-label">{row.label}</span>
                    <div className="venue-review-track">
                      <div className="venue-review-fill" style={{ width: `${width}%` }} />
                    </div>
                    <span className="venue-review-count">{row.count}</span>
                  </div>
                );
              })}
            </div>

            <div className="venue-review-divider venue-review-metric-rows">
              {reviewMetrics.map((metric) => (
                <div key={metric.label} className="venue-review-row">
                  <span className="venue-review-label">{metric.label}</span>
                  <div className="venue-review-track">
                    <div className="venue-review-fill" style={{ width: `${(metric.value / 5) * 100}%` }} />
                  </div>
                  <span className="venue-review-count">{metric.value.toFixed(1).replace(".", ",")}</span>
                </div>
              ))}
            </div>
          </div>
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
            background: "rgba(2,6,23,0.75)",
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
              borderRadius: 12,
              padding: 24,
              display: "grid",
              gap: 20,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TITLE */}
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#000" }}>Scrivi una recensione</h2>

            {/* OVERALL RATING - STARS */}
            <div>
              <label style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#000", marginBottom: 8 }}>
                Come valuteresti la tua esperienza?
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, overallRating: star })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: "2px solid #0b6b3a",
                      background: reviewForm.overallRating >= star ? "#0b6b3a" : "#fff",
                      cursor: "pointer",
                      fontSize: 20,
                    }}
                  >
                    ○
                  </button>
                ))}
              </div>
            </div>

            {/* REVIEW TEXT */}
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 8 }}>
                Scrivi una recensione
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Condividi la tua esperienza..."
                style={{
                  width: "100%",
                  minHeight: 120,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#999" }}>0/300 caratteri max</p>
            </div>

            {/* REVIEW TITLE */}
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 8 }}>
                Dai un titolo alla tua recensione
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Doccia un'idea della tua esperienza"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* PHOTO UPLOAD */}
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 8 }}>
                Aggiungi delle foto
              </label>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>Facoltativo</p>
              <div style={{
                border: "2px dashed #ccc",
                borderRadius: 8,
                padding: 20,
                textAlign: "center",
                cursor: "pointer",
                background: reviewForm.photoUrl ? "#f0f8f0" : "#fafafa",
              }}>
                {reviewUploading ? (
                  <p style={{ margin: 0, color: "#0b6b3a", fontWeight: 700 }}>Upload in corso...</p>
                ) : reviewForm.photoUrl ? (
                  <>
                    <img src={reviewForm.photoUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 6, marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 12, color: "#0b6b3a" }}>Foto caricata ✓</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: "0 0 8px", fontSize: 18 }}>📸</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#000" }}>Fai clic per aggiungere foto</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>oppure trascina</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleReviewPhotoUpload(e.target.files[0])}
                  style={{ display: "none", cursor: "pointer" }}
                  id="review-photo-input"
                />
              </div>
              <label htmlFor="review-photo-input" style={{ display: "block", marginTop: 8, cursor: "pointer" }}>
                <span style={{ fontSize: 12, color: "#0b6b3a", textDecoration: "underline" }}>Seleziona file</span>
              </label>
            </div>

            {/* INDIVIDUAL RATINGS */}
            <div>
              <label style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#000", marginBottom: 16 }}>
                Come li valuteresti?
              </label>
              <div style={{ display: "grid", gap: 16 }}>
                {[
                  { key: "serviceRating", label: "Servizio" },
                  { key: "foodRating", label: "Cibo" },
                  { key: "qualityPriceRating", label: "Qualità/prezzo" },
                  { key: "atmosphereRating", label: "Atmosfera" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#000" }}>{label}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewForm({ ...reviewForm, [key]: star })}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "2px solid #0b6b3a",
                            background: (reviewForm as any)[key] >= star ? "#0b6b3a" : "#fff",
                            cursor: "pointer",
                            fontSize: 16,
                            color: (reviewForm as any)[key] >= star ? "#fff" : "#0b6b3a",
                            fontWeight: 700,
                          }}
                        >
                          ○
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TERMS CHECKBOX */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={reviewForm.agreeToTerms}
                onChange={(e) => setReviewForm({ ...reviewForm, agreeToTerms: e.target.checked })}
                style={{ marginTop: 2, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "#666" }}>
                Dichiaro che questa recensione è frutto della mia esperienza, che rappresenta la mia opinione autentica di questo ristorante, che non ho relazioni personali o aziendali con tale struttura e che non mi sono stati offerti incentivi o pagamenti da tale azienda per scriverla. Accetto la politica di tolleranza zero attuata da Tripadvisor per le recensioni false.{" "}
                <span style={{ textDecoration: "underline", fontWeight: 600 }}>Scopri di più sulle conseguenze delle recensioni fraudolente.</span>
              </span>
            </label>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewForm.agreeToTerms || reviewForm.overallRating === 0}
                style={{
                  flex: 1,
                  background: reviewForm.agreeToTerms && reviewForm.overallRating > 0 ? "#0b6b3a" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: 14,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: reviewForm.agreeToTerms && reviewForm.overallRating > 0 ? "pointer" : "not-allowed",
                }}
              >
                Continua
              </button>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                style={{
                  flex: 1,
                  background: "#f0f0f0",
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: 14,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
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