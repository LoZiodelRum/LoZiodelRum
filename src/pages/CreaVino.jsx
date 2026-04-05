import "../App.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const initialVino = {
  nome: "",
  annata: "",
  cantina: "",
  vitigno: "",
  grado_alcolico: "",
  zona: "",
  denominazione: "",
  immagine: "",
  limpidezza: "Limpido",
  colore: "Rosso rubino",
  consistenza: "Consistente",
  effervescenza: "Assente",
  intensita_olfattiva: "Abbastanza intenso",
  complessita: "Abbastanza complesso",
  qualita_olfattiva: "Abbastanza fine",
  descrizione_olfattiva: "",
  zuccheri: "Secco",
  alcoli: "Abbastanza alcolico",
  polialcoli: "Abbastanza morbido",
  acidita: "Fresco",
  tannini: "Tannici",
  sali_minerali: "Abbastanza sapido",
  equilibrio: "Abbastanza equilibrato",
  intensita_gusto: "Abbastanza intenso",
  persistenza: "Persistente",
  qualita_gusto: "Abbastanza fine",
  corpo: "Di corpo",
  stato_evolutivo: "Pronto",
  armonia: "Abbastanza armonico",
  abbinamenti: "",
  temperatura_servizio: "",
  note_personali: "",
  valutazione: "",
};

const selectOptions = {
  limpidezza: ["Limpido", "Cristallino", "Velato"],
  colore: ["Rosso porpora", "Rosso rubino", "Rosso granato", "Rosso aranciato"],
  consistenza: ["Fluido", "Poco consistente", "Consistente", "Viscoso"],
  effervescenza: ["Assente", "Fine", "Abbastanza fine", "Persistente"],
  intensita_olfattiva: ["Carenze", "Poco intenso", "Abbastanza intenso", "Intenso", "Molto intenso"],
  complessita: ["Carenze", "Poco complesso", "Abbastanza complesso", "Complesso", "Ampio"],
  qualita_olfattiva: ["Comune", "Poco fine", "Abbastanza fine", "Fine", "Eccellente"],
  descrizione_olfattiva: ["Fruttato", "Floreale", "Speziato", "Erbaceo", "Minerale", "Tostato"],
  zuccheri: ["Secco", "Abboccato", "Amabile", "Dolce"],
  alcoli: ["Leggero", "Poco alcolico", "Abbastanza alcolico", "Caldo"],
  polialcoli: ["Poco morbido", "Abbastanza morbido", "Morbido", "Pastoso"],
  acidita: ["Piatto", "Poco fresco", "Fresco", "Acidulo"],
  tannini: ["Morbidi", "Poco tannici", "Tannici", "Astringenti"],
  sali_minerali: ["Poco sapido", "Abbastanza sapido", "Sapido"],
  equilibrio: ["Poco equilibrato", "Abbastanza equilibrato", "Equilibrato"],
  intensita_gusto: ["Poco intenso", "Abbastanza intenso", "Intenso", "Molto intenso"],
  persistenza: ["Corto", "Poco persistente", "Persistente", "Molto persistente"],
  qualita_gusto: ["Comune", "Poco fine", "Abbastanza fine", "Fine", "Eccellente"],
  corpo: ["Magro", "Debole", "Di corpo", "Robusto", "Pesante"],
  stato_evolutivo: ["Immaturo", "Giovane", "Pronto", "Maturo", "Vecchio"],
  armonia: ["Poco armonico", "Abbastanza armonico", "Armonico"],
};

const fieldsetStyle = {
  border: "1px solid rgba(82,82,91,0.5)",
  borderRadius: 12,
  padding: 14,
  marginBottom: 14,
};

const labelStyle = {
  display: "block",
  color: "#d6d3d1",
  fontSize: 13,
  marginBottom: 6,
};

const selectStyle = {
  width: "100%",
  background: "#0f0f10",
  border: "1px solid #3f3f46",
  color: "#f5f5f5",
  borderRadius: 8,
  padding: "10px 12px",
};

const inputStyle = {
  width: "100%",
  background: "#0f0f10",
  border: "1px solid #3f3f46",
  color: "#f5f5f5",
  borderRadius: 8,
  padding: "10px 12px",
};

export default function CreaVino() {
  const [vino, setVino] = useState(initialVino);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setVino({ ...vino, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = (e) => {
    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setVino({ ...vino, descrizione_olfattiva: values.join(",") });
  };

  const selectedAromi = vino.descrizione_olfattiva
    ? vino.descrizione_olfattiva.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

  async function handleUpload(file) {
    if (!file) return;

    setUploading(true);
    const filePath = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("vini")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      alert(uploadError.message || "Upload fallito");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("vini").getPublicUrl(filePath);

    setVino((prev) => ({ ...prev, immagine: data.publicUrl }));
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...vino,
      valutazione: vino.valutazione ? Number(vino.valutazione) : null,
    };

    const { error } = await supabase.from("vini").insert([payload]);

    if (error) {
      alert(error.message || "Errore salvataggio");
      setSaving(false);
      return;
    }

    alert("Vino registrato con successo");
    setVino(initialVino);
    setSaving(false);
  }

  return (
    <div className="page fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Registrazione Vino Rosso (AIS)</h1>

      <img src="/assets/ais-schema.jpg" className="mb-6 rounded-xl" style={{ width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 16, marginBottom: 18, background: "#111" }} alt="Schema AIS degustazione vino" />

      <form onSubmit={handleSubmit} style={{ background: "#171717", border: "1px solid #3f3f46", borderRadius: 16, padding: 18 }}>
        <fieldset style={fieldsetStyle}>
          <legend style={{ color: "#f59e0b", padding: "0 6px" }}>Dati Base</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <input name="nome" placeholder="Nome vino" value={vino.nome} onChange={handleChange} style={inputStyle} required />
            <input name="annata" placeholder="Annata" value={vino.annata} onChange={handleChange} style={inputStyle} />
            <input name="cantina" placeholder="Cantina" value={vino.cantina} onChange={handleChange} style={inputStyle} />
            <input name="vitigno" placeholder="Vitigno" value={vino.vitigno} onChange={handleChange} style={inputStyle} />
            <input name="grado_alcolico" placeholder="Grado alcolico" value={vino.grado_alcolico} onChange={handleChange} style={inputStyle} />
            <input name="zona" placeholder="Zona" value={vino.zona} onChange={handleChange} style={inputStyle} />
            <input name="denominazione" placeholder="Denominazione" value={vino.denominazione} onChange={handleChange} style={inputStyle} />
            <input name="abbinamenti" placeholder="Abbinamenti" value={vino.abbinamenti} onChange={handleChange} style={inputStyle} />
            <input name="temperatura_servizio" placeholder="Temperatura servizio" value={vino.temperatura_servizio} onChange={handleChange} style={inputStyle} />
            <input name="note_personali" placeholder="Note personali" value={vino.note_personali} onChange={handleChange} style={inputStyle} />
            <input name="valutazione" placeholder="Valutazione (0-100)" value={vino.valutazione} onChange={handleChange} style={inputStyle} type="number" min="0" max="100" />
            <input name="immagine" placeholder="URL immagine" value={vino.immagine} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Upload foto vino (bucket: vini)</label>
            <input type="file" accept="image/*" onChange={(e) => void handleUpload(e.target.files?.[0])} style={inputStyle} />
            <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 6 }}>{uploading ? "Upload in corso..." : ""}</div>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={{ color: "#f59e0b", padding: "0 6px" }}>Esame Visivo (AIS)</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div>
              <label style={labelStyle}>Limpidezza</label>
              <select name="limpidezza" value={vino.limpidezza} onChange={handleChange} style={selectStyle}>{selectOptions.limpidezza.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Colore</label>
              <select name="colore" value={vino.colore} onChange={handleChange} style={selectStyle}>{selectOptions.colore.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Consistenza</label>
              <select name="consistenza" value={vino.consistenza} onChange={handleChange} style={selectStyle}>{selectOptions.consistenza.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Effervescenza</label>
              <select name="effervescenza" value={vino.effervescenza} onChange={handleChange} style={selectStyle}>{selectOptions.effervescenza.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={{ color: "#f59e0b", padding: "0 6px" }}>Esame Olfattivo (AIS)</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div>
              <label style={labelStyle}>Intensita olfattiva</label>
              <select name="intensita_olfattiva" value={vino.intensita_olfattiva} onChange={handleChange} style={selectStyle}>{selectOptions.intensita_olfattiva.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Complessita</label>
              <select name="complessita" value={vino.complessita} onChange={handleChange} style={selectStyle}>{selectOptions.complessita.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Qualita olfattiva</label>
              <select name="qualita_olfattiva" value={vino.qualita_olfattiva} onChange={handleChange} style={selectStyle}>{selectOptions.qualita_olfattiva.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Descrizione olfattiva (multi select)</label>
              <select multiple name="descrizione_olfattiva" value={selectedAromi} onChange={handleMultiSelect} style={{ ...selectStyle, minHeight: 120 }}>
                {selectOptions.descrizione_olfattiva.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={{ color: "#f59e0b", padding: "0 6px" }}>Esame Gusto-Olfattivo (AIS)</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div><label style={labelStyle}>Zuccheri</label><select name="zuccheri" value={vino.zuccheri} onChange={handleChange} style={selectStyle}>{selectOptions.zuccheri.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Alcoli</label><select name="alcoli" value={vino.alcoli} onChange={handleChange} style={selectStyle}>{selectOptions.alcoli.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Polialcoli</label><select name="polialcoli" value={vino.polialcoli} onChange={handleChange} style={selectStyle}>{selectOptions.polialcoli.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Acidita</label><select name="acidita" value={vino.acidita} onChange={handleChange} style={selectStyle}>{selectOptions.acidita.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Tannini</label><select name="tannini" value={vino.tannini} onChange={handleChange} style={selectStyle}>{selectOptions.tannini.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Sali minerali</label><select name="sali_minerali" value={vino.sali_minerali} onChange={handleChange} style={selectStyle}>{selectOptions.sali_minerali.map((o) => <option key={o}>{o}</option>)}</select></div>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={{ color: "#f59e0b", padding: "0 6px" }}>Finale (AIS)</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div><label style={labelStyle}>Equilibrio</label><select name="equilibrio" value={vino.equilibrio} onChange={handleChange} style={selectStyle}>{selectOptions.equilibrio.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Intensita gusto</label><select name="intensita_gusto" value={vino.intensita_gusto} onChange={handleChange} style={selectStyle}>{selectOptions.intensita_gusto.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Persistenza</label><select name="persistenza" value={vino.persistenza} onChange={handleChange} style={selectStyle}>{selectOptions.persistenza.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Qualita gusto</label><select name="qualita_gusto" value={vino.qualita_gusto} onChange={handleChange} style={selectStyle}>{selectOptions.qualita_gusto.map((o) => <option key={o}>{o}</option>)}</select></div>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={{ color: "#f59e0b", padding: "0 6px" }}>Struttura, Evoluzione, Armonia (AIS)</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div><label style={labelStyle}>Corpo</label><select name="corpo" value={vino.corpo} onChange={handleChange} style={selectStyle}>{selectOptions.corpo.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Stato evolutivo</label><select name="stato_evolutivo" value={vino.stato_evolutivo} onChange={handleChange} style={selectStyle}>{selectOptions.stato_evolutivo.map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>Armonia</label><select name="armonia" value={vino.armonia} onChange={handleChange} style={selectStyle}>{selectOptions.armonia.map((o) => <option key={o}>{o}</option>)}</select></div>
          </div>
        </fieldset>

        <button className="btn-primary" type="submit" disabled={saving || uploading}>
          {saving ? "Salvataggio..." : "Salva Scheda Vino"}
        </button>
      </form>
    </div>
  );
}
