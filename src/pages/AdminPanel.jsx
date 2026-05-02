
import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const MENU_OPTIONS = [
  { label: "Locali", value: "locali" },
  { label: "Cocktail", value: "cocktail" },
  { label: "Distillati", value: "distillati" },
  { label: "Vini", value: "vini" },
  { label: "Utenti", value: "utenti" },
  { label: "Proprietari", value: "proprietari" },
  { label: "Bartender", value: "bartender" },
  { label: "Articoli", value: "articoli" },
];

const TABLE_MAP = {
  locali: { table: "locali", label: "nome" },
  cocktail: { table: "cocktail", label: "nome" },
  distillati: { table: "distillati", label: "nome" },
  vini: { table: "vini", label: "nome" },
  utenti: { table: "profili", label: "nome" },
  proprietari: { table: "profili", label: "nome", filter: { ruolo: "proprietario" } },
  bartender: { table: "profili", label: "nome", filter: { ruolo: "bartender" } },
  articoli: { table: "articoli", label: "titolo" },
};



export default function AdminPanel() {
  const [locali, setLocali] = useState([]);
  const [cocktail, setCocktail] = useState([]);
  const [distillati, setDistillati] = useState([]);
  const [vini, setVini] = useState([]);
  const [utenti, setUtenti] = useState([]);
  const [bartender, setBartender] = useState([]);
  const [proprietari, setProprietari] = useState([]);
  const [articoli, setArticoli] = useState([]);

  const [selectedLocale, setSelectedLocale] = useState(null);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [selectedDistillato, setSelectedDistillato] = useState(null);
  const [selectedVino, setSelectedVino] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedArticolo, setSelectedArticolo] = useState(null);
  const [newArticle, setNewArticle] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [{ data: localiData }, { data: cocktailData }, { data: distillatiData }, { data: viniData }, { data: utentiData }, { data: articoliData }] = await Promise.all([
        supabase.from("locali").select("*"),
        supabase.from("cocktail").select("*"),
        supabase.from("distillati").select("*"),
        supabase.from("vini").select("*"),
        supabase.from("profili").select("*"),
        supabase.from("articoli").select("*"),
      ]);
      setLocali(localiData || []);
      setCocktail(cocktailData || []);
      setDistillati(distillatiData || []);
      setVini(viniData || []);
      setUtenti(utentiData || []);
      setArticoli(articoliData || []);
      setBartender((utentiData || []).filter(u => u.ruolo === "bartender"));
      setProprietari((utentiData || []).filter(u => u.ruolo === "proprietario"));
    }
    fetchData();
  }, []);

  const isMobile = window.innerWidth <= 600;
  const selectStyle = isMobile ? mobileSelect : select;

  function refreshArticoli() {
    supabase.from("articoli").select("*").then(({ data }) => setArticoli(data || []));
  }
  function refreshUtenti() {
    supabase.from("profili").select("*").then(({ data }) => {
      setUtenti(data || []);
      setBartender((data || []).filter(u => u.ruolo === "bartender"));
      setProprietari((data || []).filter(u => u.ruolo === "proprietario"));
    });
  }

  return (
    <div className="page fade-in" style={container}>
      <Navbar />
      <h1 style={title}>Pannello di Controllo</h1>

      {/* Locali */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Locali</h2>
        <select
          className="admin-select"
          style={selectStyle}
          onChange={e => {
            const loc = locali.find(l => String(l.id) === String(e.target.value));
            setSelectedLocale(loc);
          }}
        >
          <option value="">Seleziona</option>
          {locali.map(l => (
            <option key={l.id} value={String(l.id)}>{l.nome}</option>
          ))}
        </select>
        {selectedLocale && (
          <LocaleFullCard locale={selectedLocale} refresh={() => {}} />
        )}
      </div>

      {/* Cocktail */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Cocktail</h2>
        <select
          className="admin-select"
          style={selectStyle}
          onChange={e => setSelectedCocktail(cocktail.find(c => String(c.id) === String(e.target.value)))}
        >
          <option value="">Seleziona</option>
          {cocktail.map(c => (
            <option key={c.id} value={String(c.id)}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Distillati */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Distillati</h2>
        <select
          className="admin-select"
          style={selectStyle}
          onChange={e => setSelectedDistillato(distillati.find(d => String(d.id) === String(e.target.value)))}
        >
          <option value="">Seleziona</option>
          {distillati.map(d => (
            <option key={d.id} value={String(d.id)}>{d.nome}</option>
          ))}
        </select>
      </div>

      {/* Vini */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Vini</h2>
        <select
          className="admin-select"
          style={selectStyle}
          onChange={e => setSelectedVino(vini.find(v => String(v.id) === String(e.target.value)))}
        >
          <option value="">Seleziona</option>
          {vini.map(v => (
            <option key={v.id} value={String(v.id)}>{v.nome}</option>
          ))}
        </select>
      </div>

      {/* Utenti */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Utenti</h2>
        <select
          className="admin-select"
          style={selectStyle}
          onChange={e => {
            const u = utenti.find(x => String(x.id) === String(e.target.value));
            setSelectedUser(u);
          }}
        >
          <option value="">Seleziona</option>
          {utenti.map(u => (
            <option key={u.id} value={String(u.id)}>{u.nome || u.email}</option>
          ))}
        </select>
        {selectedUser && (
          <UserFullCard user={selectedUser} refresh={refreshUtenti} />
        )}
      </div>

      {/* Bartender */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Bartender</h2>
        <select className="admin-select" style={selectStyle}>
          <option>Seleziona</option>
          {bartender.map(b => (
            <option key={b.id}>{b.nome}</option>
          ))}
        </select>
      </div>

      {/* Proprietari */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Proprietari</h2>
        <select className="admin-select" style={selectStyle}>
          <option>Seleziona</option>
          {proprietari.map(p => (
            <option key={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      {/* Articoli */}
      <div className="admin-section" style={{ marginBottom: 40 }}>
        <h2 style={orangeTitle}>Articoli</h2>
        <select
          className="admin-select"
          style={selectStyle}
          value={selectedArticolo ? String(selectedArticolo.id) : ""}
          onChange={e => {
            const value = e.target.value;
            const art = articoli.find(a => String(a.id) === String(value));
            setSelectedArticolo(art);
            setNewArticle(false);
          }}
        >
          <option value="">Seleziona</option>
          {articoli.map(a => (
            <option key={a.id} value={String(a.id)}>{a.titolo}</option>
          ))}
        </select>
        {selectedArticolo && (
          <ArticoloFullCard articolo={selectedArticolo} refresh={refreshArticoli} />
        )}
        <button style={green} onClick={() => { setNewArticle(true); setSelectedArticolo(null); }}>Nuovo Articolo</button>
        {newArticle && <NuovoArticolo refresh={refreshArticoli} />}
      </div>
    </div>
  );
}

// COMPONENTI E FUNZIONI ESTERNE

// Placeholder: puoi rimuovere se non serve più
function AdminPanelLegacy() {
  return null;
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
    if (!window.confirm("Eliminare articolo?")) return;
    const { error } = await supabase.from("articoli").delete().eq("id", edit.id);
    if (error) console.error("Errore elimina Articolo:", error);
    refresh();
  }

  return (
    <div style={card}>
      <h3>Articolo</h3>
      <input
        name="immagine"
        value={edit.immagine || ""}
        onChange={change}
        placeholder="URL immagine header"
        style={input}
      />
      <textarea
        name="contenuto"
        value={edit.contenuto || ""}
        onChange={change}
        placeholder="Scrivi articolo..."
        style={textarea}
      />
      <div style={actions}>
        <button style={green} onClick={approva}>Approva</button>
        <button style={blue} onClick={salva}>Salva</button>
        <button style={red} onClick={elimina}>Cancella</button>
      </div>
    </div>
  );
}


function NuovoArticolo({ refresh }) {
  const [data, setData] = useState({ titolo: "", contenuto: "", immagine: "" });

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


function UserFullCard({ user, refresh }) {
  const [edit, setEdit] = useState(user);

  function change(e) {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  }

  async function salva() {
    const { id, ...rest } = edit;
    const { error } = await supabase.from("profili").update(rest).eq("id", id);
    if (error) console.error("Errore update Utente:", error);
    refresh();
  }

  async function elimina() {
    if (!window.confirm("Eliminare utente?")) return;
    const { error } = await supabase.from("profili").delete().eq("id", edit.id);
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

// STILI
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

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const green = { background: "#16a34a", padding: "10px 14px", borderRadius: 8 };
const blue = { background: "#2563eb", padding: "10px 14px", borderRadius: 8 };
const red = { background: "#dc2626", padding: "10px 14px", borderRadius: 8 };
const card = { background: "#222", borderRadius: 12, padding: 24, marginTop: 24 };
const input = { padding: "8px 12px", borderRadius: 6, border: "1px solid #444", marginBottom: 12, width: "100%" };
const textarea = { ...input, minHeight: 80 };
const select = { padding: "8px 12px", borderRadius: 6, border: "1px solid #444", marginBottom: 12, width: 220 };
const mobileSelect = { ...select, width: 140, fontSize: 18 };
