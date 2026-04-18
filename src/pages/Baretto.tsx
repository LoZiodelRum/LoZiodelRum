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

  const nomeUtenteCorrente =
    user?.username || user?.nome || user?.email || "Anonimo";

  function formattaOra(data: string) {
    const d = new Date(data);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    setCaricamento(true);
    supabase
      .from("messaggi_baretto")
      .select("*")
      .eq("stanza", stanzaCorrente)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
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
      .from("messaggi_baretto")
      .insert([nuovo])
      .then(() => {
        setTestoNuovo("");
        supabase
          .from("messaggi_baretto")
          .select("*")
          .eq("stanza", stanzaCorrente)
          .order("created_at", { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) setMessaggi(data as MessaggioDb[]);
          });
      });
  }

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [messaggi]);

  useEffect(() => {
    setUtentiOnline([nomeUtenteCorrente]);
  }, [nomeUtenteCorrente]);

  return (
    <div
      className="page page-full-bleed fade-in"
      style={{
        minHeight: "100vh",
        background: "url('/bg-chat.png') repeat fixed",
        backgroundSize: "60px",
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
          padding: 24,
          background: "rgba(18,18,18,0.82)",
          borderRadius: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 32,
            minHeight: "70vh",
          }}
        >
          <aside
            style={{
              width: 270,
              background: "rgba(28,25,23,0.5)",
              border: "1px solid rgba(68,64,60,0.5)",
              borderRadius: 18,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              minHeight: 420,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#f5a623",
                fontSize: 28,
                marginBottom: 18,
                letterSpacing: 0.5,
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
              }}
            >
              Utenti collegati
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
                padding: "13px 0",
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
                fontSize: "1.13rem",
                marginBottom: 10,
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
                padding: "13px 0",
                borderRadius: 999,
                border: "1px solid #444",
                background: "#181818",
                color: "#f5a623",
                fontWeight: 700,
                fontSize: "1.13rem",
                cursor: "pointer",
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
              height: "70vh",
              position: "relative",
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
                    <div>{msg.username}</div>
                    <div>{msg.testo}</div>
                    <div>{formattaOra(msg.created_at)}</div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={inviaMessaggio}>
              <input
                value={testoNuovo}
                onChange={(e) => setTestoNuovo(e.target.value)}
              />
              <button type="submit">Invia</button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}