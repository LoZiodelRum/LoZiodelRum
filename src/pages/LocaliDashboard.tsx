import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LocaliDashboard() {
  const [locali, setLocali] = useState<any[]>([]);
  const [ricerca, setRicerca] = useState("");
  const [menuAperto, setMenuAperto] = useState<string | null>(null);

  useEffect(() => {
    loadLocali();
  }, []);

  async function loadLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("id,nome,citta")
      .or("status.eq.approved,approvato.eq.true")
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setLocali(data || []);
  }

  const localiFiltrati = useMemo(() => {
    return locali.filter((locale) =>
      (locale.nome || "")
        .toLowerCase()
        .includes(ricerca.toLowerCase())
    );
  }, [locali, ricerca]);
async function cambiaPiano(id: string, piano: string) {
  const { error } = await supabase
    .from("Locali")
    .update({ piano })
    .eq("id", id);

  if (error) {
    alert("Errore aggiornamento piano");
    return;
  }

  setMenuAperto(null);
  loadLocali();
}

async function sospendiLocale(id: string) {
  const conferma = window.confirm(
    "Vuoi sospendere questo locale?"
  );

  if (!conferma) return;

  const { error } = await supabase
    .from("Locali")
    .update({ status: "suspended" })
    .eq("id", id);

  if (error) {
    alert("Errore sospensione");
    return;
  }

  setMenuAperto(null);
  loadLocali();
}

async function eliminaLocale(id: string) {
  const conferma = window.confirm(
    "Vuoi eliminare definitivamente questo locale?"
  );

  if (!conferma) return;

  const { error } = await supabase
    .from("Locali")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Errore eliminazione");
    return;
  }

  setMenuAperto(null);
  loadLocali();
}
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020B1C",
        color: "white",
        padding: "100px 16px 30px 16px",
      }}
    >
      <h1
        style={{
          color: "#f59e0b",
          fontSize: "30px",
          marginBottom: 6,
          fontWeight: 800,
        }}
      >
        Gestione Locali
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        Dashboard amministrativa DrinkWise
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={kpiStyle}>
          <h2 style={kpiNumber}>{locali.length}</h2>
          <span>Locali Totali</span>
        </div>

        <div style={kpiStyle}>
          <h2 style={kpiNumber}>5</h2>
          <span>Premium</span>
        </div>

        <div style={kpiStyle}>
          <h2 style={kpiNumber}>18</h2>
          <span>Entry</span>
        </div>

        <div style={kpiStyle}>
          <h2 style={kpiNumber}>0</h2>
          <span>Executive</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Elenco Locali
        </h2>

        <button
          style={{
            background: "#f59e0b",
            color: "#000",
            border: "none",
            borderRadius: 12,
            padding: "10px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Aggiungi
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Cerca locale..."
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
        style={{
          width: "100%",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 12,
          color: "white",
          padding: "14px",
          marginBottom: 16,
          outline: "none",
          fontSize: 15,
        }}
      />

      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {localiFiltrati.map((locale) => (
          <div
            key={locale.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {locale.nome}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {locale.citta || "Città non disponibile"}
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={() =>
                  setMenuAperto(
                    menuAperto === locale.id ? null : locale.id
                  )
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#f59e0b",
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ⋮
              </button>

              {menuAperto === locale.id && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 35,
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 12,
                    minWidth: 170,
                    zIndex: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={menuItemStyle}
                    onClick={() => {
                      window.open(`/venue/${locale.id}`, "_blank");
                      setMenuAperto(null);
                    }}
                  >
                    👁️ Visualizza
                  </div>

                  <div
  style={menuItemStyle}
  onClick={() => {
    const nuovoPiano = window.prompt(
      "Inserisci: Entry, Premium oppure Executive",
      "Entry"
    );

    if (
      nuovoPiano === "Entry" ||
      nuovoPiano === "Premium" ||
      nuovoPiano === "Executive"
    ) {
      cambiaPiano(locale.id, nuovoPiano);
    }
  }}
>
  ⭐ Piano
</div>

                  <div
  style={menuItemStyle}
  onClick={() => sospendiLocale(locale.id)}
>
  🚫 Sospendi
</div>

                  <div
                    style={{
                      ...menuItemStyle,
                      borderBottom: "none",
                      color: "#ef4444",
                    }}
                    onClick={() => eliminaLocale(locale.id)}
                  >
                    🗑️ Elimina
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const kpiStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 16,
  textAlign: "center" as const,
};

const kpiNumber = {
  color: "#f59e0b",
  margin: "0 0 8px 0",
};

const menuItemStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #1e293b",
  cursor: "pointer",
};