

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

const STANZA_DEFAULT = "Generale";

export default function Baretto() {
  const { isAdmin } = useUser();
  const [stanze, setStanze] = useState<string[]>([STANZA_DEFAULT]);
  const [stanzaCorrente, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  const [errore, setErrore] = useState<string>("");

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
      <div style={{ flex: 1, color: "#fff", marginTop: 0 }}>
        <b>Chat placeholder</b>
        <div style={{ opacity: 0.5, fontSize: 14 }}>Qui appariranno i messaggi e la textarea.</div>
      </div>
    </div>
  );
}
