import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type MessaggioDb = {
  id: string;
  testo: string;
  id_utente: string | null;
  created_at: string;
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
  username: string;
  created_at: string;
};

export default function BarettoPreview() {
  const navigate = useNavigate();
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);

  useEffect(() => {
    caricaMessaggi();
  }, []);

  function nomeProfilo(profilo?: Profilo) {
    if (!profilo) return "Utente";
    if (profilo.username && profilo.username.trim()) return profilo.username;
    const nomeCompleto = `${profilo.nome || ""} ${profilo.cognome || ""}`.trim();
    if (nomeCompleto) return nomeCompleto;
    return "Utente";
  }

  async function caricaMessaggi() {
    const { data, error } = await supabase
      .from("baretto_messaggi")
      .select("id, testo, id_utente, created_at, username")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Errore caricamento anteprima baretto:", error);
      setMessaggi([]);
      return;
    }

    const messaggiDb = (data || []) as MessaggioDb[];
    if (messaggiDb.length === 0) {
      setMessaggi([]);
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
        console.error("Errore caricamento profili anteprima baretto:", profiliError);
      } else {
        mappaProfili = new Map((profiliData || []).map((profilo) => [profilo.id, profilo as Profilo]));
      }
    }

    const lista = messaggiDb.map((msg) => ({
      id: msg.id,
      testo: msg.testo,
      created_at: msg.created_at,
      username: nomeProfilo(msg.id_utente ? mappaProfili.get(msg.id_utente) : undefined) || msg.username || "Utente",
    }));

    setMessaggi(lista);
  }

  return (
    <div
      className="space-y-3 cursor-pointer"
      onClick={() => navigate("/baretto")}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate("/baretto");
        }
      }}
      aria-label="Apri chat Il Baretto"
    >
      {messaggi.length === 0 && (
        <div className="text-gray-500 text-sm">
          Nessuna conversazione ancora attiva
        </div>
      )}

      {messaggi.map((msg) => (
        <div key={msg.id}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-white">
              {msg.username}
            </span>
            <span className="text-gray-400 text-sm">Online</span>
          </div>

          <p className="text-gray-400 text-sm ml-4">
            {msg.testo}
          </p>
        </div>
      ))}
    </div>
  );
}