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
  categorie: string;
  specialities: string;
  orari: string;
  price_range: string;

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
  const { role } = useUser(); // ✅ AGGIUNTO
  const isAdmin = role === "admin"; // ✅ AGGIUNTO

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

  if (!locale) return <div style={{ padding: 40 }}>Caricamento...</div>;

  const placeholder = (value: string | null | undefined, label: string) =>
    value && value !== "" ? value : `Non disponibile (${label})`;

  const giudizio = (value: string | null | undefined) =>
    value && value !== "" ? value : "Non valutato";

  return (
    <div style={{ color: "white" }}>

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

          <textarea value={form.descrizione || ""} onChange={(e)=>setForm({...form,descrizione:e.target.value})} />
          <textarea value={form.descrizione_completa || ""} onChange={(e)=>setForm({...form,descrizione_completa:e.target.value})} />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleSave} style={{ background:"green",color:"#fff",marginRight:10 }}>Salva</button>
            <button onClick={handleDelete} style={{ background:"red",color:"#fff" }}>Elimina</button>
          </div>
        </div>
      )}

      {/* HERO */}
      <div
        style={{
          position: "relative",
          height: 340,
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 30,
        }}
      >
        <img
          src={locale.image_url || locale.image}
          alt={locale.nome}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            textShadow: "0 2px 6px rgba(0,0,0,0.9)",
          }}
        >
          <h1>{locale.nome}</h1>

          <p>
            {placeholder(locale.indirizzo, "indirizzo")},{" "}
            {placeholder(locale.citta, "città")}
          </p>

          <span
            style={{
              border: "1px solid #f5a623",
              padding: "4px 10px",
              borderRadius: 6,
              background: "rgba(0,0,0,0.4)",
            }}
          >
            {locale.price_range}
          </span>
        </div>
      </div>

      {/* DESCRIZIONE */}
      <div style={{ padding: "0 20px", marginBottom: 30 }}>
        <p>
          {locale.descrizione_completa || locale.descrizione || "Descrizione non disponibile"}
        </p>
      </div>

      {/* VALUTAZIONI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          padding: "0 20px",
          marginBottom: 40,
        }}
      >
        {[
          { label: "Qualità Drink", value: locale.qualita_drink },
          { label: "Competenza Staff", value: locale.competenza_staff },
          { label: "Atmosfera", value: locale.atmosfera },
          { label: "Qualità/Prezzo", value: locale.qualita_prezzo },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#111",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <p>{item.label}</p>

            <div
              style={{
                marginTop: 10,
                padding: 10,
                background: "#000",
                borderRadius: 6,
                border: "1px solid #333",
              }}
            >
              {giudizio(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* RECENSIONI */}
      <div style={{ padding: "0 20px", marginBottom: 40 }}>
        <h2>Recensioni</h2>

        {recensioni.map((rec) => (
          <div
            key={rec.id}
            style={{
              background: "#111",
              padding: 20,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <p>{rec.commento}</p>

            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.5 }}>
              {new Date(rec.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* MEDIA */}
      <div style={{ padding: "0 20px", marginBottom: 60 }}>
        <h2>Foto e Video</h2>

        {media.length === 0 && <p>Nessun contenuto disponibile</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))",
            gap: 10,
            marginTop: 20,
          }}
        >
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