import "../App.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext"; // ✅ AGGIUNTO
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

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
  const { t, i18n } = useTranslation();

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
  }, [id]);

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
      .maybeSingle();

    setLocale(data);
    setForm(data);
  }

  async function fetchRecensioni() {
    const { data } = await supabase
      .from("Recensioni")
      .select("id, locale_id, commento, testo, created_at, author_name, utente_id, voto, status, servizio, qualita_drink, qualita_prezzo, atmosfera, tags")
      .eq("locale_id", id)
      .gte("created_at", REVIEWS_RESET_AT)
      .order("created_at", { ascending: false });

    if (data) setRecensioni(data);
  }

  async function fetchMedia() {
    const { data } = await supabase
      .from("Media")
      .select("id, entity_id, entity_type, url_file, tipo, approvato")
      .eq("entity_id", id)
      .eq("entity_type", "locale")
      .eq("approvato", true);

    if (data) setMedia(data);
  }

  async function handleSave() {
    const adminPassword =
      localStorage.getItem("adminPassword") ||
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

  if (!locale) {
    const loadingLabel = getTranslatedField(
      { label_it: "Caricamento...", label_en: "Loading...", label_bg: "Зареждане..." },
      "label",
      i18n.language,
      "Caricamento..."
    );
    return <div className="page fade-in">{loadingLabel}</div>;
  }

  const tr = (it: string, en: string, bg: string) =>
    getTranslatedField({ label_it: it, label_en: en, label_bg: bg }, "label", i18n.language, it);

  const normalizedLang = String(i18n.language || "it").toLowerCase().split(/[-_]/)[0];

  const getFirstTranslatedLocaleField = (fields: string[], fallback = "") => {
    for (const field of fields) {
      const value = getTranslatedField(locale as any, field, i18n.language, "");
      if (value.trim().length > 0) return value;
    }
    return fallback;
  };

  const getFirstLongLocaleContent = (fields: string[], fallback = "") => {
    const record = locale as any;

    if (normalizedLang !== "it") {
      for (const field of fields) {
        const value = record?.[`${field}_${normalizedLang}`];
        if (typeof value === "string" && value.trim().length > 0) return value.trim();
      }
    }

    for (const field of fields) {
      const value = record?.[field];
      if (typeof value === "string" && value.trim().length > 0) return value.trim();
    }

    if (normalizedLang !== "it") {
      for (const field of fields) {
        const value = record?.[`${field}_it`];
        if (typeof value === "string" && value.trim().length > 0) return value.trim();
      }
    }

    return fallback;
  };

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
  const localeName = getFirstTranslatedLocaleField(["nome"], locale.nome || "-");
  const indirizzo = getFirstTranslatedLocaleField(["indirizzo"], locale.indirizzo || "");
  const citta = getFirstTranslatedLocaleField(["citta"], locale.citta || "");
  const provincia = getFirstTranslatedLocaleField(["provincia"], locale.provincia || "");
  const paese = getFirstTranslatedLocaleField(["paese"], locale.paese || "");
  const categoria = getTranslatedField(
    locale as any,
    "categoria",
    i18n.language,
    locale.categoria || tr("Categoria non disponibile", "Category not available", "Категорията не е налична")
  );
  const orari = getFirstTranslatedLocaleField(["orari"], locale.orari || "");
  const priceRange = getFirstTranslatedLocaleField(["price_range"], locale.price_range || "");
  const descrizioneLunga = getFirstLongLocaleContent(
    ["descrizione_completa", "descrizione", "specialita", "storia", "testo", "content"],
    locale.descrizione_completa || locale.descrizione || ""
  );
  const qualitaDrink = getFirstTranslatedLocaleField(["qualita_drink"], locale.qualita_drink || "");
  const competenzaStaff = getFirstTranslatedLocaleField(["competenza_staff"], locale.competenza_staff || "");
  const atmosfera = getFirstTranslatedLocaleField(["atmosfera"], locale.atmosfera || "");
  const qualitaPrezzo = getFirstTranslatedLocaleField(["qualita_prezzo"], locale.qualita_prezzo || "");
  const fullAddress = [indirizzo, citta, provincia, paese]
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
    { label: tr("Eccellente", "Excellent", "Отлично"), stars: 5, count: 0, color: "#16a34a" },
    { label: tr("Buono", "Good", "Добро"), stars: 4, count: 0, color: "#22c55e" },
    { label: tr("Nella media", "Average", "Средно"), stars: 3, count: 0, color: "#eab308" },
    { label: tr("Scarso", "Poor", "Слабо"), stars: 2, count: 0, color: "#f97316" },
    { label: tr("Terribile", "Terrible", "Ужасно"), stars: 1, count: 0, color: "#ef4444" },
  ];

  ratedReviews.forEach((score) => {
    const rounded = Math.max(1, Math.min(5, Math.round(score)));
    const bucket = reviewDistribution.find((entry) => entry.stars === rounded);
    if (bucket) bucket.count += 1;
  });

  const maxDistributionCount = reviewDistribution.reduce((acc, row) => Math.max(acc, row.count), 0);

  const reviewLabel =
    reviewAverage >= 4.5
      ? tr("Eccellente", "Excellent", "Отлично")
      : reviewAverage >= 3.8
        ? tr("Buono", "Good", "Добро")
        : reviewAverage >= 3
          ? tr("Nella media", "Average", "Средно")
          : reviewAverage >= 2
            ? tr("Scarso", "Poor", "Слабо")
            : tr("Terribile", "Terrible", "Ужасно");

  const reviewMetrics = [
    { label: "Servizio", value: reviewAverage },
    { label: "Cibo", value: reviewAverage },
    { label: "Qualita/prezzo", value: reviewAverage },
    { label: "Atmosfera", value: reviewAverage },
  ];

  return (
    <>
      <Navbar />
      <div className="fade-in venue-detail-page" style={{ color: "white", marginTop: 86 }}>
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
            alt={localeName}
            onError={() => setImageLoadError(true)}
          />
        </div>

        <div className="content-wrapper venue-section venue-header-panel">
          <div className="venue-hero-info">
            <h1>{localeName}</h1>

            <p>{fullAddress || placeholder(indirizzo, "indirizzo")}</p>

            <div className="venue-meta-row">
              <span className="badge-category">{categoria}</span>
              <span className="badge-category">{placeholder(priceRange, "fascia prezzo")}</span>
              {verified && <span className="badge-category gold-badge">{tr("Verificato", "Verified", "Проверено")}</span>}
              {featured && <span className="badge-category gold-badge">{tr("In evidenza", "Featured", "Представено")}</span>}
              <span className="badge-category">{placeholder(orari, "orari")}</span>
            </div>
          </div>
        </div>

        {/* CONTATTI & SOCIAL */}
        <div className="content-wrapper venue-section">
          <h2 className="section-title" style={sectionTitleStyle}>{tr("Contatti e Social", "Contacts and Social", "Контакти и социални мрежи")}</h2>
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
            {!locale.telefono && !website && !locale.instagram && !locale.tiktok && <p>{tr("Nessun contatto disponibile.", "No contacts available.", "Няма налични контакти.")}</p>}
          </div>
        </div>

        {/* VALUTAZIONI */}
        <div className="content-wrapper venue-section">
          <h2 className="section-title" style={sectionTitleStyle}>{tr("Valutazioni", "Ratings", "Оценки")}</h2>
          <div className="grid-wrapper" style={{ gap: 20, marginTop: 32 }}>
            {[
              { label: t("venueDetail.ratings.qualityDrink", { defaultValue: tr("Qualità Drink", "Drink Quality", "Качество на напитките") }), value: qualitaDrink },
              { label: t("venueDetail.ratings.staffCompetence", { defaultValue: tr("Competenza Staff", "Staff Competence", "Компетентност на персонала") }), value: competenzaStaff },
              { label: "Atmosfera", value: atmosfera },
              { label: "Qualità/Prezzo", value: qualitaPrezzo },
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
          <h2 className="section-title" style={sectionTitleStyle}>{tr("Descrizione", "Description", "Описание")}</h2>
          <p className="venue-description">
            {descrizioneLunga || tr("Descrizione non disponibile", "Description not available", "Няма налично описание")}
          </p>
        </div>

        {/* MEDIA */}
        <div className="content-wrapper venue-section">
          <h2 className="section-title" style={sectionTitleStyle}>{tr("Foto e Video", "Photos and Videos", "Снимки и видеа")}</h2>

          {videoMain && (
            <video className="venue-main-video" src={videoMain} controls />
          )}

          {media.length === 0 && <p>{tr("Nessun contenuto disponibile", "No content available", "Няма налично съдържание")}</p>}

          <div className="grid-wrapper" style={{ gap: 10, marginTop: 40 }}>
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
              <h2 style={{ margin: 0, fontSize: "clamp(18px, 3.2vw, 28px)", fontWeight: 800 }}>{tr("Recensioni", "Reviews", "Рецензии")}</h2>
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
                {tr("Racconta la tua esperienza", "Share your experience", "Разкажете за вашето изживяване")}
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
                    {tr("Basato su", "Based on", "На база на")} {recensioni.length} {recensioni.length === 1 ? tr("recensione", "review", "рецензия") : tr("recensioni", "reviews", "рецензии")}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", margin: "8px 0", fontSize: 13, color: "#999" }}>
                {tr("Nessuna recensione ancora", "No reviews yet", "Все още няма рецензии")}
              </div>
            )}

            {/* BARRE DISTRIBUZIONE */}
            {reviewAverage > 0 && (
              <div>
                <p className="rvb-section-title">{t("venueDetail.reviews.voteDistribution", { defaultValue: tr("Distribuzione voti", "Vote distribution", "Разпределение на оценките") })}</p>
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
                <p className="rvb-section-title">{tr("Valutazioni dettagliate", "Detailed ratings", "Подробни оценки")}</p>
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
        {/* ...modale recensione qui, dentro il return principale... */}
      </div>
    </>
  );
}