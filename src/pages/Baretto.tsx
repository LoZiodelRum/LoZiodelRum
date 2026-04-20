

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

const STANZA_DEFAULT = "Generale";

export default function Baretto() {
  // Stato utenti online/offline (da popolare con dati reali)
  const [utenti, setUtenti] = useState<{ username: string; online: boolean }[]>([]);

  const { isAdmin } = useUser();
  const [stanze, setStanze] = useState<string[]>([STANZA_DEFAULT]);
  const [stanzaCorrente, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  const [errore, setErrore] = useState<string>("");
  // Stato messaggi e textarea
  const [messaggi, setMessaggi] = useState<{id:number, testo:string, username:string, created_at:string}[]>([]);
  const [testoNuovo, setTestoNuovo] = useState("");
  // Carica messaggi della stanza selezionata (svuota placeholder)
  useEffect(() => {
    setMessaggi([]);
  }, [stanzaCorrente]);

  // Invia messaggio (mock, solo aggiunta locale)
  function inviaMessaggio(e:any) {
    e.preventDefault();
    if (!testoNuovo.trim()) return;
    setMessaggi([...messaggi, {id:Date.now(), testo:testoNuovo, username:"Tu", created_at:new Date().toISOString()}]);
    setTestoNuovo("");
  }

  useEffect(() => {
    async function fetchStanze() {
      try {
        const { data, error } = await supabase.from("baretto_stanze").select("nome");
        if (!error && data) {
          const nomi = data.map((row: any) => row.nome).filter(Boolean);
          setStanze([STANZA_DEFAULT, ...nomi.filter(n => n !== STANZA_DEFAULT)]);
        }
      } catch (e) {
        setErrore("Errore caricamento stanze");
      }
    }
    fetchStanze();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: typeof window !== "undefined" && window.innerWidth < 800 ? "column" : "row",
        gap: 0,
        padding: 24,
        alignItems: "flex-start",
        minHeight: "70vh"
      }}
    >
      {/* Colonna sinistra: lista stanze + admin */}
      <div style={{ minWidth: 160, maxWidth: 200, flex: "0 0 180px", display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginRight: 0 }}>
        {errore && <div style={{ color: "#fff", background: "#f55", padding: 8, borderRadius: 8, marginBottom: 12, fontSize: 14 }}>{errore}</div>}
        {/* Lista utenti online/offline */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ color: '#f5a623', fontWeight: 700, marginBottom: 6, fontSize: 15 }}>Utenti online</div>
          {utenti.length === 0 && (
            <div style={{ color: '#888', fontSize: 14 }}>Nessun utente online</div>
          )}
          {utenti.map(u => (
            <div key={u.username} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: u.online ? '#2ecc40' : '#888',
                border: '1.5px solid #222'
              }} />
              <span style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>{u.username}</span>
            </div>
          ))}
        </div>
        <button
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 999,
            border: "2px solid #f5a623",
            background: "#181818",
            color: "#f5a623",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            marginBottom: 12
          }}
          // TODO: implementa creazione tavolo
        >
          Crea un tavolo
        </button>
        {isAdmin && stanzaCorrente && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            <button
              style={{ padding: "8px 0", borderRadius: 999, border: "2px solid #f5a623", background: "#181818", color: "#f5a623", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
              // TODO: implementa svuota chat se richiesto
            >
              Svuota chat
            </button>
            {stanzaCorrente !== STANZA_DEFAULT && (
              <button
                style={{ padding: "8px 0", borderRadius: 999, border: "2px solid #f55", background: "#181818", color: "#f55", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
                onClick={async () => {
                  if (!window.confirm(`Vuoi davvero eliminare il tavolo \"${stanzaCorrente}\"? Tutti i messaggi saranno cancellati e il tavolo sarà rimosso.`)) return;
                  // Elimina tutti i messaggi della stanza
                  await supabase.from("baretto_messaggi").delete().eq("stanza", stanzaCorrente);
                  // Elimina la stanza
                  await supabase.from("baretto_stanze").delete().eq("nome", stanzaCorrente);
                  // Aggiorna lista stanze
                  setStanze(stanze.filter(s => s !== stanzaCorrente));
                  setStanzaSelezionata(STANZA_DEFAULT);
                }}
              >
                Elimina tavolo
              </button>
            )}
          </div>
        )}
      </div>
      {/* Riga gialla verticale tra le colonne */}
      <div style={{ width: 2, background: '#f5a623', minHeight: '60vh', margin: '0 24px', borderRadius: 2, alignSelf: 'stretch', display: typeof window !== "undefined" && window.innerWidth < 800 ? 'none' : 'block' }} />
      {/* Colonna destra: chat */}
      <div style={{ flex: 1, color: "#fff", marginTop: 0, minHeight: 400, display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Titoli stanze in alto, cliccabili, come box gialli */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          {stanze.map((nome) => (
            <button
              key={nome}
              onClick={() => setStanzaSelezionata(nome)}
              style={{
                border: "none",
                outline: "none",
                background: stanzaCorrente === nome ? "#f5a623" : "#222",
                color: stanzaCorrente === nome ? "#181818" : "#f5a623",
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 999,
                padding: "8px 22px",
                cursor: "pointer",
                boxShadow: stanzaCorrente === nome ? "0 0 0 2px #f5a623" : "0 0 0 2px #f5a62355",
                transition: "background 0.2s, color 0.2s"
              }}
            >
              {nome}
            </button>
          ))}
        </div>
        {/* Lista messaggi */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 80 }}>
          {messaggi.map(msg => (
            <div key={msg.id} style={{ marginBottom: 12 }}>
              <span style={{ color: "#f5a623", fontWeight: 700 }}>{msg.username}</span>
              <span style={{ color: "#aaa", fontSize: 12, marginLeft: 8 }}>{msg.created_at.slice(11,16)}</span>
              <div>{msg.testo}</div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={inviaMessaggio}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 18,
          background: "transparent",
          borderTop: "none",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: 0,
          zIndex: 100
        }}
      >
        <textarea
          value={testoNuovo}
          onChange={e => setTestoNuovo(e.target.value)}
          rows={1}
          placeholder="Scrivi..."
          style={{
            width: 420,
            maxWidth: "98vw",
            borderRadius: 10,
            border: "none",
            padding: "0 12px",
            fontSize: 15,
            background: "#222",
            color: "#fff",
            minHeight: 38,
            maxHeight: 44,
            resize: "none",
            outline: "none",
            display: "flex",
            alignItems: "center",
            textAlign: "left",
            lineHeight: "38px"
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              inviaMessaggio(e);
            }
          }}
        />
        <button
          type="submit"
          style={{
            borderRadius: 10,
            border: "none",
            background: "#f5a623",
            color: "#181818",
            fontWeight: 700,
            fontSize: 17,
            padding: "10px 22px",
            cursor: "pointer"
          }}
        >
          Invia
        </button>
      </form>
    </div>
  );
}
