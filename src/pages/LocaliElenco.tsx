import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LocaliElenco() {
  const [locali, setLocali] = useState<any[]>([]);

  useEffect(() => {
    loadLocali();
  }, []);

  async function loadLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("*")
      .order("nome");

    if (!error && data) {
      setLocali(data);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Elenco Locali</h1>

      {locali.map((locale) => (
        <div
          key={locale.id}
          style={{
            background: "#1a1a1a",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{locale.nome}</h3>
        </div>
      ))}
    </div>
  );
}