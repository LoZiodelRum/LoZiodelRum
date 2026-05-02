
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
  // ...existing code...
}

function AdminPanelLegacyWrapper() {
  // Stili responsive per select
  const mobileSelect = {
    ...select,
    width: "140px", // leggermente più largo
    maxWidth: "140px",
    minWidth: "140px",
    marginLeft: 0,
    marginRight: 0,
    display: "block",
    fontSize: 18,
    padding: "12px 8px",
    alignSelf: "flex-start",
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
            margin-left: 0 !important;
            padding-left: 0 !important;
            align-items: flex-start !important;
          }
          .admin-select {
            width: 140px !important;
            max-width: 140px !important;
            min-width: 140px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            display: block !important;
            font-size: 18px !important;
            padding: 12px 8px !important;
            text-align: left !important;
            left: 0 !important;
            position: relative !important;
          }
        }
      `}</style>
      <div className="page fade-in" style={container}>
        <h1 style={title}>Pannello di Controllo</h1>

        {/* LOCALI E MENU DRINK */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Locali</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={(e) => {
              const loc = locali.find((l) => String(l.id) === String(e.target.value));
              setSelectedLocale(loc);
            }}
          >
            <option value="">Seleziona</option>
            {locali.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.nome}
              </option>
            ))}
          </select>
          {selectedLocale && (
            <LocaleFullCard locale={selectedLocale} refresh={() => {}} />
          )}

          <h2 style={{...orangeTitle, marginTop: 32}}>Cocktail</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedCocktail(cocktail.find(c => String(c.id) === String(e.target.value)))}
          >
            <option value="">Seleziona</option>
            {cocktail.map(c => (
              <option key={c.id} value={String(c.id)}>{c.nome}</option>
            ))}
          </select>

          <h2 style={{...orangeTitle, marginTop: 32}}>Distillati</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedDistillato(distillati.find(d => String(d.id) === String(e.target.value)))}
          >
            <option value="">Seleziona</option>
            {distillati.map(d => (
              <option key={d.id} value={String(d.id)}>{d.nome}</option>
            ))}
          </select>

          <h2 style={{...orangeTitle, marginTop: 32}}>Vini</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedVino(vini.find(v => String(v.id) === String(e.target.value)))}
          >
            <option value="">Seleziona</option>
            {vini.map(v => (
              <option key={v.id} value={String(v.id)}>{v.nome}</option>
            ))}
          </select>
        </div>

        {/* UTENTI */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Utenti</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={(e) => {
              const u = utenti.find((x) => String(x.id) === String(e.target.value));
              setSelectedUser(u);
            }}
          >
            <option value="">Seleziona</option>
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
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Bartender</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
          >
            <option>Seleziona</option>
            {bartender.map((b) => (
              <option key={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>

        {/* PROPRIETARI */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Proprietari</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
          >
            <option>Seleziona</option>
            {proprietari.map((p) => (
              <option key={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* ARTICOLI */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
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
            <option value="">Seleziona</option>
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

  // Stili responsive per select
  const mobileSelect = {
    ...select,
    width: "140px", // leggermente più largo
    maxWidth: "140px",
    minWidth: "140px",
    marginLeft: 0,
    marginRight: 0,
    display: "block",
    fontSize: 18,
    padding: "12px 8px",
    alignSelf: "flex-start",
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
            margin-left: 0 !important;
            padding-left: 0 !important;
            align-items: flex-start !important;
          }
          .admin-select {
            width: 140px !important;
            max-width: 140px !important;
            min-width: 140px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            display: block !important;
            font-size: 18px !important;
            padding: 12px 8px !important;
            text-align: left !important;
            left: 0 !important;
            position: relative !important;
          }
        }
      `}</style>
      <div className="page fade-in" style={container}>
        <h1 style={title}>Pannello di Controllo</h1>

        {/* LOCALI E MENU DRINK */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Locali</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={(e) => {
              const loc = locali.find((l) => String(l.id) === String(e.target.value));
              setSelectedLocale(loc);
            }}
          >
            <option value="">Seleziona</option>
            {locali.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.nome}
              </option>
            ))}
          </select>
          {selectedLocale && (
            <LocaleFullCard locale={selectedLocale} refresh={() => {}} />
          )}

          <h2 style={{...orangeTitle, marginTop: 32}}>Cocktail</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedCocktail(cocktail.find(c => String(c.id) === String(e.target.value)))}
          >
            <option value="">Seleziona</option>
            {cocktail.map(c => (
              <option key={c.id} value={String(c.id)}>{c.nome}</option>
            ))}
          </select>

          <h2 style={{...orangeTitle, marginTop: 32}}>Distillati</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedDistillato(distillati.find(d => String(d.id) === String(e.target.value)))}
          >
            <option value="">Seleziona</option>
            {distillati.map(d => (
              <option key={d.id} value={String(d.id)}>{d.nome}</option>
            ))}
          </select>

          <h2 style={{...orangeTitle, marginTop: 32}}>Vini</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={e => setSelectedVino(vini.find(v => String(v.id) === String(e.target.value)))}
          >
            <option value="">Seleziona</option>
            {vini.map(v => (
              <option key={v.id} value={String(v.id)}>{v.nome}</option>
            ))}
          </select>
        </div>

        {/* UTENTI */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Utenti</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
            onChange={(e) => {
              const u = utenti.find((x) => String(x.id) === String(e.target.value));
              setSelectedUser(u);
            }}
          >
            <option value="">Seleziona</option>
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
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Bartender</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
          >
            <option>Seleziona</option>
            {bartender.map((b) => (
              <option key={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>

        {/* PROPRIETARI */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
          <h2 style={orangeTitle}>Proprietari</h2>
          <select
            className="admin-select"
            style={isMobile ? mobileSelect : select}
          >
            <option>Seleziona</option>
            {proprietari.map((p) => (
              <option key={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* ARTICOLI */}
        <div className="admin-section" style={{...section, alignItems: 'flex-start', marginLeft: 0, paddingLeft: 0}}>
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
            <option value="">Seleziona</option>
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