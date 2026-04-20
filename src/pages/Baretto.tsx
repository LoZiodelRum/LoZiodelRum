import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

const STANZA_DEFAULT = "Generale";

export default function Baretto() {
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();

  const [stanze, setStanze] = useState<string[]>([STANZA_DEFAULT]);
  const [stanzaCorrente, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  const [utentiOnline, setUtentiOnline] = useState<any[]>([]);
  const [messaggi, setMessaggi] = useState<any[]>([]);
  const [testoNuovo, setTestoNuovo] = useState<string>("");
  const listaRef = useRef<HTMLDivElement>(null);

  let nomeUtenteCorrente = "Anonimo";
  if (user?.user_metadata?.username && !user?.user_metadata?.username.includes("@")) {
    nomeUtenteCorrente = user.user_metadata.username;
  } else if (user?.user_metadata?.username && user?.user_metadata?.username.includes("@")) {
    nomeUtenteCorrente = user.user_metadata.username.split("@")[0];
  } else if (user?.username && !user?.username.includes("@")) {
    nomeUtenteCorrente = user.username;
  } else if (user?.username && user?.username.includes("@")) {
    nomeUtenteCorrente = user.username.split("@")[0];
  } else if (user?.nome) {
    nomeUtenteCorrente = user.nome;
  } else {
    nomeUtenteCorrente = "Utente";
  }

  // PRESENZA: upsert presenza all'ingresso, rimuovi all'uscita, ascolta realtime
  const [errorePresenzaAdmin, setErrorePresenzaAdmin] = useState<string | null>(null);
  useEffect(() => {
    // Se non autenticato, non fare nulla
    if (!user) return;

    let stopped = false;
    const id_utente = user?.id;
    const username = nomeUtenteCorrente;

    async function upsertPresenza() {
      const presenza = {
        id_utente,
        username,
        stanza: stanzaCorrente,
        last_active: new Date().toISOString(),
      };
      console.log("UPD PRESENZA su Supabase:", presenza);
      const { error, data } = await supabase
        .from("baretto_presenze")
        .upsert([presenza], { onConflict: "id_utente,stanza" });
      if (error) {
        setErrorePresenzaAdmin("Errore presenza: " + (error.message || JSON.stringify(error)));
        console.error("ERRORE UPSERT PRESENZA:", error);
      } else {
        setErrorePresenzaAdmin(null);
        console.log("Risposta upsert presenza:", data);
      }
    }

    upsertPresenza();
    const interval = setInterval(() => {
      if (!stopped) upsertPresenza();
    }, 20000);
    return () => {
      stopped = true;
      clearInterval(interval);
      if (id_utente) {
        supabase.from("baretto_presenze").delete().eq("id_utente", id_utente).eq("stanza", stanzaCorrente);
      }
    };
    // eslint-disable-next-line
  }, [user, stanzaCorrente]);

  // Carica presenze e aggiorna in realtime
  useEffect(() => {
    async function fetchPresenze() {
      const { data, error } = await supabase
        .from("baretto_presenze")
        .select("id_utente, username, stanza, last_active");
      if (error) console.error("Errore fetch presenze:", error);
      else console.log("Presenze lette da Supabase:", data);
      if (data) setUtentiOnline(data);
    }
    fetchPresenze();
    const channel = supabase
      .channel("baretto-presenze")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "baretto_presenze" },
        fetchPresenze
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [stanzaCorrente]);

  // Carica messaggi all'avvio
  const [erroreLetturaMessaggi, setErroreLetturaMessaggi] = useState<string | null>(null);
  useEffect(() => {
    async function fetchMessaggi() {
      const { data, error } = await supabase
        .from("baretto_messaggi")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        setErroreLetturaMessaggi("Errore lettura messaggi: " + (error.message || JSON.stringify(error)));
        console.error("ERRORE LETTURA MESSAGGI:", error);
      } else {
        setErroreLetturaMessaggi(null);
        if (data) setMessaggi(data);
      }
    }
    fetchMessaggi();
  }, []);

  // Aggiornamento realtime
  useEffect(() => {
    const channel = supabase
      .channel("baretto")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "baretto_messaggi" },
        (payload) => setMessaggi((prev) => [...prev, payload.new])
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [erroreInvioMessaggio, setErroreInvioMessaggio] = useState<string | null>(null);
  async function inviaMessaggio(e: any) {
    e.preventDefault();
    if (!testoNuovo.trim()) return;
    const nuovo = {
      testo: testoNuovo,
      created_at: new Date().toISOString(),
      id_utente: user?.id,
      stanza: stanzaCorrente,
      username: nomeUtenteCorrente,
    };
    // Salva su Supabase
    const { error } = await supabase.from("baretto_messaggi").insert({
      testo: nuovo.testo,
      id_utente: nuovo.id_utente,
      username: nuovo.username,
      created_at: nuovo.created_at,
      stanza: nuovo.stanza,
    });
    if (error) {
      setErroreInvioMessaggio("Errore invio messaggio: " + (error.message || JSON.stringify(error)));
      console.error("ERRORE INVIO MESSAGGIO:", error);
    } else {
      setErroreInvioMessaggio(null);
      setTestoNuovo("");
    }
  }

  function formattaOra(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (!user?.id) {
    return (
      <div style={{ color: '#fff', background: '#181818', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, textAlign: 'center' }}>
        Devi accedere per usare la chat.<br />
        Effettua il login.
      </div>
    );
  }

  // Mostra tutti gli utenti, ma pallino verde se online (<30s), grigio se "scollegato"
  const now = Date.now();
  const [utenteOfflineSelezionato, setUtenteOfflineSelezionato] = useState<string|null>(null);
  const utentiOnlineEffettivi = utentiOnline.map(u => {
    let stato = "offline";
    if (u.last_active) {
      const last = new Date(u.last_active).getTime();
      stato = now - last < 30000 ? "online" : "offline";
    }
    return { ...u, stato };
  });

  return (
    <>
      {errorePresenzaAdmin && (
        <div style={{background: '#ff0000', color: '#fff', padding: 12, textAlign: 'center', fontWeight: 700}}>
          {errorePresenzaAdmin}
        </div>
      )}
      {erroreInvioMessaggio && (
        <div style={{background: '#ff0000', color: '#fff', padding: 12, textAlign: 'center', fontWeight: 700}}>
          {erroreInvioMessaggio}
        </div>
      )}
      {erroreLetturaMessaggi && (
        <div style={{background: '#ff0000', color: '#fff', padding: 12, textAlign: 'center', fontWeight: 700}}>
          {erroreLetturaMessaggi}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: typeof window !== "undefined" && window.innerWidth < 800 ? "column" : "row", minHeight: "100vh", width: "100%", height: "100%" }}>
        <aside
          style={{
          width: typeof window !== "undefined" && window.innerWidth < 800 ? "88vw" : 270, // ancora più stretto
          background: "rgba(28,25,23,0.5)",
          border: "1px solid rgba(68,64,60,0.5)",
          borderRadius: 18,
          padding: typeof window !== "undefined" && window.innerWidth < 800 ? "10px 0 6px 0" : 18, // padding laterale 0
          display: "flex",
          flexDirection: "column",
          gap: typeof window !== "undefined" && window.innerWidth < 800 ? 6 : 18,
          minHeight: typeof window !== "undefined" && window.innerWidth < 800 ? undefined : 420,
          marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 6 : 0,
          overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
          marginLeft: typeof window !== "undefined" && window.innerWidth < 800 ? "auto" : undefined, // centra
          marginRight: typeof window !== "undefined" && window.innerWidth < 800 ? "auto" : undefined, // centra
          boxSizing: typeof window !== "undefined" && window.innerWidth < 800 ? "border-box" : undefined,
          // aggiungi padding laterale extra
          ...(typeof window !== "undefined" && window.innerWidth < 800 ? { paddingLeft: "6vw", paddingRight: "6vw" } : {}),
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#f5a623",
            fontSize: typeof window !== "undefined" && window.innerWidth < 800 ? 15 : 28,
            marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 4 : 18,
            letterSpacing: 0.5,
            lineHeight: 1.1,
            maxWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "90vw" : undefined,
            textAlign: typeof window !== "undefined" && window.innerWidth < 800 ? "center" : undefined,
          }}
        >
          Il Baretto
        </div>
        <div
          style={{
            fontWeight: 700,
            color: "#fafaf9",
            fontSize: 18,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Utenti collegati
          <span style={{ color: "#f5a623", fontSize: 17, fontWeight: 700 }}>
            ({utentiOnlineEffettivi.length})
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {utentiOnlineEffettivi.length === 0 && (
            <span style={{ color: "#888", fontSize: 15 }}>
              Nessuno online
            </span>
          )}
          {utentiOnlineEffettivi.map((utente) => (
            <div
              key={utente.id_utente + utente.stanza}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                color: utente.stato === "online" ? "#e6e6e6" : "#888",
                opacity: utente.stato === "online" ? 1 : 0.6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: utente.stato === "online" ? "#2ecc40" : "#888",
                  marginRight: 4,
                  border: "1.5px solid #222",
                }}
              />
              {isAdmin ? (
                <>
                  <span
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      color: utente.stato === "online" ? "#f5a623" : "#888",
                    }}
                    title="Vedi profilo utente"
                    onClick={() => {
                      navigate(`/profilo/${utente.id_utente}`);
                      if (utente.stato === "offline") {
                        setUtenteOfflineSelezionato(
                          utente.id_utente + "_" + utente.stanza
                        );
                      } else {
                        setUtenteOfflineSelezionato(null);
                      }
                    }}
                  >
                    {utente.username}
                  </span>
                  {utente.stato === "offline" &&
                    utenteOfflineSelezionato ===
                      utente.id_utente + "_" + utente.stanza && (
                      <button
                        style={{
                          marginLeft: 8,
                          background: "#222",
                          color: "#f55",
                          border: "1px solid #f55",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                        title="Elimina presenza utente offline"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await supabase
                            .from("baretto_presenze")
                            .delete()
                            .eq("id_utente", utente.id_utente)
                            .eq("stanza", utente.stanza);
                          setUtenteOfflineSelezionato(null);
                        }}
                      >
                        Elimina
                      </button>
                    )}
                </>
              ) : (
                <span>{utente.username}</span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setStanzaSelezionata(STANZA_DEFAULT)}
          style={{
            width: "100%",
            padding: typeof window !== "undefined" && window.innerWidth < 800 ? "3px 0" : "13px 0",
            borderRadius: 999,
            border:
              stanzaCorrente === STANZA_DEFAULT
                ? "2px solid #f5a623"
                : "1px solid #444",
            background:
              stanzaCorrente === STANZA_DEFAULT
                ? "#f5a623"
                : "#181818",
            color:
              stanzaCorrente === STANZA_DEFAULT
                ? "#181818"
                : "#f5a623",
            fontWeight: 700,
            fontSize: typeof window !== "undefined" && window.innerWidth < 800 ? 12 : "1.13rem",
            marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 2 : 10,
            cursor: "pointer",
          }}
        >
          Generale
        </button>
        <button
          onClick={() => {
            const nome = prompt("Nome del nuovo tavolo?");
            if (
              nome &&
              nome.trim() &&
              !stanze.includes(nome.trim())
            ) {
              setStanze([...stanze, nome.trim()]);
              setStanzaSelezionata(nome.trim());
            }
          }}
          style={{
            width: "100%",
            padding: typeof window !== "undefined" && window.innerWidth < 800 ? "3px 0" : "13px 0",
            borderRadius: 999,
            border: "1px solid #444",
            background: "#181818",
            color: "#f5a623",
            fontWeight: 700,
            fontSize: typeof window !== "undefined" && window.innerWidth < 800 ? 12 : "1.13rem",
            cursor: "pointer",
            marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 1 : 0,
          }}
        >
          Crea un tavolo
        </button>
        {isAdmin && (
          <button
            onClick={async () => {
              if (!stanzaCorrente) return;
              if (stanzaCorrente === STANZA_DEFAULT) {
                // Solo svuota i messaggi della Generale
                if (window.confirm("Vuoi davvero cancellare tutti i messaggi della chat Generale?")) {
                  await supabase.from("baretto_messaggi").delete().eq("stanza", STANZA_DEFAULT);
                  setMessaggi(messaggi.filter(m => m.stanza !== STANZA_DEFAULT));
                }
              } else {
                // Elimina tavolo e messaggi
                if (window.confirm(`Vuoi davvero eliminare il tavolo '${stanzaCorrente}' e tutti i suoi messaggi?`)) {
                  await supabase.from("baretto_messaggi").delete().eq("stanza", stanzaCorrente);
                  await supabase.from("baretto_presenze").delete().eq("stanza", stanzaCorrente);
                  setStanze(stanze.filter(s => s !== stanzaCorrente));
                  setStanzaSelezionata(STANZA_DEFAULT);
                  setMessaggi(messaggi.filter(m => m.stanza !== stanzaCorrente));
                }
              }
            }}
            style={{
              width: "100%",
              padding: typeof window !== "undefined" && window.innerWidth < 800 ? "3px 0" : "13px 0",
              borderRadius: 999,
              border: "1px solid #f55",
              background: "#181818",
              color: "#f55",
              fontWeight: 700,
              fontSize: typeof window !== "undefined" && window.innerWidth < 800 ? 12 : "1.13rem",
              cursor: "pointer",
              marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 1 : 0,
              marginTop: 6,
            }}
          >
            {stanzaCorrente === STANZA_DEFAULT ? "Svuota chat Generale" : `Elimina tavolo e chat`}
          </button>
        )}
      </aside>
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: typeof window !== "undefined" && window.innerWidth < 800 ? "calc(100vh - 120px)" : "85vh",
          position: "relative",
          justifyContent: "flex-start",
          marginTop: typeof window !== "undefined" && window.innerWidth < 800 ? 8 : 0,
          marginBottom: 0,
          width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : 700,
          padding: typeof window !== "undefined" && window.innerWidth < 800 ? "0 6px" : "0 32px",
          marginLeft: typeof window !== "undefined" && window.innerWidth < 800 ? 0 : "auto",
          marginRight: typeof window !== "undefined" && window.innerWidth < 800 ? 0 : "auto",
          overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
        }}
      >
        <div
          ref={listaRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 0 110px 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messaggi.map((msg) => {
            const isMine =
              msg.id_utente === user?.id ||
              msg.username === nomeUtenteCorrente;
            return (
              <div key={msg.id}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 15, lineHeight: 1 }}>{msg.username}</span>
                  <span style={{ color: "#aaa", fontSize: 12, fontWeight: 400, lineHeight: 1 }}>
                    - {formattaOra(msg.created_at)}
                  </span>
                </div>
                <div>{msg.testo}</div>
              </div>
            );
          })}
        </div>
        <form
          onSubmit={inviaMessaggio}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100vw',
            padding: typeof window !== 'undefined' && window.innerWidth < 800 ? '6px 6px 8px 6px' : '12px 0',
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            background: '#181818',
            border: 'none',
            zIndex: 100,
            boxShadow: typeof window !== 'undefined' && window.innerWidth < 800 ? '0 -2px 12px #0008' : undefined,
            borderTop: '1.5px solid #222',
            gap: 6,
            justifyContent: typeof window !== 'undefined' && window.innerWidth >= 800 ? 'center' : undefined,
          }}
        >
          <textarea
            value={testoNuovo}
            onChange={e => setTestoNuovo(e.target.value)}
            rows={1}
            placeholder="Scrivi un messaggio..."
            style={typeof window !== 'undefined' && window.innerWidth < 800 ? {
              width: '70vw', // aumenta ancora la textarea
              minWidth: 0,
              maxWidth: 'unset',
              alignSelf: 'flex-start',
              marginLeft: 0,
              marginRight: 0,
              resize: 'none',
              borderRadius: 10,
              border: 'none',
              boxShadow: 'none',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              background: '#222',
              color: '#fff',
              padding: '10px 12px',
              fontSize: 17,
              minHeight: 38,
              maxHeight: 60,
              boxSizing: 'border-box',
              display: 'block',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            } : {
              width: '65vw',
              maxWidth: 520,
              minWidth: 120,
              resize: 'none',
              borderRadius: 18,
              border: '1.5px solid #444',
              padding: '14px 16px',
              fontSize: 18,
              background: '#222',
              color: '#fff',
              minHeight: 44,
              maxHeight: 90,
              boxSizing: 'border-box',
              margin: '10px 0',
              outline: 'none',
              display: 'block',
            }}

            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                inviaMessaggio(e as any);
              }
            }}
          />
          <button
            type="submit"
            style={{
              flexShrink: 0,
              marginLeft: 6,
              width: typeof window !== 'undefined' && window.innerWidth < 800 ? '20vw' : undefined, // riduci bottone
              padding: typeof window !== 'undefined' && window.innerWidth < 800 ? '10px 0' : '12px 22px',
              borderRadius: 12,
              border: 'none',
              background: '#f5a623',
              color: '#181818',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              minWidth: 44,
              minHeight: 38,
              boxShadow: 'none',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Invia
          </button>

        </form>
        </main>
      </div>
    </>
  );
}
