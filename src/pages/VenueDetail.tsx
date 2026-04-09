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
  categorie: string;
  specialities: string;
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
  const [form, setForm] = useState<any>(null); // ✅ AGGIUNTO
  const [uploading, setUploading] = useState(false); // ✅ AGGIUNTO

  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    fetchLocale();
    fetchRecensioni();
    fetchMedia();
  }, []);

  async function fetchLocale() {
    const { data } = await supabase
      .from("Locali")
      .select("*")
      .eq("id", id)
      .single();

    setLocale(data);
    setForm(data); // ✅ AGGIUNTO
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

  // ✅ SAVE
  async function handleSave() {
    const { error } = await supabase
      .from("Locali")
      .update({
        ...form,
        image: form.image || form.image_url,
        image_url: form.image || form.image_url,
      })
      .eq("id", form.id);

    if (error) {
      alert("Errore salvataggio");
      return;
    }

    setLocale(form);
    alert("Salvato ✅");
  }

  // ✅ DELETE
  async function handleDelete() {
    const ok = confirm("Eliminare locale?");
    if (!ok) return;

    await supabase.from("Locali").delete().eq("id", form.id);

    window.location.href = "/";
  }

  // ✅ UPLOAD IMMAGINE
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

  const giudizio = (value: string | null | undefined) =>
    value && value !== "" ? value : "Non valutato";

  const imageMain = locale.image_url || locale.image;
  const videoMain =
    locale.video_url || media.find((m) => m.tipo === "video")?.url_file || "";
  const categoria = locale.categoria || locale.categorie || "Categoria non disponibile";
  const fullAddress = [locale.indirizzo, locale.citta, locale.provincia, locale.paese]
    .filter(Boolean)
    .join(", ");
  const verified = toBool(locale.verificato);
  const featured = toBool(locale.in_evidenza);
  const website = locale.sito?.startsWith("http") ? locale.sito : locale.sito ? `https://${locale.sito}` : "";

  return (
    <div className="page fade-in venue-detail-page" style={{ color: "white" }}>

      {/* 🔧 EDITOR ADMIN */}
      {isAdmin && form && (
        <div style={{ padding: 20, background: "#111", marginBottom: 30 }}>
          <h2>Editor Locale</h2>

          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
            }}
          />

          {uploading && <p>Upload...</p>}

          <input value={form.nome || ""} onChange={(e)=>setForm({...form,nome:e.target.value})} placeholder="Nome" />
          <input value={form.indirizzo || ""} onChange={(e)=>setForm({...form,indirizzo:e.target.value})} placeholder="Indirizzo" />
          <input value={form.citta || ""} onChange={(e)=>setForm({...form,citta:e.target.value})} placeholder="Città" />
          <input value={form.telefono || ""} onChange={(e)=>setForm({...form,telefono:e.target.value})} placeholder="Telefono" />
          <input value={form.sito || ""} onChange={(e)=>setForm({...form,sito:e.target.value})} placeholder="Sito" />
          <textarea value={form.recensioni || ""} onChange={(e)=>setForm({...form,recensioni:e.target.value})} placeholder="Recensioni" />

          <textarea value={form.descrizione || ""} onChange={(e)=>setForm({...form,descrizione:e.target.value})} />
          <textarea value={form.descrizione_completa || ""} onChange={(e)=>setForm({...form,descrizione_completa:e.target.value})} />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleSave} style={{ background:"green",color:"#fff",marginRight:10 }}>Salva</button>
            <button onClick={handleDelete} style={{ background:"red",color:"#fff" }}>Elimina</button>
          </div>
        </div>
      )}

      {/* HERO */}
      <div className="venue-hero">
        <img
          src={imageMain}
          alt={locale.nome}
        />

        <div className="venue-hero-info">
          <h1>{locale.nome}</h1>

          <p>{fullAddress || placeholder(locale.indirizzo, "indirizzo")}</p>

          <div className="venue-meta-row">
            <span className="badge-category">{categoria}</span>
            <span className="badge-category">{placeholder(locale.price_range, "fascia prezzo")}</span>
            {verified && <span className="badge-category gold-badge">Verificato</span>}
            {featured && <span className="badge-category gold-badge">In evidenza</span>}
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

      {/* DETTAGLI TECNICI */}
      <div className="content-wrapper venue-section">
        <h2 className="section-title">Dettagli tecnici</h2>
        <div className="grid-wrapper" style={{ gap: 12, marginTop: 12 }}>
          <div className="rating-box">
            <p>Orari apertura</p>
            <div className="rating-value">{placeholder(locale.orari, "orari")}</div>
          </div>
          <div className="rating-box">
            <p>Stato Verifica</p>
            <div className="rating-value">{verified ? "Verificato" : "Non verificato"}</div>
          </div>
          <div className="rating-box">
            <p>Visibilita</p>
            <div className="rating-value">{featured ? "In evidenza" : "Standard"}</div>
          </div>
          <div className="rating-box">
            <p>Specialita</p>
            <div className="rating-value">{placeholder(locale.specialities, "specialita")}</div>
          </div>
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

    </div>
  );
}