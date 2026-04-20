import React, { useState, useRef, useEffect, useContext } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import "../App.css";

// Icona menu (hamburger)
const MenuIcon = ({ onClick }: { onClick: () => void }) => (
  <div onClick={onClick} style={{ position: "absolute", top: 16, left: 16, zIndex: 20, cursor: "pointer" }}>
    <div style={{ width: 28, height: 4, background: "#FF8800", borderRadius: 2, marginBottom: 5 }} />
    <div style={{ width: 20, height: 4, background: "#FF8800", borderRadius: 2, marginBottom: 5 }} />
    <div style={{ width: 24, height: 4, background: "#FF8800", borderRadius: 2 }} />
  </div>
);

const Sidebar = ({ open, onClose, tavoli, utenti, onSelectTavolo, onCreaTavolo, onSvuotaChat, tavoloAttivoId }: any) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: open ? 0 : "-75vw",
      width: "75vw",
      height: "100vh",
      background: "rgba(10,10,10,0.98)",
      boxShadow: open ? "2px 0 16px #0008" : "none",
      zIndex: 30,
      transition: "left 0.35s cubic-bezier(.77,0,.18,1)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      padding: 0,
    }}
  >
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: 16 }}>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#FF8800", fontSize: 28, cursor: "pointer" }}>×</button>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
      <h2 style={{ color: "#FF8800", fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Tavoli</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tavoli.map((t: any) => (
          <li key={t.id}>
            <button
              onClick={() => onSelectTavolo(t)}
              style={{
                background: tavoloAttivoId === t.id ? "#181818" : "none",
                color: tavoloAttivoId === t.id ? "#FF8800" : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 6,
                width: "100%",
                textAlign: "left",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              🥃 {t.nome}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ margin: "18px 0 10px 0", borderTop: "1px solid #222", paddingTop: 10 }}>
        <h3 style={{ color: "#FF8800", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Utenti collegati</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {utenti.map((u: any) => (
            <li key={u.id} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: u.online ? "#1ED760" : "#888", display: "inline-block", marginRight: 8 }} />
              <span style={{ color: u.online ? "#fff" : "#aaa", fontWeight: 500 }}>{u.nome}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "row", gap: 10 }}>
        <button onClick={onCreaTavolo} style={{ background: "#FF8800", color: "#000", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1, maxWidth: '50%' }}>Crea un tavolo</button>
        <button onClick={onSvuotaChat} style={{ background: "#222", color: "#FF8800", border: "1px solid #FF8800", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1, maxWidth: '50%' }}>Svuota chat</button>
      </div>
    </div>
  </div>
);

const IlBaretto = () => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tavoli, setTavoli] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [tavoloAttivo, setTavoloAttivo] = useState<any>(null);
  const [messaggi, setMessaggi] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effetti: caricamento tavoli, utenti, messaggi
  useEffect(() => {
    setTavoli([
      { id: 1, nome: "Generale" },
      { id: 2, nome: "Rum" },
      { id: 3, nome: "Whisky" },
    ]);
    // Popola utenti collegati con l'utente attuale
    setUtenti([{ id: user?.id || 1, nome: user?.username || "Lo Zio", online: true }]);
    setTavoloAttivo({ id: 1, nome: "Generale" });
    // Messaggi caricati da Supabase
  }, [user]);

  // Caricamento messaggi reali da Supabase
  useEffect(() => {
    async function fetchMessaggi() {
      const { data, error } = await supabase
        .from("baretto_messaggi")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) setMessaggi(data);
    }
    fetchMessaggi();
  }, []);

  // Funzione admin per svuotare la chat
  async function svuotaChat() {
    await supabase.from("baretto_messaggi").delete().neq("id", 0); // Elimina tutti i messaggi
    setMessaggi([]);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi]);

  const handleSend = () => {
    if (!input.trim()) return;
    // TODO: invio messaggio a Supabase
    setMessaggi((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: user?.username || "Lo Zio",
        testo: input,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
    ]);
    setInput("");
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", width: "100vw", position: "relative", overflow: "hidden" }}>
      {/* Sidebar overlay */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tavoli={tavoli}
        utenti={utenti}
        onSelectTavolo={(t: any) => { setTavoloAttivo(t); setSidebarOpen(false); }}
        onCreaTavolo={() => alert("TODO: crea tavolo")}
        onSvuotaChat={svuotaChat}
        tavoloAttivoId={tavoloAttivo?.id}
      />
      {/* Hamburger menu */}
      {!sidebarOpen && <MenuIcon onClick={() => setSidebarOpen(true)} />}
      {/* Overlay click to close sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 25, background: "rgba(0,0,0,0.2)" }}
        />
      )}
      {/* Main chat area */}
      <div style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100vw",
        maxWidth: "100vw",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          position: "sticky",
          top: 0,
          width: "100vw",
          background: "#000",
          zIndex: 10,
          borderBottom: "1px solid #181818",
          padding: "18px 0 12px 0",
          textAlign: "center"
        }}>
          <span style={{ color: "#FF8800", fontWeight: 700, fontSize: 22 }}>🥃 Tavolo {tavoloAttivo?.nome}</span>
        </div>
        {/* Messaggi */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 0 80px 0" }}>
          {messaggi.map((m) => (
            <div key={m.id} style={{ margin: "0 18px 18px 18px", display: "flex", flexDirection: "row", alignItems: "center" }}>
              {/* Nome utente con pallino verde se online */}
              <span style={{ display: "flex", alignItems: "center", fontWeight: 700, color: "#FF8800", fontSize: 15, marginRight: 10 }}>
                <span style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: utenti.find((u:any) => u.nome === m.user && (u.online !== false)) ? "#1ED760" : "#888",
                  display: "inline-block",
                  marginRight: 8
                }} />
                {m.user}
              </span>
              <span style={{ color: "#fff", fontSize: 17, marginRight: 10 }}>{m.testo}</span>
              <span style={{ color: "#888", fontSize: 13, marginLeft: 6 }}>- {m.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          background: "#000",
          zIndex: 15,
          borderTop: "1px solid #181818",
          padding: "10px 10px 18px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            placeholder="Scrivi un messaggio..."
            style={{
              width: 320,
              maxWidth: "80vw",
              background: "#181818",
              color: "#fff",
              border: "none",
              borderRadius: 24,
              padding: "10px 16px",
              fontSize: 15,
              outline: "none",
              marginRight: 10,
              textAlign: "left"
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: "#FF8800",
              color: "#000",
              border: "none",
              borderRadius: 24,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >Invia</button>
        </div>
      </div>
    </div>
  );
};

export default IlBaretto;
