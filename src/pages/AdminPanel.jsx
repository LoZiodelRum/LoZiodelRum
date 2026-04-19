// @ts-nocheck
import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPanel() {
  const [utenti, setUtenti] = useState([]);
  const [bartender, setBartender] = useState([]);
  const [proprietari, setProprietari] = useState([]);
  const [locali, setLocali] = useState([]);
  const [articoli, setArticoli] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLocale, setSelectedLocale] = useState(null);
  const [selectedArticolo, setSelectedArticolo] = useState(null);

  const [newArticle, setNewArticle] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const { data: profili, error: profiliError } = await supabase.from("Profili").select("*");
      if (profiliError) console.error("Errore Profili:", profiliError);
      else console.log("Profili:", profili);

      if (profili) {
        setUtenti(profili.filter((u) => u.ruolo === "utente"));
        setBartender(profili.filter((u) => u.ruolo === "bartender"));
        setProprietari(profili.filter((u) => u.ruolo === "proprietario"));
      }

      const { data: localiData, error: localiError } = await supabase
        .from("Locali")
        .select("*")
        .order("nome", { ascending: true });
      if (localiError) console.error("Errore Locali:", localiError);
      else console.log("Locali:", localiData);

      if (localiData) setLocali(localiData);

      const { data: articoliData, error: articoliError } = await supabase
        .from("articoli")
        .select("*")
        .order("data_creazione", { ascending: false });
      if (articoliError) console.error("Errore Articoli:", articoliError);
      else console.log("Articoli:", articoliData);

      if (articoliData) setArticoli(articoliData);
    } catch (err) {
      console.error("Errore fetchAll:", err);
    }
  }

  return (
    <div className="page fade-in" style={container}>
      <h1 style={title}>Pannello di Controllo</h1>

      {/* LOCALI */}
      <div style={section}>
        <h2 style={orangeTitle}>Locali</h2>

        <select
          style={select}
          onChange={(e) => {
            const loc = locali.find((l) => String(l.id) === String(e.target.value));
            setSelectedLocale(loc);
          }}
        >
          <option value="">Seleziona locale</option>
          {locali.map((l) => (
            <option key={l.id} value={String(l.id)}>
              {l.nome}
            </option>
          ))}
        </select>

        {selectedLocale && (
          <LocaleFullCard locale={selectedLocale} refresh={fetchAll} />
        )}
      </div>

      {/* UTENTI */}
      <div style={section}>
        <h2 style={orangeTitle}>Utenti</h2>

        <select
          style={select}
          onChange={(e) => {
            const u = utenti.find((x) => String(x.id) === String(e.target.value));
            setSelectedUser(u);
          }}
        >
          <option value="">Seleziona utente</option>
          {utenti.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.nome || u.email}
            </option>
          ))}
        </select>

        {selectedUser && (
          <UserFullCard user={selectedUser} refresh={fetchAll} />
        )}
      </div>

      {/* BARTENDER */}
      <div style={section}>
        <h2 style={orangeTitle}>Bartender</h2>
        <select style={select}>
          <option>Seleziona bartender</option>
          {bartender.map((b) => (
            <option key={b.id}>{b.nome}</option>
          ))}
        </select>
      </div>

      {/* PROPRIETARI */}
      <div style={section}>
        <h2 style={orangeTitle}>Proprietari</h2>
        <select style={select}>
          <option>Seleziona proprietario</option>
          {proprietari.map((p) => (
            <option key={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      {/* ARTICOLI */}
      <div style={section}>
        <h2 style={orangeTitle}>Articoli</h2>

        <select
          style={select}
          value={selectedArticolo ? String(selectedArticolo.id) : ""}
          onChange={(e) => {
            const value = e.target.value;
            const art = articoli.find((a) => String(a.id) === String(value));
            setSelectedArticolo(art);
            setNewArticle(false);
          }}
        >
          <option value="">Seleziona articolo</option>
          {articoli.map((a) => (
            <option key={String(a.id)} value={String(a.id)}>
              {a.titolo || a.slug || "Articolo"}
            </option>
          ))}
        </select>

        {selectedArticolo && (
          <ArticoloFullCard articolo={selectedArticolo} refresh={fetchAll} />
        )}

        {newArticle && <NuovoArticolo refresh={fetchAll} />}

        <div style={{ marginTop: 15 }}>
          <button
            style={orange}
            onClick={() => {
              setSelectedArticolo(null);
              setNewArticle(true);
            }}
          >
            Scrivi Articolo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= LOCALE ================= */

function LocaleFullCard({ locale, refresh }) {
  const [edit, setEdit] = useState(locale);

  function change(e) {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  }

  async function salva() {
    const { id, ...rest } = edit;
    const { error } = await supabase.from("Locali").update(rest).eq("id", id);
    if (error) console.error("Errore update Locale:", error);
    refresh();
  }

  async function approva() {
    const { error } = await supabase.from("Locali").update({ status: "approved" }).eq("id", edit.id);
    if (error) console.error("Errore approva Locale:", error);
    refresh();
  }

  async function elimina() {
    if (!confirm("Eliminare locale?")) return;
    const { error } = await supabase.from("Locali").delete().eq("id", edit.id);
    if (error) console.error("Errore elimina Locale:", error);
    refresh();
  }

  return (
    <div style={card}>
      <h3>Informazioni Locale</h3>

      <input name="nome" value={edit.nome || ""} onChange={change} placeholder="Nome locale" style={input} />
      <input name="indirizzo" value={edit.indirizzo || ""} onChange={change} placeholder="Indirizzo" style={input} />
      <input name="citta" value={edit.citta || ""} onChange={change} placeholder="Città" style={input} />
      <input name="telefono" value={edit.telefono || ""} onChange={change} placeholder="Telefono" style={input} />
      <input name="email" value={edit.email || ""} onChange={change} placeholder="Email locale" style={input} />

      <textarea name="descrizione" value={edit.descrizione || ""} onChange={change} placeholder="Descrizione breve" style={textarea} />
      <textarea name="recensioni" value={edit.recensioni || ""} onChange={change} placeholder="Recensioni" style={textarea} />

      <input name="slug" value={edit.slug || ""} onChange={change} placeholder="Slug URL" style={input} />
      <input name="price_range" value={edit.price_range || ""} onChange={change} placeholder="Fascia prezzo (€ / €€ / €€€)" style={input} />
      <input name="latitudine" value={edit.latitudine || ""} onChange={change} placeholder="Latitudine" style={input} />
      <input name="longitudine" value={edit.longitudine || ""} onChange={change} placeholder="Longitudine" style={input} />
      <input name="video_url" value={edit.video_url || ""} onChange={change} placeholder="URL Video" style={input} />
      <input name="image_url" value={edit.image_url || ""} onChange={change} placeholder="URL Immagine" style={input} />
      <input name="provincia" value={edit.provincia || ""} onChange={change} placeholder="Provincia" style={input} />
      <input name="paese" value={edit.paese || ""} onChange={change} placeholder="Paese" style={input} />
      <input name="sito" value={edit.sito || ""} onChange={change} placeholder="Sito Web" style={input} />
      <input name="instagram" value={edit.instagram || ""} onChange={change} placeholder="Instagram" style={input} />

      <textarea name="orari" value={edit.orari || ""} onChange={change} placeholder="Orari apertura" style={textarea} />
      <textarea name="descrizione_completa" value={edit.descrizione_completa || ""} onChange={change} placeholder="Descrizione completa" style={textarea} />

      <h3 style={{ marginTop: 16, marginBottom: 8, color: "#f97316" }}>Dati Tecnici</h3>
      <input name="qualita_drink" value={edit.qualita_drink || ""} onChange={change} placeholder="Qualità Drink (es. Eccellente)" style={input} />
      <input name="competenza_staff" value={edit.competenza_staff || ""} onChange={change} placeholder="Competenza Staff (es. Alta)" style={input} />
      <input name="atmosfera" value={edit.atmosfera || ""} onChange={change} placeholder="Atmosfera (es. Sofisticata)" style={input} />
      <input name="qualita_prezzo" value={edit.qualita_prezzo || ""} onChange={change} placeholder="Qualità/Prezzo (es. Buono)" style={input} />

      <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ccc" }}>
          <input
            type="checkbox"
            checked={!!edit.verificato}
            onChange={(e) => setEdit({ ...edit, verificato: e.target.checked })}
          />
          Verificato
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ccc" }}>
          <input
            type="checkbox"
            checked={!!edit.in_evidenza}
            onChange={(e) => setEdit({ ...edit, in_evidenza: e.target.checked })}
          />
          In Evidenza
        </label>
      </div>

      <select name="status" value={edit.status || ""} onChange={change} style={select}>
        <option value="pending">In attesa</option>
        <option value="approved">Approvato</option>
        <option value="rejected">Rifiutato</option>
      </select>

      <div style={actions}>
        <button style={green} onClick={approva}>Approva</button>
        <button style={blue} onClick={salva}>Salva</button>
        <button style={red} onClick={elimina}>Cancella</button>
      </div>
    </div>
  );
}

/* ================= ARTICOLO ================= */

function ArticoloFullCard({ articolo, refresh }) {
  const [edit, setEdit] = useState(articolo);

  function change(e) {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  }

  async function salva() {
    const { id, ...rest } = edit;
    const { error } = await supabase.from("articoli").update(rest).eq("id", id);
    if (error) console.error("Errore update Articolo:", error);
    refresh();
  }

  async function approva() {
    const { error } = await supabase.from("articoli").update({ pubblicato: true }).eq("id", edit.id);
    if (error) console.error("Errore approva Articolo:", error);
    refresh();
  }

  async function elimina() {
    if (!confirm("Eliminare articolo?")) return;
    const { error } = await supabase.from("articoli").delete().eq("id", edit.id);
    if (error) console.error("Errore elimina Articolo:", error);
    refresh();
  }

  return (
    <div style={card}>
      <h3>Articolo</h3>

      {/* CAMPO IMMAGINE HEADER */}
      <input
        name="immagine"
        value={edit.immagine || ""}
        onChange={change}
        placeholder="URL immagine header"
        style={input}
      />

      {/* CAMPO TESTO ARTICOLO */}
      <textarea
        name="contenuto"
        value={edit.contenuto || ""}
        onChange={change}
        placeholder="Scrivi articolo..."
        style={textarea}
      />

      {/* BOTTONI AZIONE (già esistono) */}
      <div style={actions}>
        <button style={green} onClick={approva}>Approva</button>
        <button style={blue} onClick={salva}>Salva</button>
        <button style={red} onClick={elimina}>Cancella</button>
      </div>
    </div>
  );
}

/* ================= NUOVO ARTICOLO ================= */

function NuovoArticolo({ refresh }) {
  const [data, setData] = useState({
    titolo: "",
    contenuto: "",
    immagine: "",
  });

  function change(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function crea() {
    const { error } = await supabase.from("articoli").insert([
      {
        titolo: data.titolo,
        contenuto: data.contenuto,
        immagine: data.immagine,
        pubblicato: false,
      },
    ]);
    if (error) console.error("Errore crea Articolo:", error);
    refresh();
  }

  return (
    <div style={card}>
      <h3>Nuovo Articolo</h3>

      <input name="titolo" value={data.titolo} onChange={change} placeholder="Titolo" style={input} />
      <input name="immagine" value={data.immagine} onChange={change} placeholder="URL immagine header" style={input} />
      <textarea name="contenuto" value={data.contenuto} onChange={change} placeholder="Scrivi articolo..." style={textarea} />

      <button style={green} onClick={crea}>Crea Articolo</button>
    </div>
  );
}

/* ================= USER ================= */

function UserFullCard({ user, refresh }) {
  const [edit, setEdit] = useState(user);

  function change(e) {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  }

  async function salva() {
    const { id, ...rest } = edit;
    const { error } = await supabase.from("Profili").update(rest).eq("id", id);
    if (error) console.error("Errore update Utente:", error);
    refresh();
  }



  async function elimina() {
    if (!confirm("Eliminare utente?")) return;
    const { error } = await supabase.from("Profili").delete().eq("id", edit.id);
    if (error) console.error("Errore elimina Utente:", error);
    refresh();
  }

  return (
    <div style={card}>
      <h3>Dati Utente</h3>

      <input name="nome" value={edit.nome || ""} onChange={change} placeholder="Nome utente" style={input} />
      <input name="email" value={edit.email || ""} onChange={change} placeholder="Email utente" style={input} />

      <div style={actions}>
        <button style={blue} onClick={salva}>Salva</button>
        <button style={red} onClick={elimina}>Cancella</button>
      </div>
    </div>
  );
}

/* ================= STILI ================= */

const container = {
  padding: "60px 120px",
  background: "#000",
  minHeight: "100vh",
  color: "white",
};

const title = {
  fontSize: 32,
  marginBottom: 40,
};

const orangeTitle = {
  color: "#f5a623",
};

const section = {
  marginBottom: 60,
};

const card = {
  background: "#0f172a",
  padding: 30,
  borderRadius: 20,
  marginTop: 20,
  width: "min(100%, 500px)",
  display: "flex",
  flexDirection: "column",
  gap: 15,
};

const input = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#020617",
  color: "white",
};

const textarea = {
  ...input,
  minHeight: 100,
};

const select = {
  ...input,
  width: "min(100%, 260px)",
};

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const green = { background: "#16a34a", padding: "10px 14px", borderRadius: 8 };
const blue = { background: "#2563eb", padding: "10px 14px", borderRadius: 8 };
const red = { background: "#dc2626", padding: "10px 14px", borderRadius: 8 };
const orange = { background: "#f5a623", padding: "10px 14px", borderRadius: 8 };