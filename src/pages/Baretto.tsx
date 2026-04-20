

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

const STANZA_DEFAULT = "Generale";

export default function Baretto() {

  const { isAdmin } = useUser();
  const [stanze, setStanze] = useState<string[]>([STANZA_DEFAULT]);
  const [stanzaCorrente, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  const [errore, setErrore] = useState<string>("");
  // Stato messaggi e textarea
  const [messaggi, setMessaggi] = useState<{id:number, testo:string, username:string, created_at:string}[]>([]);
  const [testoNuovo, setTestoNuovo] = useState("");
  // Carica messaggi della stanza selezionata
  useEffect(() => {
    async function fetchMessaggi() {
      // Sostituisci con fetch reale da supabase
      setMessaggi([
        {id:1, testo:"Ciao!", username:"Mario", created_at:"2026-04-20 10:00"},
        {id:2, testo:"Benvenuto nel Baretto!", username:"Admin", created_at:"2026-04-20 10:01"}
      ]);
    }
    fetchMessaggi();
  }, [stanzaCorrente]);

  // Invia messaggio (mock)
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
        gap: 32,
        padding: 24,
        alignItems: "flex-start",
        minHeight: "70vh",
        position: "relative"
      }}
    >
      {/* Colonna sinistra: lista stanze + admin */}
      <div style={{ minWidth: 220, maxWidth: 320, flex: "0 0 260px" }}>
        {errore && <div style={{ color: "#fff", background: "#f55", padding: 12, borderRadius: 8, marginBottom: 18 }}>{errore}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {stanze.map((nome) => (
            <button
              key={nome}
              onClick={() => setStanzaSelezionata(nome)}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: stanzaCorrente === nome ? "2px solid #f5a623" : "2px solid #444",
                background: stanzaCorrente === nome ? "#181818" : "#222",
                color: stanzaCorrente === nome ? "#f5a623" : "#fff",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {nome}
            </button>
          ))}
        </div>
        {isAdmin && stanzaCorrente && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            <button
              style={{ padding: "8px 18px", borderRadius: 999, border: "2px solid #f5a623", background: "#181818", color: "#f5a623", fontWeight: 700, cursor: "pointer" }}
              // TODO: implementa svuota chat se richiesto
            >
              Svuota chat
            </button>
            {stanzaCorrente !== STANZA_DEFAULT && (
              <button
                style={{ padding: "8px 18px", borderRadius: 999, border: "2px solid #f55", background: "#181818", color: "#f55", fontWeight: 700, cursor: "pointer" }}
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
      {/* Colonna destra: chat */}
      <div style={{ flex: 1, color: "#fff", marginTop: 0, minHeight: 400, display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Titoli stanze in alto, cliccabili */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          {stanze.map((nome) => (
            <span
              key={nome}
              onClick={() => setStanzaSelezionata(nome)}
              style={{
                cursor: "pointer",
                fontWeight: stanzaCorrente === nome ? 700 : 400,
                color: stanzaCorrente === nome ? "#f5a623" : "#fff",
                fontSize: 18,
                borderBottom: stanzaCorrente === nome ? "2px solid #f5a623" : "2px solid transparent",
                padding: "2px 8px"
              }}
            >
              {nome}
            </span>
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
        {/* Textarea e invio sempre in fondo */}
        <form
          onSubmit={inviaMessaggio}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            background: "#181818",
            borderTop: "1.5px solid #222",
            display: "flex",
            gap: 8,
            padding: "12px 0 12px 0"
          }}
        >
          <textarea
            value={testoNuovo}
            onChange={e => setTestoNuovo(e.target.value)}
            rows={1}
            placeholder={`Scrivi in ${stanzaCorrente}...`}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "none",
              padding: "10px 12px",
              fontSize: 17,
              background: "#222",
              color: "#fff",
              minHeight: 38,
              maxHeight: 60,
              resize: "none",
              outline: "none"
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
    </div>
  );
}
