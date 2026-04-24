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
            <option key={a.id} value={String(a.id)}>
              {a.titolo}
            </option>
          ))}

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

                    <select
                      style={select}
                      onChange={(e) => {
                        const u = bartender.find((x) => String(x.id) === String(e.target.value));
                        setSelectedUser(u);
                      }}
                    >
                      <option value="">Seleziona bartender</option>
                      {bartender.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.nome || u.email}
                        </option>
                      ))}
                    </select>

                    {selectedUser && (
                      <UserFullCard user={selectedUser} refresh={fetchAll} />
                    )}
                  </div>

                  {/* PROPRIETARI */}
                  <div style={section}>
                    <h2 style={orangeTitle}>Proprietari</h2>

                    <select
                      style={select}
                      onChange={(e) => {
                        const u = proprietari.find((x) => String(x.id) === String(e.target.value));
                        setSelectedUser(u);
                      }}
                    >
                      <option value="">Seleziona proprietario</option>
                      {proprietari.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.nome || u.email}
                        </option>
                      ))}
                    </select>

                    {selectedUser && (
                      <UserFullCard user={selectedUser} refresh={fetchAll} />
                    )}
                  </div>

                  {/* ARTICOLI */}
                  <div style={section}>
                    <h2 style={orangeTitle}>Articoli</h2>

                    <select
                      style={select}
                      onChange={(e) => {
                        const a = articoli.find((x) => String(x.id) === String(e.target.value));
                        setSelectedArticolo(a);
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
                      <ArticleFullCard articolo={selectedArticolo} refresh={fetchAll} />
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