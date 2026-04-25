import Navbar from "../components/Navbar";
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
  const [cocktail, setCocktail] = useState([]);
  const [distillati, setDistillati] = useState([]);
  const [vini, setVini] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [selectedDistillato, setSelectedDistillato] = useState(null);
  const [selectedVino, setSelectedVino] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLocale, setSelectedLocale] = useState(null);
  const [selectedArticolo, setSelectedArticolo] = useState(null);
  const [newArticle, setNewArticle] = useState(false);

  // Carica dati menu a tendina
  useEffect(() => {
    async function fetchAll() {
      const [utRes, baRes, prRes, loRes, arRes, coRes, diRes, viRes] = await Promise.all([
        supabase.from("Profili").select("*"),
        supabase.from("Profili").select("*").ilike("ruolo", "%bartender%"),
        supabase.from("Profili").select("*").ilike("ruolo", "%proprietario%"),
        supabase.from("Locali").select("*"),
        supabase.from("articoli").select("*"),
        supabase.from("cocktail").select("*"),
        supabase.from("distillati").select("*"),
        supabase.from("vini").select("*"),
      ]);
      setUtenti(utRes.data || []);
      setBartender(baRes.data || []);
      setProprietari(prRes.data || []);
      setLocali((loRes.data || []).slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
      setArticoli(arRes.data || []);
      setCocktail((coRes.data || []).slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
      setDistillati((diRes.data || []).slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
      setVini((viRes.data || []).slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
    }
    fetchAll();
  }, []);

  // Stili responsive per select
  const mobileSelect = {
    ...select,
    width: "100%",
    maxWidth: 420,
    marginLeft: 0,
    marginRight: "auto",
    display: "block",
    fontSize: 18,
    padding: 16,
  };

  // Rileva mobile
  const isMobile = window.innerWidth <= 600;

  return (
    <>
      <Navbar />
      <style>{`
        @media (max-width: 600px) {
          .admin-section {
            margin-bottom: 40px !important;
          }
          .admin-select {
            width: 100% !important;
            max-width: 420px !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            display: block !important;
            font-size: 18px !important;
            padding: 16px !important;
          }
        }
      `}</style>
      <div className="page fade-in" style={container}>
        <h1 style={title}>Pannello di Controllo</h1>

        {/* LOCALI E MENU DRINK */}
        <div className="admin-section" style={section}>
          <h2 style={orangeTitle}>Locali</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
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
            <LocaleFullCard locale={selectedLocale} refresh={() => {}} />
          )}

          {/* COCKTAIL */}
          <h2 style={{...orangeTitle, marginTop: 32}}>Cocktail</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedCocktail(cocktail.find(c => String(c.id) === String(e.target.value)))}
          >
            <option value="">Seleziona cocktail</option>
            {cocktail.map(c => (
              <option key={c.id} value={String(c.id)}>{c.nome}</option>
            ))}
          </select>

          {/* DISTILLATI */}
          <h2 style={{...orangeTitle, marginTop: 32}}>Distillati</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedDistillato(distillati.find(d => String(d.id) === String(e.target.value)))}
          >
            <option value="">Seleziona distillato</option>
            {distillati.map(d => (
              <option key={d.id} value={String(d.id)}>{d.nome}</option>
            ))}
          </select>

          {/* VINI */}
          <h2 style={{...orangeTitle, marginTop: 32}}>Vini</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedVino(vini.find(v => String(v.id) === String(e.target.value)))}
          >
            <option value="">Seleziona vino</option>
            {vini.map(v => (
              <option key={v.id} value={String(v.id)}>{v.nome}</option>
            ))}
          </select>
        </div>

        {/* UTENTI */}
        <div className="admin-section" style={section}>
          <h2 style={orangeTitle}>Utenti</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
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
            <UserFullCard user={selectedUser} refresh={() => {}} />
          )}
        </div>

        {/* BARTENDER */}
        <div className="admin-section" style={section}>
          <h2 style={orangeTitle}>Bartender</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
          >
            <option>Seleziona bartender</option>
            {bartender.map((b) => (
              <option key={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>

        {/* PROPRIETARI */}
        <div className="admin-section" style={section}>
          <h2 style={orangeTitle}>Proprietari</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
          >
            <option>Seleziona proprietario</option>
            {proprietari.map((p) => (
              <option key={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* ARTICOLI */}
        <div className="admin-section" style={section}>
          <h2 style={orangeTitle}>Articoli</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
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
              <option key={a.id} value={String(a.id)}>
                {a.titolo}
              </option>
            ))}
          </select>
          {selectedArticolo && (
            <ArticleFullCard articolo={selectedArticolo} refresh={() => {}} />
          )}
        </div>
      </div>
    </>
  );
}

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