import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

type MessaggioDb = {
  id: string;
  testo: string;
  created_at: string;
  id_utente: string | null;
  stanza: string | null;
  username: string | null;
};

type Profilo = {
  id: string;
  username: string | null;
  nome: string | null;
  cognome: string | null;
};

type Messaggio = {
  id: string;
  testo: string;
  created_at: string;
  id_utente: string | null;
  stanza: string;
  username: string;
};

const STANZA_DEFAULT = "Generale";

export default function Baretto() {
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();

  const [stanze, setStanze] = useState<string[]>([]);
  const [stanzaSelezionata, setStanzaSelezionata] = useState<string>(STANZA_DEFAULT);
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [testoNuovo, setTestoNuovo] = useState("");
  const [utentiOnline, setUtentiOnline] = useState<string[]>([]);
  const [nomeUtenteCorrente, setNomeUtenteCorrente] = useState("Utente");
  const [caricamento, setCaricamento] = useState(false);

  const listaRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stanzaCorrente = useMemo(() => {
    if (stanzaSelezionata && stanzaSelezionata.trim()) return stanzaSelezionata;
    return STANZA_DEFAULT;
  }, [stanzaSelezionata]);

  useEffect(() => {
    void caricaStanze();
  }, []);

  useEffect(() => {
    void risolviNomeUtenteCorrente();
  }, [user, isAdmin]);

  useEffect(() => {
    void caricaMessaggi(stanzaCorrente);
  }, [stanzaCorrente]);

  useEffect(() => {
    const channel = supabase
      .channel("baretto-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "baretto_messaggi",
        },
        async (payload) => {
          const nuovaStanza = (payload.new as { stanza?: string | null })?.stanza || STANZA_DEFAULT;

          if (nuovaStanza === stanzaCorrente) {
            await caricaMessaggi(stanzaCorrente);
          }

          await caricaStanze();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stanzaCorrente]);

  useEffect(() => {
    const chiavePresenza = user?.id || `admin-${crypto.randomUUID()}`;
    const canalePresenza = supabase.channel("baretto-presenza", {
      config: {
        presence: {
          key: chiavePresenza,
        },
      },
    });

    canalePresenza
      .on("presence", { event: "sync" }, () => {
        const statoPresenza = canalePresenza.presenceState<{ nomeUtente?: string }>();
        const nomi = Object.values(statoPresenza)
          .flat()
          .map((presenza) => String(presenza.nomeUtente || "Utente"));

        setUtentiOnline(Array.from(new Set(nomi)));
      })
      .subscribe(async (stato) => {
        if (stato === "SUBSCRIBED") {
          await canalePresenza.track({ nomeUtente: nomeUtenteCorrente });
        }
      });

    return () => {
      void canalePresenza.untrack();
      supabase.removeChannel(canalePresenza);
    };
  }, [user?.id, nomeUtenteCorrente]);

  useEffect(() => {
    if (!listaRef.current) return;
    listaRef.current.scrollTo({
      top: listaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messaggi]);

  function nomeProfilo(profilo?: Profilo) {
    if (!profilo) return "Utente";
    if (profilo.username && profilo.username.trim()) return profilo.username;
    const nomeCompleto = `${profilo.nome || ""} ${profilo.cognome || ""}`.trim();
    if (nomeCompleto) return nomeCompleto;
    return "Utente";
  }

  function formattaOra(timestamp: string) {
    const data = new Date(timestamp);
    if (Number.isNaN(data.getTime())) return "";
    return data.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function risolviNomeUtenteCorrente() {
    if (user?.id) {
      const { data, error } = await supabase
        .from("Profili")
        .select("id, username, nome, cognome")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Errore caricamento utente corrente baretto:", error);
        setNomeUtenteCorrente(user.user_metadata?.username || user.email?.split("@")[0] || "Utente");
        return;
      }

      if (data) {
        setNomeUtenteCorrente(nomeProfilo(data as Profilo));
        return;
      }

      setNomeUtenteCorrente(user.user_metadata?.username || user.email?.split("@")[0] || "Utente");
      return;
    }

    if (isAdmin) {
      setNomeUtenteCorrente("Lo Zio");
      return;
    }

    setNomeUtenteCorrente("Utente");
  }

  async function caricaStanze() {
    const { data, error } = await supabase
      .from("baretto_messaggi")
      .select("stanza")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore caricamento stanze baretto:", error);
      setStanze([STANZA_DEFAULT]);
      return;
    }

    const nomiStanze = Array.from(
      new Set(
        (data || []).map((item) => {
          const nome = String(item.stanza || "").trim();
          return nome || STANZA_DEFAULT;
        })
      )
    );

    const elenco = nomiStanze.length > 0 ? nomiStanze : [STANZA_DEFAULT];
    setStanze(elenco);

    if (!elenco.includes(stanzaCorrente)) {
      setStanzaSelezionata(elenco[0]);
    }
  }

  async function caricaMessaggi(stanza: string) {
    setCaricamento(true);

    const { data, error } = await supabase
      .from("baretto_messaggi")
      .select("id, testo, created_at, id_utente, stanza, username")
      .eq("stanza", stanza)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Errore caricamento messaggi baretto:", error);
      setMessaggi([]);
      setCaricamento(false);
      return;
    }

    const messaggiDb = (data || []) as MessaggioDb[];
    if (messaggiDb.length === 0) {
      setMessaggi([]);
      setCaricamento(false);
      return;
    }

    const idUtenti = Array.from(new Set(messaggiDb.map((msg) => msg.id_utente).filter(Boolean))) as string[];
    let mappaProfili = new Map<string, Profilo>();

    if (idUtenti.length > 0) {
      const { data: profiliData, error: profiliError } = await supabase
        .from("Profili")
        .select("id, username, nome, cognome")
        .in("id", idUtenti);

      if (profiliError) {
        console.error("Errore caricamento profili baretto:", profiliError);
      } else {
        mappaProfili = new Map((profiliData || []).map((profilo) => [profilo.id, profilo as Profilo]));
      }
    }

    const lista = messaggiDb.map((msg) => ({
      id: msg.id,
      testo: msg.testo,
      created_at: msg.created_at,
      id_utente: msg.id_utente,
      stanza: msg.stanza || STANZA_DEFAULT,
      username: nomeProfilo(msg.id_utente ? mappaProfili.get(msg.id_utente) : undefined) || msg.username || "Utente",
    }));

    setMessaggi(lista);
    setCaricamento(false);
  }

  async function inviaMessaggio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const testoPulito = testoNuovo.trim();
    const puoInviare = Boolean(user) || isAdmin;
    if (!testoPulito || !puoInviare) return;

    const { error } = await supabase.from("baretto_messaggi").insert({
      testo: testoPulito,
      id_utente: user?.id || null,
      username: nomeUtenteCorrente,
      stanza: stanzaCorrente,
    });

    if (error) {
      console.error("Errore invio messaggio baretto:", error);
      return;
    }

    setTestoNuovo("");
  }

  return isMobile ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        minHeight: "100vh",
        width: "100vw",
        background: "url('/bg-chat.png') repeat",
        backgroundSize: "60px",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: "rgba(18,18,18,0.82)", // overlay scuro per contrasto
          border: 0,
          borderRadius: 0,
          boxShadow: "none",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "12px 12px 10px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(126, 169, 196, 0.18)",
            background: "rgba(4, 27, 43, 0.75)",
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={() => navigate("/community")}
            style={{
              background: "transparent",
              border: "none",
              color: "#d9f0ff",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            ←
          </button>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "linear-gradient(145deg, #5cb0d8 0%, #2b6888 100%)",
              border: "1px solid rgba(180, 225, 247, 0.6)",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: "#ecf8ff", fontWeight: 700, fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {stanzaCorrente}
            </div>
            <div style={{ color: "#9fd0e8", fontSize: "0.73rem", opacity: 0.9 }}>
              {utentiOnline.length > 0 ? `${utentiOnline.length} online` : "Nessuno online"}
            </div>
          </div>
          <button
            onClick={() => void caricaMessaggi(stanzaCorrente)}
            style={{
              background: "transparent",
              border: "none",
              color: "#d9f0ff",
              fontSize: "1.15rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Aggiorna messaggi"
          >
            ⋮
          </button>
        </div>

        <div
          style={{
            padding: "8px 10px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderBottom: "1px solid rgba(126, 169, 196, 0.12)",
            background: "rgba(4, 27, 43, 0.46)",
          }}
        >
          {stanze.map((stanza) => {
            const attiva = stanza === stanzaCorrente;
            return (
              <button
                key={stanza}
                onClick={() => setStanzaSelezionata(stanza)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 999,
                  border: attiva ? "1px solid rgba(179, 230, 255, 0.68)" : "1px solid rgba(126, 169, 196, 0.35)",
                  background: attiva ? "rgba(80, 165, 215, 0.32)" : "rgba(11, 51, 73, 0.6)",
                  color: attiva ? "#eef9ff" : "#a9d4ea",
                  fontSize: "0.77rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                {stanza}
              </button>
            );
          })}
        </div>

        <div
          ref={listaRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "14px 10px 70px 10px", // spazio extra in basso per il form
            display: "flex",
            flexDirection: "column",
            gap: 10,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {!caricamento && messaggi.length === 0 && (
            <div style={{ color: "#98bfd5", fontSize: "0.84rem", textAlign: "center", paddingTop: 12 }}>
              Nessun messaggio in questa stanza
            </div>
          )}

          {messaggi.map((msg) => {
            const isMine = (Boolean(user?.id) && msg.id_utente === user?.id) || msg.username === nomeUtenteCorrente;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                {!isMine && (
                  <div style={{ color: "#9fd0e8", fontSize: "0.72rem", fontWeight: 700, marginBottom: 3, paddingLeft: 3 }}>
                    <span translate="no">{msg.username}</span>
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "82%",
                    borderRadius: isMine ? "16px 16px 6px 16px" : "16px 16px 16px 6px",
                    background: isMine ? "linear-gradient(180deg, #2d8fd0 0%, #2372a8 100%)" : "rgba(18, 74, 102, 0.9)",
                    border: isMine
                      ? "1px solid rgba(126, 201, 248, 0.62)"
                      : "1px solid rgba(115, 171, 204, 0.4)",
                    color: "#eef9ff",
                    padding: "9px 11px",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.24)",
                    wordBreak: "break-word",
                    fontSize: "0.88rem",
                    lineHeight: 1.32,
                  }}
                >
                  {msg.testo}
                </div>
                <div style={{ color: "#80b4ce", fontSize: "0.68rem", marginTop: 3, paddingInline: 4 }}>
                  {formattaOra(msg.created_at)}
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={inviaMessaggio}
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            padding: "10px 8px 10px 8px",
            borderTop: "1px solid rgba(126, 169, 196, 0.18)",
            background: "rgba(18,18,18,0.98)",
            maxWidth: 600,
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(9, 40, 58, 0.95)",
              border: "1px solid rgba(126, 169, 196, 0.34)",
              borderRadius: 999,
              padding: "6px 8px 6px 12px",
            }}
          >
            <input
              value={testoNuovo}
              onChange={(event) => setTestoNuovo(event.target.value)}
              placeholder={user || isAdmin ? "Scrivi un messaggio..." : "Accedi per scrivere"}
              disabled={!user && !isAdmin}
              style={{
                flex: 1,
                border: "none",
                background: "#23272f",
                color: "#fff",
                fontSize: "0.98rem",
                outline: "none",
                borderRadius: 8,
                padding: "8px 10px"
              }}
            />
            <button
              type="submit"
              disabled={(!user && !isAdmin) || !testoNuovo.trim()}
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "none",
                background: (user || isAdmin) && testoNuovo.trim() ? "#f5a623" : "#2d5168",
                color: "#23272f",
                fontSize: "1rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: (user || isAdmin) && testoNuovo.trim() ? "pointer" : "not-allowed",
              }}
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    // ===== DESKTOP LAYOUT =====
    <div className="page page-full-bleed fade-in" style={{ minHeight: "100vh", background: "url('/bg-chat.png') repeat", backgroundSize: "60px", padding: 0, margin: 0 }}>
      <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24, background: "rgba(18,18,18,0.82)", borderRadius: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 style={{ margin: 0, color: "#f5a623", fontSize: "clamp(1.3rem, 2.4vw, 2rem)" }}>Il Baretto</h1>
          <button
            onClick={() => navigate("/community")}
            style={{
              background: "transparent",
              border: "1px solid rgba(120,113,108,0.5)",
              color: "#d6d3d1",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Torna a Community
          </button>
        </div>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontWeight: 700, color: "#fafaf9", marginBottom: 6 }}>Stanze</div>
          <button
            onClick={() => {
              const nome = prompt("Nome del nuovo tavolo (stanza)?");
              if (nome && !stanze.includes(nome)) {
                setStanze([...stanze, nome]);
                setStanzaSelezionata(nome);
              }
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #f5a623",
              background: "#f5a623",
              color: "#23272f",
              fontWeight: 700,
              marginBottom: 10,
              cursor: "pointer",
              fontSize: 16
            }}
          >
            + Crea un tavolo
          </button>
          <div
            style={{
              padding: "8px 10px",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              borderBottom: "1px solid rgba(126, 169, 196, 0.12)",
              background: "rgba(4, 27, 43, 0.46)",
              marginBottom: 16
            }}
          >
            {stanze.map((stanza) => {
              const attiva = stanza === stanzaCorrente;
              return (
                <button
                  key={stanza}
                  onClick={() => setStanzaSelezionata(stanza)}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 999,
                    border: attiva ? "2px solid #f5a623" : "1px solid rgba(126, 169, 196, 0.35)",
                    background: attiva ? "#f5a623" : "rgba(11, 51, 73, 0.6)",
                    color: attiva ? "#23272f" : "#a9d4ea",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "pointer",
                    marginBottom: 2
                  }}
                >
                  {stanza}
                </button>
              );
            })}
          </div>
        </div>
        {/* ...resto del layout desktop chat... */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px minmax(0, 1fr)",
            gap: 14,
            minHeight: "75vh",
          }}
        >
          <aside
            style={{
              background: "rgba(28,25,23,0.5)",
              border: "1px solid rgba(68,64,60,0.5)",
              borderRadius: 18,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: 700, color: "#fafaf9", marginBottom: 6 }}>Stanze</div>
            <button
              onClick={() => {
                const nome = prompt("Nome del nuovo tavolo (stanza)?");
                if (nome && !stanze.includes(nome)) {
                  setStanze([...stanze, nome]);
                  setStanzaSelezionata(nome);
                }
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #f5a623",
                background: "#f5a623",
                color: "#23272f",
                fontWeight: 700,
                marginBottom: 10,
                cursor: "pointer",
                fontSize: 16
              }}
            >
              + Crea un tavolo
            </button>
            <div
              style={{
                padding: "8px 10px",
                display: "flex",
                gap: 8,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                borderBottom: "1px solid rgba(126, 169, 196, 0.12)",
                background: "rgba(4, 27, 43, 0.46)",
              }}
            >
              {stanze.map((stanza) => {
                const attiva = stanza === stanzaCorrente;
                return (
                  <button
                    key={stanza}
                    onClick={() => setStanzaSelezionata(stanza)}
                    style={{
                      padding: "7px 13px",
                      borderRadius: 999,
                      border: attiva ? "2px solid #f5a623" : "1px solid rgba(126, 169, 196, 0.35)",
                      background: attiva ? "#f5a623" : "rgba(11, 51, 73, 0.6)",
                      color: attiva ? "#23272f" : "#a9d4ea",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      cursor: "pointer",
                      marginBottom: 2
                    }}
                  >
                    {stanza}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ...resto del layout chat... */}

          {/* ...resto del layout chat e input bar... */}
        </div>
      </div>
    </div>
  );
}