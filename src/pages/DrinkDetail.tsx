import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function DrinkDetail() {
  const { id } = useParams();
  const { role } = useUser();
  const isAdmin = role === "admin";

  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data: cocktail } = await supabase
      .from("cocktail")
      .select("*")
      .eq("id", id)
      .single();

    if (cocktail) {
      const obj = { ...cocktail, type: "cocktail" };
      setData(obj);
      setForm(obj);
      return;
    }

    const { data: distillato } = await supabase
      .from("distillati")
      .select("*")
      .eq("id", id)
      .single();

    if (distillato) {
      const obj = { ...distillato, type: "distillato" };
      setData(obj);
      setForm(obj);
    }
  }

  async function handleSave() {
    const table = form.type === "cocktail" ? "cocktail" : "distillati";

    const { error } = await supabase
      .from(table)
      .update({
        ...form,
        immagine: form.immagine || form.immagine_url || form.image || form.img,
      })
      .eq("id", form.id);

    if (error) {
      alert("Errore salvataggio");
      return;
    }

    setData(form);
    alert("Salvato ✅");
  }

  async function handleDelete() {
    const ok = confirm("Eliminare?");
    if (!ok) return;

    const table = form.type === "cocktail" ? "cocktail" : "distillati";

    await supabase.from(table).delete().eq("id", form.id);

    window.location.href = "/drink";
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
      immagine: url,
      immagine_url: url,
      image: url,
      img: url,
    });

    setUploading(false);
  }

  if (!data) {
    return <div className="page fade-in">Caricamento...</div>;
  }

  function getImage(obj: any) {
    return obj.immagine || obj.immagine_url || obj.image || obj.img || null;
  }

  function input(name: string, label: string, type = "text") {
    return (
      <div style={field}>
        <label>{label}</label>
        <input
          type={type}
          value={form[name] || ""}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          style={inputStyle}
        />
      </div>
    );
  }

  function textarea(name: string, label: string) {
    return (
      <div style={field}>
        <label>{label}</label>
        <textarea
          value={form[name] || ""}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          style={textareaStyle}
        />
      </div>
    );
  }

  return (
    <div className="page fade-in" style={container}>

      {/* 🔧 EDITOR ADMIN */}
      {isAdmin && form && (
        <div style={editorBox}>
          <h2>Editor Admin</h2>

          {/* IMMAGINE */}
          <div style={{ marginBottom: 20 }}>
            <label>Immagine</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />

            {uploading && <p>Upload in corso...</p>}

            {getImage(form) && (
              <img
                src={getImage(form)}
                style={{ width: "min(100%, 7.5rem)", marginTop: 10, borderRadius: 8 }}
              />
            )}
          </div>

          {input("nome", "Nome")}
          {textarea("descrizione", "Descrizione")}

          {form.type === "cocktail" && (
            <>
              {textarea("preparazione", "Preparazione")}
              {textarea("consigli", "Consigli")}
              {input("bicchiere", "Bicchiere")}
              {input("guarnizione", "Guarnizione")}
              {input("gradazione_alcolica", "Gradazione", "number")}
              {textarea("ingredienti", "Ingredienti (separati da ;)")}
            </>
          )}

          {form.type === "distillato" && (
            <>
              {textarea("storia", "Storia")}
              {textarea("esame_visivo", "Esame visivo")}
              {textarea("esame_olfattivo", "Esame olfattivo")}
              {textarea("esame_gustativo", "Esame gustativo")}
              {textarea("finale", "Finale")}
              {textarea("note_aromatiche", "Note aromatiche")}
              {textarea("modo_consumo", "Modo consumo")}
              {input("marca", "Marca")}
              {input("distilleria", "Distilleria")}
              {input("categoria", "Categoria")}
              {input("sottocategoria", "Sottocategoria")}
              {input("paese", "Paese")}
              {input("regione", "Regione")}
              {input("invecchiamento", "Invecchiamento")}
              {input("tipo_botte", "Tipo botte")}
              {input("gradazione_alcolica", "Gradazione", "number")}
              {input("volume_bottiglia", "Volume bottiglia", "number")}
              {input("prezzo_medio", "Prezzo medio", "number")}
            </>
          )}

          <div style={buttons}>
            <button style={btnGreen} onClick={handleSave}>Salva</button>
            <button style={btnRed} onClick={handleDelete}>Elimina</button>
          </div>
        </div>
      )}

      {/* 🔥 UI ORIGINALE */}
      <div style={layout}>

        <div style={left}>
          <h1 style={title}>{data.nome}</h1>

          {data.descrizione && (
            <p style={description}>{data.descrizione}</p>
          )}

          {data.type === "cocktail" && (
            <>
              {data.preparazione && (
                <>
                  <h2 style={sectionTitle}>Preparazione</h2>
                  <p style={text}>{data.preparazione}</p>
                </>
              )}

              {data.consigli && (
                <>
                  <h2 style={sectionTitle}>Consigli</h2>
                  <p style={text}>{data.consigli}</p>
                </>
              )}

              {data.bicchiere && <p style={info}>Bicchiere: {data.bicchiere}</p>}
              {data.guarnizione && <p style={info}>Guarnizione: {data.guarnizione}</p>}
              {data.gradazione_alcolica && <p style={info}>Gradazione: {data.gradazione_alcolica}°</p>}
            </>
          )}

          {data.type === "distillato" && (
            <>
              {data.storia && (
                <>
                  <h2 style={sectionTitle}>Storia</h2>
                  <p style={text}>{data.storia}</p>
                </>
              )}

              {data.descrizione && (
                <>
                  <h2 style={sectionTitle}>Descrizione</h2>
                  <p style={text}>{data.descrizione}</p>
                </>
              )}

              {data.esame_visivo && (
                <>
                  <h2 style={sectionTitle}>Esame visivo</h2>
                  <p style={text}>{data.esame_visivo}</p>
                </>
              )}

              {data.esame_olfattivo && (
                <>
                  <h2 style={sectionTitle}>Esame olfattivo</h2>
                  <p style={text}>{data.esame_olfattivo}</p>
                </>
              )}

              {data.esame_gustativo && (
                <>
                  <h2 style={sectionTitle}>Esame gustativo</h2>
                  <p style={text}>{data.esame_gustativo}</p>
                </>
              )}

              {data.finale && (
                <>
                  <h2 style={sectionTitle}>Finale</h2>
                  <p style={text}>{data.finale}</p>
                </>
              )}

              {data.note_aromatiche && (
                <>
                  <h2 style={sectionTitle}>Note aromatiche</h2>
                  <p style={text}>{data.note_aromatiche}</p>
                </>
              )}

              {data.modo_consumo && (
                <>
                  <h2 style={sectionTitle}>Come berlo</h2>
                  <p style={text}>{data.modo_consumo}</p>
                </>
              )}
            </>
          )}
        </div>

        <div style={right}>
          {getImage(data) && <img src={getImage(data)} style={image} />}

          {data.type === "cocktail" && data.ingredienti && (
            <div style={box}>
              <h3 style={boxTitle}>Ingredienti</h3>
              {data.ingredienti.split(";").map((ing: string, i: number) => (
                <div key={i} style={row}>{ing}</div>
              ))}
            </div>
          )}

          {data.type === "distillato" && (
            <div style={box}>
              <h3 style={boxTitle}>Dettagli</h3>
              {data.marca && <p style={row}>Marca: {data.marca}</p>}
              {data.distilleria && <p style={row}>Distilleria: {data.distilleria}</p>}
              {data.categoria && <p style={row}>Categoria: {data.categoria}</p>}
              {data.sottocategoria && <p style={row}>Sottocategoria: {data.sottocategoria}</p>}
              {data.paese && <p style={row}>Paese: {data.paese}</p>}
              {data.regione && <p style={row}>Regione: {data.regione}</p>}
              {data.invecchiamento && <p style={row}>Invecchiamento: {data.invecchiamento}</p>}
              {data.tipo_botte && <p style={row}>Botte: {data.tipo_botte}</p>}
              {data.gradazione_alcolica && <p style={row}>Grado: {data.gradazione_alcolica}°</p>}
              {data.volume_bottiglia && <p style={row}>Volume: {data.volume_bottiglia} ml</p>}
              {data.prezzo_medio && <p style={row}>Prezzo medio: €{data.prezzo_medio}</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* STILI ORIGINALI */

const container = {
  padding: 16,
  background: "#F5F5F0",
  minHeight: "100%",
};

const layout = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 60,
  maxWidth: "min(100%, 68rem)",
  margin: "0 auto",
};

const left = { flex: 1 };
const right = { flex: "1 1 320px" };

const title = {
  fontSize: "clamp(1.8rem, 5vw, 2.25rem)",
  marginBottom: 20,
  color: "#4b2e1f",
};

const description = { marginBottom: 20, color: "#333" };

const sectionTitle = {
  marginTop: 25,
  marginBottom: 8,
  fontSize: 18,
  color: "#4b2e1f",
};

const text = { color: "#444" };

const image = {
  width: "100%",
  borderRadius: 16,
  marginBottom: 20,
};

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  overflow: "hidden",
};

const boxTitle = { marginBottom: 10, color: "#4b2e1f" };

const row = {
  padding: "6px 0",
  borderBottom: "1px solid #eee",
  color: "#4b2e1f",
};

const info = { marginTop: 10, color: "#444" };

const editorBox = {
  background: "#fff",
  padding: 20,
  marginBottom: 30,
  borderRadius: 16,
  overflow: "hidden",
};

const field = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const inputStyle = {
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const textareaStyle = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const buttons = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const btnGreen = {
  background: "green",
  color: "#fff",
  padding: "8px 16px",
};

const btnRed = {
  background: "red",
  color: "#fff",
  padding: "8px 16px",
};