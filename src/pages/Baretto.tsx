import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

type Profilo = {
  id: string;
  username?: string;
  nome?: string;
  cognome?: string;
};

type MessaggioDb = {
  id: string;
  testo: string;
  created_at: string;
  id_utente?: string;
  stanza?: string;
  username?: string;
};

const STANZA_DEFAULT = "Generale";

export default function Baretto() {
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();

  const [stanze, setStanze] = useState<string[]>([STANZA_DEFAULT]);
  const [stanzaCorrente, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  const [utentiOnline, setUtentiOnline] = useState<string[]>([]);
  const [messaggi, setMessaggi] = useState<MessaggioDb[]>([]);
  const [caricamento, setCaricamento] = useState<boolean>(true);
  const [testoNuovo, setTestoNuovo] = useState<string>("");
  const listaRef = useRef<HTMLDivElement>(null);

  // Mostra solo username, se admin mostra 'Lo Zio'
  // Mostra solo username, mai la mail. Se admin mostra 'Lo Zio'.
  let nomeUtenteCorrente = "Anonimo";
  if (isAdmin) {
    nomeUtenteCorrente = "Lo Zio";
  } else if (user?.user_metadata?.username && !user?.user_metadata?.username.includes("@")) {
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

  // Sfondo: tante miniature random di bg-drinks.png su tutta la pagina
  useEffect(() => {
    const prevBg = document.body.style.background;
    const prevColor = document.body.style.backgroundColor;
    document.body.style.background = "none";
    document.body.style.backgroundColor = "#181818";
    return () => {
      document.body.style.background = prevBg;
      document.body.style.backgroundColor = prevColor;
    };
  }, []);

  function formattaOra(data: string) {
    const d = new Date(data);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    setCaricamento(true);
    supabase
      .from("baretto_messaggi")
      .select("*")
      .eq("stanza", stanzaCorrente)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Errore caricamento messaggi:", error);
        }
        if (!error && data) setMessaggi(data as MessaggioDb[]);
        setCaricamento(false);
      });
  }, [stanzaCorrente]);

  function inviaMessaggio(e: FormEvent) {
    e.preventDefault();
    if (!testoNuovo.trim()) return;

    const nuovo: Omit<MessaggioDb, "id"> = {
      testo: testoNuovo,
      created_at: new Date().toISOString(),
      id_utente: user?.id,
      stanza: stanzaCorrente,
      username: nomeUtenteCorrente,
    };

    supabase
      .from("baretto_messaggi")
      .insert([nuovo])
      .then(({ error, data }) => {
        if (error) {
          console.error("Errore invio messaggio:", error, nuovo);
        } else {
          // Aggiorna subito la chat room in locale
          setMessaggi((old) => {
            const updated = [...old, { ...nuovo, id: Math.random().toString() }];
            setTimeout(() => {
              if (listaRef.current) {
                listaRef.current.scrollTop = listaRef.current.scrollHeight;
              }
            }, 50);
            return updated;
          });
          setTestoNuovo("");
        }
      });
  }

  useEffect(() => {
    // Scrolla sempre in fondo dopo ogni aggiornamento messaggi
    setTimeout(() => {
      if (listaRef.current) {
        listaRef.current.scrollTop = listaRef.current.scrollHeight;
      }
    }, 50);
  }, [messaggi]);

  useEffect(() => {
    setUtentiOnline([nomeUtenteCorrente]);
  }, [nomeUtenteCorrente]);

  return (
    <div
      className="page page-full-bleed fade-in"
      style={{
        minHeight: "100vh",
        padding: 0,
        margin: 0,
        background: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : undefined,
        minWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : undefined,
        maxWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : undefined,
        overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
      }}
    >
      <div
        style={{
          width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : "100%",
          maxWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : 1400,
          minWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : undefined,
          margin: typeof window !== "undefined" && window.innerWidth < 800 ? 0 : "0 auto",
          padding: typeof window !== "undefined" && window.innerWidth < 800 ? 4 : 24,
          background: "none",
          borderRadius: 0,
          overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 32,
            minHeight: "70vh",
            flexDirection: typeof window !== "undefined" && window.innerWidth < 800 ? "column" : "row",
          }}
        >
          <aside
            style={{
              width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : 270,
              minWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : undefined,
              maxWidth: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : undefined,
              background: "rgba(28,25,23,0.5)",
              border: "1px solid rgba(68,64,60,0.5)",
              borderRadius: 18,
              padding: typeof window !== "undefined" && window.innerWidth < 800 ? 2 : 18,
              display: "flex",
              flexDirection: "column",
              gap: typeof window !== "undefined" && window.innerWidth < 800 ? 2 : 18,
              minHeight: typeof window !== "undefined" && window.innerWidth < 800 ? undefined : 420,
              marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 2 : 0,
              overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
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
                ({utentiOnline.length})
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
              {utentiOnline.length === 0 && (
                <span style={{ color: "#888", fontSize: 15 }}>
                  Nessuno online
                </span>
              )}

              {utentiOnline.map((nome) => (
                <div
                  key={nome}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 15,
                    color: "#e6e6e6",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#2ecc40",
                      marginRight: 4,
                      border: "1.5px solid #222",
                    }}
                  />
                  <span>{nome}</span>
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
          </aside>

          <main
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              height: typeof window !== "undefined" && window.innerWidth < 800 ? "85vh" : "85vh",
              position: "relative",
              justifyContent: "flex-start",
              marginTop: 0,
              marginBottom: 0,
              width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : 700,
              marginLeft: typeof window !== "undefined" && window.innerWidth < 800 ? 0 : "auto",
              marginRight: typeof window !== "undefined" && window.innerWidth < 800 ? 0 : "auto",
              overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {stanze.map((stanza) => (
                <button
                  key={stanza}
                  onClick={() => setStanzaSelezionata(stanza)}
                >
                  {stanza}
                </button>
              ))}
            </div>

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
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : "100%",
                margin: 0,
                padding: 0,
                position: "sticky",
                bottom: 0,
                background: "none",
                border: "none",
                zIndex: 10,
                overflowX: typeof window !== "undefined" && window.innerWidth < 800 ? "hidden" : undefined,
              }}
            >
              <textarea
                value={testoNuovo}
                onChange={(e) => setTestoNuovo(e.target.value)}
                rows={1}
                placeholder="Scrivi un messaggio..."
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: 0,
                  width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : "100%",
                  resize: "none",
                  borderRadius: 8,
                  border: "1px solid #444",
                  padding: "6px 10px",
                  fontSize: 17,
                  background: "#222",
                  color: "#fff",
                  minHeight: 24,
                  maxHeight: 48,
                  boxSizing: "border-box",
                  marginRight: 0
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
                  background: "#c47a2c",
                  color: "#181818",
                  border: "none",
                  borderRadius: 8,
                  padding: "0 14px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  minHeight: 24,
                  height: 32,
                  alignSelf: "flex-end",
                  flex: "none",
                  whiteSpace: "nowrap"
                }}
              >
                Invia
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}