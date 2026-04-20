

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

const STANZA_DEFAULT = "Generale";

export default function Baretto() {
    const [stanze, setStanze] = useState<string[]>([STANZA_DEFAULT]);
    const [stanzaCorrente, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  // già dichiarate sopra
  const creaTavolo = async () => {
    const nome = nomeNuovoTavolo.trim();
    if (!nome || nome === STANZA_DEFAULT) return;
    if (stanze.includes(nome)) {
      alert("Esiste già un tavolo con questo nome.");
      return;
    }
    const { error } = await supabase.from("baretto_stanze").insert([{ nome }]);
    if (error) {
      alert("Errore nella creazione del tavolo.");
      return;
    }
    setStanze([...stanze, nome]);
    setStanzaSelezionata(nome);
    setShowCreaTavolo(false);
  };
  // Stato modale creazione tavolo
  const [showCreaTavolo, setShowCreaTavolo] = useState(false);
  const [nomeNuovoTavolo, setNomeNuovoTavolo] = useState("");
  // Stato utenti online/offline
  const [utenti, setUtenti] = useState<{ id_utente: string; username: string; stanza: string; last_active: string }[]>([]);
  const presenceInterval = useRef<number | null>(null);
  // Gestione presenza utente
  useEffect(() => {
    let currentUser: any = null;
    async function upsertPresenza() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      currentUser = user;
      if (!user) return;
      await supabase.from("baretto_presenze").upsert({
        id_utente: user.id,
        username: user.user_metadata?.username || user.email || "Anon",
        stanza: stanzaCorrente,
        last_active: new Date().toISOString(),
      });
    }
    upsertPresenza();
    presenceInterval.current = window.setInterval(() => upsertPresenza(), 20000);
    const handleUnload = () => {
      if (currentUser) {
        supabase.from("baretto_presenze").upsert({
          id_utente: currentUser.id,
          username: currentUser.user_metadata?.username || currentUser.email || "Anon",
          stanza: stanzaCorrente,
          last_active: new Date().toISOString(),
        });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (presenceInterval.current) clearInterval(presenceInterval.current);
      handleUnload();
    };
  }, [stanzaCorrente]);
  // Sottoscrizione realtime presenze
  useEffect(() => {
    let ignore = false;
    async function fetchPresenze() {
      const { data, error } = await supabase
        .from("baretto_presenze")
        .select("id_utente, username, stanza, last_active");
      if (!ignore && !error && data) {
        setUtenti(data);
      }
    }
    fetchPresenze();
    const channel = supabase
      .channel("baretto_presenze")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "baretto_presenze" },
        fetchPresenze
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [stanzaCorrente]);

  const { isAdmin } = useUser();
  // (rimosso doppione)
  const [errore, setErrore] = useState<string>("");
  // Stato messaggi e textarea
  const [messaggi, setMessaggi] = useState<{id:number, testo:string, username:string, created_at:string}[]>([]);
  const [testoNuovo, setTestoNuovo] = useState("");
  // Carica messaggi della stanza selezionata (svuota placeholder)
  useEffect(() => {
    async function fetchMessaggi() {
      if (!stanzaCorrente) return;
      const { data, error } = await supabase
        .from("baretto_messaggi")
        .select("id, testo, username, created_at")
        .eq("stanza", stanzaCorrente)
        .order("created_at", { ascending: true });
      if (!error && data) {
        setMessaggi(data);
      } else {
        setMessaggi([]);
      }
    }
    fetchMessaggi();
  }, [stanzaCorrente]);

  // Invia messaggio realmente su Supabase
  async function inviaMessaggio(e:any) {
    e.preventDefault();
    if (!testoNuovo.trim()) return;
    // Recupera username reale
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    const username = user?.user_metadata?.username || user?.email || "Anon";
    const { error } = await supabase.from("baretto_messaggi").insert([
      {
        testo: testoNuovo,
        stanza: stanzaCorrente,
        username,
      },
    ]);
    if (!error) {
      // Ricarica messaggi
      const { data } = await supabase
        .from("baretto_messaggi")
        .select("id, testo, username, created_at")
        .eq("stanza", stanzaCorrente)
        .order("created_at", { ascending: true });
      setMessaggi(data || []);
      setTestoNuovo("");
    } else {
      alert("Errore nell'invio del messaggio");
    }
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
          <div style={{ color: '#f5a623', fontWeight: 700, marginBottom: 6, fontSize: 15 }}>Utenti collegati</div>
          {utenti.length === 0 && (
            <div style={{ color: '#888', fontSize: 14 }}>Nessun utente collegato</div>
          )}
          {utenti.map(u => {
            // Considera online se last_active < 30 secondi fa
            const last = new Date(u.last_active).getTime();
            const now = Date.now();
            const online = now - last < 30000;
            return (
              <div key={u.id_utente} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: online ? '#2ecc40' : '#888',
                  border: '1.5px solid #222'
                }} />
                <span style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>{u.username}</span>
              </div>
            );
          })}
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
          onClick={() => {
            setNomeNuovoTavolo("");
            setShowCreaTavolo(true);
          }}
        >
          Crea un tavolo
        </button>
              {/* Modale custom per creazione tavolo */}
              {showCreaTavolo && (
                <div style={{
                  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(24,18,10,0.92)", zIndex: 1000,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #181818 80%, #f5a62322 100%)",
                    borderRadius: 22,
                    padding: "44px 36px 32px 36px",
                    minWidth: 320,
                    boxShadow: "0 8px 32px #000c, 0 0 0 4px #f5a62355",
                    border: "3px solid #f5a623",
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    position: 'relative',
                  }}>
                    <div style={{ position: 'absolute', top: 18, left: 18, fontSize: 28, color: '#f5a623', opacity: 0.8 }}>
                      🥃
                    </div>
                    <div style={{ color: "#f5a623", fontWeight: 900, fontSize: 26, marginBottom: 18, fontFamily: 'serif', letterSpacing: 1 }}>
                      Crea un nuovo tavolo
                    </div>
                    <input
                      autoFocus
                      value={nomeNuovoTavolo}
                      onChange={e => setNomeNuovoTavolo(e.target.value)}
                      placeholder="Nome tavolo..."
                      style={{
                        width: 230,
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: "2.5px solid #f5a623",
                        background: "#222",
                        color: "#fff",
                        fontSize: 18,
                        marginBottom: 22,
                        outline: "none",
                        fontFamily: 'inherit',
                        boxShadow: '0 2px 12px #0007',
                        textAlign: 'center',
                        letterSpacing: 0.5,
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') creaTavolo(); }}
                    />
                    <div style={{ display: 'flex', gap: 18 }}>
                      <button
                        style={{
                          padding: "9px 26px",
                          borderRadius: 10,
                          border: "2px solid #f5a623",
                          background: "#181818",
                          color: "#f5a623",
                          fontWeight: 700,
                          fontSize: 17,
                          cursor: "pointer",
                          fontFamily: 'inherit',
                          transition: 'background 0.2s, color 0.2s',
                        }}
                        onClick={() => setShowCreaTavolo(false)}
                      >Annulla</button>
                      <button
                        style={{
                          padding: "9px 26px",
                          borderRadius: 10,
                          border: "none",
                          background: "#f5a623",
                          color: "#181818",
                          fontWeight: 900,
                          fontSize: 17,
                          cursor: "pointer",
                          fontFamily: 'inherit',
                          boxShadow: '0 2px 8px #f5a62333',
                          transition: 'background 0.2s, color 0.2s',
                        }}
                        onClick={creaTavolo}
                      >Crea</button>
                    </div>
                  </div>
                </div>
              )}
        {isAdmin && stanzaCorrente && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            <button
              style={{ padding: "8px 0", borderRadius: 999, border: "2px solid #f5a623", background: "#181818", color: "#f5a623", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
              onClick={async () => {
                if (!window.confirm("Vuoi davvero svuotare la chat di questa stanza?")) return;
                await supabase.from("baretto_messaggi").delete().eq("stanza", stanzaCorrente);
                // Aggiorna lista messaggi
                const { data, error } = await supabase
                  .from("baretto_messaggi")
                  .select("id, testo, username, created_at")
                  .eq("stanza", stanzaCorrente)
                  .order("created_at", { ascending: true });
                setMessaggi(data || []);
              }}
            >
              Svuota chat
            </button>
            {stanzaCorrente !== STANZA_DEFAULT && (
              <button
                style={{ padding: "8px 0", borderRadius: 999, border: "2px solid #f55", background: "#181818", color: "#f55", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
                onClick={async () => {
                  if (!window.confirm(`Vuoi davvero eliminare il tavolo "${stanzaCorrente}"? Tutti i messaggi saranno cancellati e il tavolo sarà rimosso.`)) return;
                  // Elimina tutti i messaggi della stanza
                  await supabase.from("baretto_messaggi").delete().eq("stanza", stanzaCorrente);
                  // Elimina la stanza
                  await supabase.from("baretto_stanze").delete().eq("nome", stanzaCorrente);
                  // Aggiorna lista stanze con fetch reale
                  const { data, error } = await supabase.from("baretto_stanze").select("nome");
                  if (!error && data) {
                    const nomi = data.map((row) => row.nome).filter(Boolean);
                    setStanze([STANZA_DEFAULT, ...nomi.filter(n => n !== STANZA_DEFAULT)]);
                  } else {
                    setStanze(stanze.filter(s => s !== stanzaCorrente));
                  }
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
