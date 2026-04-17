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
  const [sidebarAperta, setSidebarAperta] = useState(false);

  const listaRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarAperta(false); // Chiudi sidebar al resize
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
    // ===== MOBILE LAYOUT =====
    <div style={{ height: "100vh", background: "#0c0a09", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* HEADER */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(68,64,60,0.5)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>
        <h1 style={{ margin: 0, color: "#f5a623", fontSize: "1rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Il Baretto</h1>
        <button
          onClick={() => navigate("/community")}
          style={{
            background: "transparent",
            border: "none",
            color: "#f5a623",
            cursor: "pointer",
            fontSize: "1.2rem",
            flexShrink: 0,
          }}
        >
          ◀
        </button>
      </div>

      {/* STANZE SCROLL ORIZZONTALE */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(68,64,60,0.5)", display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", flexShrink: 0 }}>
        {stanze.map((stanza) => {
          const attiva = stanza === stanzaCorrente;
          return (
            <button
              key={stanza}
              onClick={() => setStanzaSelezionata(stanza)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: attiva ? "1px solid #f5a623" : "1px solid rgba(120,113,108,0.4)",
                background: attiva ? "rgba(245,166,35,0.15)" : "rgba(12,10,9,0.8)",
                color: attiva ? "#fcd34d" : "#e7e5e4",
                cursor: "pointer",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {stanza}
            </button>
          );
        })}
      </div>

      {/* MESSAGGI AREA */}
      <div ref={listaRef} style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8, WebkitOverflowScrolling: "touch", minHeight: 0 }}>
        {!caricamento && messaggi.length === 0 && (
          <div style={{ color: "#a8a29e", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
            Nessuna conversazione
          </div>
        )}

        {messaggi.map((msg) => {
          const online = utentiOnline.includes(msg.username);
          return (
            <div key={msg.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: online ? "#22c55e" : "#78716c", flexShrink: 0, marginTop: "5px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#f5a623", fontSize: "0.8rem", fontWeight: 700, marginBottom: 2 }}>{msg.username}</div>
                <div style={{ color: "#fafaf9", fontSize: "0.85rem", wordBreak: "break-word" }}>{msg.testo}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={inviaMessaggio}
        style={{
          borderTop: "1px solid rgba(68,64,60,0.5)",
          padding: "8px 10px",
          display: "flex",
          gap: 6,
          background: "rgba(28,25,23,0.95)",
          flexShrink: 0,
        }}
      >
        <input
          value={testoNuovo}
          onChange={(event) => setTestoNuovo(event.target.value)}
          placeholder={user || isAdmin ? "Scrivi..." : "Accedi"}
          disabled={!user && !isAdmin}
          style={{
            flex: 1,
            borderRadius: 6,
            border: "1px solid rgba(120,113,108,0.5)",
            background: "#1a1a1a",
            color: "#f5f5f4",
            padding: "8px 10px",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={(!user && !isAdmin) || !testoNuovo.trim()}
          style={{
            borderRadius: 6,
            border: "none",
            background: (user || isAdmin) && testoNuovo.trim() ? "#f59e0b" : "#57534e",
            color: "#1c1917",
            fontWeight: 700,
            padding: "8px 12px",
            cursor: (user || isAdmin) && testoNuovo.trim() ? "pointer" : "not-allowed",
            fontSize: "1rem",
            flexShrink: 0,
          }}
        >
          ↑
        </button>
      </form>
    </div>
  ) : (
    // ===== DESKTOP LAYOUT =====
    <div className="page page-full-bleed fade-in" style={{ minHeight: "100vh", background: "#0c0a09", padding: 0 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
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

            {stanze.map((stanza) => {
              const attiva = stanza === stanzaCorrente;
              return (
                <button
                  key={stanza}
                  onClick={() => setStanzaSelezionata(stanza)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: attiva ? "1px solid rgba(245,166,35,0.8)" : "1px solid rgba(120,113,108,0.4)",
                    background: attiva ? "rgba(245,166,35,0.15)" : "rgba(12,10,9,0.55)",
                    color: attiva ? "#fcd34d" : "#e7e5e4",
                    cursor: "pointer",
                  }}
                >
                  {stanza}
                </button>
              );
            })}

            <div style={{ marginTop: 10, borderTop: "1px solid rgba(68,64,60,0.45)", paddingTop: 10 }}>
              <div style={{ fontWeight: 700, color: "#fafaf9", marginBottom: 6 }}>Utenti online</div>

              {utentiOnline.length === 0 && (
                <div style={{ color: "#a8a29e", fontSize: 13 }}>Nessun utente online</div>
              )}

              {utentiOnline.map((nome) => (
                <div key={nome} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e", display: "inline-block" }} />
                  <span style={{ color: "#e7e5e4", fontSize: 14 }}>{nome}</span>
                </div>
              ))}
            </div>
          </aside>

          <section
            style={{
              background: "rgba(28,25,23,0.5)",
              border: "1px solid rgba(68,64,60,0.5)",
              borderRadius: 18,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(68,64,60,0.45)", color: "#fafaf9", fontWeight: 700 }}>
              Stanza: {stanzaCorrente}
            </div>

            <div ref={listaRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px", display: "grid", gap: 12 }}>
              {!caricamento && messaggi.length === 0 && (
                <div style={{ color: "#a8a29e", fontSize: 14 }}>
                  Nessuna conversazione ancora attiva
                </div>
              )}

              {messaggi.map((msg) => {
                const online = utentiOnline.includes(msg.username);
                return (
                  <div key={msg.id} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: online ? "#22c55e" : "#78716c", flexShrink: 0, display: "inline-block" }} />
                    <strong style={{ color: "#f5a623", flexShrink: 0 }}>{msg.username}</strong>
                    <span style={{ color: "#fafaf9" }}>{msg.testo}</span>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={inviaMessaggio}
              style={{
                borderTop: "1px solid rgba(68,64,60,0.45)",
                padding: "12px 14px",
                display: "flex",
                gap: 8,
                position: "sticky",
                bottom: 0,
                background: "rgba(28,25,23,0.92)",
              }}
            >
              <input
                value={testoNuovo}
                onChange={(event) => setTestoNuovo(event.target.value)}
                placeholder={user || isAdmin ? `Scrivi in ${stanzaCorrente}...` : "Accedi per scrivere"}
                disabled={!user && !isAdmin}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  border: "1px solid rgba(120,113,108,0.5)",
                  background: "#0f0f0f",
                  color: "#f5f5f4",
                  padding: "10px 12px",
                }}
              />
              <button
                type="submit"
                disabled={(!user && !isAdmin) || !testoNuovo.trim()}
                style={{
                  borderRadius: 10,
                  border: "none",
                  background: (user || isAdmin) && testoNuovo.trim() ? "#f59e0b" : "#57534e",
                  color: "#1c1917",
                  fontWeight: 700,
                  padding: "10px 14px",
                  cursor: (user || isAdmin) && testoNuovo.trim() ? "pointer" : "not-allowed",
                }}
              >
                Invia
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}