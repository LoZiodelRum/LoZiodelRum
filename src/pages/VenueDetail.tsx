import "../App.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
};

type Media = {
  id: string;
  entity_id: string;
  entity_type: string;
  url_file: string;
  tipo: string; // image | video
  approvato: boolean;
};

export default function VenueDetail() {
  const { id } = useParams();
  const { isAdmin } = useUser();

  const [locale, setLocale] = useState<Locale | null>(null);
  const [form, setForm] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

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

  return (
    <div className="fade-in venue-detail-page" style={{ color: "white" }}>

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
        <h2 className="section-title">Contatti e Social</h2>
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
          {!locale.telefono && !website && !locale.instagram && <p>Nessun contatto disponibile.</p>}
        </div>
      </div>

      {/* DESCRIZIONE */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title">Descrizione</h2>
        <p className="venue-description">
          {locale.descrizione_completa || locale.descrizione || "Descrizione non disponibile"}
        </p>
      </div>

      {/* VALUTAZIONI */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title">Valutazioni</h2>
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

      {/* RECENSIONI */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title">Recensioni</h2>

        {recensioni.map((rec) => (
          <div key={rec.id} className="review-card">
            <p>{rec.commento}</p>
            <p className="review-date">
              {new Date(rec.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        {!recensioni.length && <p>Nessuna recensione disponibile.</p>}
      </div>

      {/* MEDIA */}
      <div className="content-wrapper venue-section" style={{ marginBottom: 60 }}>
        <h2 className="section-title">Foto e Video</h2>

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

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>URL immagine anteprima</label>
            <input
              value={form.image_url || form.image || ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value, image: e.target.value })}
              placeholder="https://..."
              style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }}
            />

            <input value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome" style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <input value={form.indirizzo || ""} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} placeholder="Indirizzo" style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <input value={form.citta || ""} onChange={(e) => setForm({ ...form, citta: e.target.value })} placeholder="Citta" style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <input value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Telefono" style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <input value={form.sito || ""} onChange={(e) => setForm({ ...form, sito: e.target.value })} placeholder="Sito" style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <textarea value={form.recensioni || ""} onChange={(e) => setForm({ ...form, recensioni: e.target.value })} placeholder="Recensioni" rows={2} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <textarea value={form.descrizione || ""} onChange={(e) => setForm({ ...form, descrizione: e.target.value })} placeholder="Descrizione breve" rows={3} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />
            <textarea value={form.descrizione_completa || ""} onChange={(e) => setForm({ ...form, descrizione_completa: e.target.value })} placeholder="Descrizione completa" rows={6} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />

            <h4 style={{ margin: "8px 0 4px", color: "#f97316" }}>Dati Tecnici</h4>

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Orari apertura</label>
            <textarea value={form.orari || ""} onChange={(e) => setForm({ ...form, orari: e.target.value })} placeholder="Orari apertura (es. Mar-Dom 20:00-03:00)" rows={2} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }} />

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Fascia prezzo</label>
            <select value={form.price_range || ""} onChange={(e) => setForm({ ...form, price_range: e.target.value })} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }}>
              <option value="">Seleziona</option>
              <option value="€">€ — Molto economico</option>
              <option value="€€">€€ — Economico</option>
              <option value="€€€">€€€ — Medio</option>
              <option value="€€€€">€€€€ — Alto</option>
              <option value="€€€€€">€€€€€ — Molto alto</option>
            </select>

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Qualità Drink</label>
            <select value={form.qualita_drink || ""} onChange={(e) => setForm({ ...form, qualita_drink: e.target.value })} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }}>
              <option value="">Seleziona</option>
              <option value="1">Scarsa</option>
              <option value="2">Discreta</option>
              <option value="3">Buona</option>
              <option value="4">Ottima</option>
              <option value="5">Eccellente</option>
            </select>

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Competenza Staff</label>
            <select value={form.competenza_staff || ""} onChange={(e) => setForm({ ...form, competenza_staff: e.target.value })} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }}>
              <option value="">Seleziona</option>
              <option value="1">Scarsa</option>
              <option value="2">Discreta</option>
              <option value="3">Buona</option>
              <option value="4">Ottima</option>
              <option value="5">Eccellente</option>
            </select>

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Atmosfera</label>
            <select value={form.atmosfera || ""} onChange={(e) => setForm({ ...form, atmosfera: e.target.value })} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }}>
              <option value="">Seleziona</option>
              <option value="1">Scarsa</option>
              <option value="2">Discreta</option>
              <option value="3">Buona</option>
              <option value="4">Ottima</option>
              <option value="5">Eccellente</option>
            </select>

            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Qualità/Prezzo</label>
            <select value={form.qualita_prezzo || ""} onChange={(e) => setForm({ ...form, qualita_prezzo: e.target.value })} style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "10px 12px" }}>
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

    </div>
  );
}