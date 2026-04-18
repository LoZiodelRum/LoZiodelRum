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
  const [utentiOnline, setUtentiOnline] = useState<string[]>([]);
  const [messaggi, setMessaggi] = useState<any[]>([]);
  const [testoNuovo, setTestoNuovo] = useState<string>("");
  const listaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setUtentiOnline([nomeUtenteCorrente]);
  }, [nomeUtenteCorrente]);

  useEffect(() => {
    setTimeout(() => {
      if (listaRef.current) {
        listaRef.current.scrollTop = listaRef.current.scrollHeight;
      }
    }, 50);
  }, [messaggi]);

  function inviaMessaggio(e: any) {
    e.preventDefault();
    if (!testoNuovo.trim()) return;
    const nuovo = {
      testo: testoNuovo,
      created_at: new Date().toISOString(),
      id_utente: user?.id,
      stanza: stanzaCorrente,
      username: nomeUtenteCorrente,
    };
    setMessaggi((old) => [...old, { ...nuovo, id: Math.random().toString() }]);
    setTestoNuovo("");
    // Qui puoi aggiungere la logica per inviare il messaggio a supabase
  }

  function formattaOra(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{ display: "flex", flexDirection: typeof window !== "undefined" && window.innerWidth < 800 ? "column" : "row", minHeight: "100vh", width: "100%", height: "100%" }}>
      <aside
        style={{
          width: typeof window !== "undefined" && window.innerWidth < 800 ? "100vw" : 270,
          background: "rgba(28,25,23,0.5)",
          border: "1px solid rgba(68,64,60,0.5)",
          borderRadius: 18,
          padding: typeof window !== "undefined" && window.innerWidth < 800 ? "10px 10px 6px 10px" : 18,
          display: "flex",
          flexDirection: "column",
          gap: typeof window !== "undefined" && window.innerWidth < 800 ? 6 : 18,
          minHeight: typeof window !== "undefined" && window.innerWidth < 800 ? undefined : 420,
          marginBottom: typeof window !== "undefined" && window.innerWidth < 800 ? 6 : 0,
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
              width: '62vw', // poco più della metà
              minWidth: 0,
              maxWidth: 'unset',
              alignSelf: 'flex-start',
              marginLeft: 0,
              marginRight: 0,
              resize: 'none',
              borderRadius: 10,
              border: 'none', // tolta la riga grigia
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
              width: typeof window !== 'undefined' && window.innerWidth < 800 ? '28vw' : undefined, // il resto dello spazio
              padding: typeof window !== 'undefined' && window.innerWidth < 800 ? '10px 0' : '12px 22px',
              borderRadius: 12,
              border: 'none',
              background: '#f5a623',
              color: '#181818',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              minWidth: 56,
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
  );
}