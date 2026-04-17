import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

type Messaggio = {
  id: string;
  testo: string;
  username: string;
  avatar_url: string;
  created_at: string;
};

export default function Baretto() {
  const { user } = useUser();
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [testo, setTesto] = useState("");

  // CARICA MESSAGGI + REALTIME
  useEffect(() => {
    fetchMessaggi();

    const channel = supabase
      .channel("baretto")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "baretto_messaggi",
        },
        (payload) => {
          setMessaggi((prev) => [...prev, payload.new as Messaggio]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMessaggi() {
    const { data } = await supabase
      .from("baretto_messaggi")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setMessaggi(data);
  }

  async function inviaMessaggio() {
    if (!testo.trim() || !user) return;

    await supabase.from("baretto_messaggi").insert({
      testo,
      id_utente: user.id,
      username: user.user_metadata?.username || "Utente",
      avatar_url: "",
    });

    setTesto("");
  }

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 h-[400px] flex flex-col">
      
      {/* MESSAGGI */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messaggi.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="text-yellow-400 font-semibold">
              {msg.username}:
            </span>{" "}
            <span className="text-white">{msg.testo}</span>
          </div>
        ))}
      </div>

      {/* INPUT */}
      {user ? (
        <div className="flex gap-2">
          <input
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Scrivi al bancone..."
            className="flex-1 p-2 rounded bg-black text-white border border-gray-700"
          />
          <button
            onClick={inviaMessaggio}
            className="bg-yellow-500 px-4 rounded text-black font-semibold"
          >
            Invia
          </button>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          Accedi per partecipare al Baretto
        </div>
      )}
    </div>
  );
}