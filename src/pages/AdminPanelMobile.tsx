import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function AdminPanelMobile() {
  const { loading, isAdmin } = useUser();

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [locali, setLocali] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [cocktail, setCocktail] = useState<any[]>([]);
  const [distillati, setDistillati] = useState<any[]>([]);
  const [vini, setVini] = useState<any[]>([]);
  const [articoli, setArticoli] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState("");

  const [loadingData, setLoadingData] = useState(true);

  const kpi = {
    utenti: utenti.length,
    locali: locali.length,
    drink: cocktail.length + distillati.length + vini.length,
    articoli: articoli.length,
  };

  useEffect(() => {
    if (!loading && isAdmin) {
      loadData();
    }

    if (!loading && !isAdmin) {
      setLoadingData(false);
    }
  }, [loading, isAdmin]);

  useEffect(() => {
    if (leftOpen || rightOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [leftOpen, rightOpen]);

  async function loadData() {
    try {
      setLoadingData(true);

      const { data: localiData } = await supabase.from("Locali").select("*");
      const { data: utentiData } = await supabase.from("Profili").select("*");
      const { data: cocktailData } = await supabase.from("cocktail").select("*");
      const { data: distillatiData } = await supabase.from("distillati").select("*");
      const { data: viniData } = await supabase.from("vini").select("*");
      const { data: articoliData } = await supabase.from("Articoli").select("*");

      setLocali(localiData || []);
      setUtenti(utentiData || []);
      setCocktail(cocktailData || []);
      setDistillati(distillatiData || []);
      setVini(viniData || []);
      setArticoli(articoliData || []);
    } catch (err) {
      console.error("Errore AdminPanelMobile loadData:", err);
    } finally {
      setLoadingData(false);
    }
  }

  function openItem(table: string, item: any) {
    setSelectedTable(table);
    setSelectedItem(item);
    setLeftOpen(false);
  }

  function Sidebar(title: string, data: any[], table: string, label: string) {
    const sorted = [...data].sort((a, b) =>
      String(a?.[label] ?? a?.nome ?? "").localeCompare(
        String(b?.[label] ?? b?.nome ?? "")
      )
    );

    return (
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ color: "#f59e0b", marginBottom: 8 }}>{title}</h4>

        <select
          style={selectStyle}
          value=""
          onChange={(e) => {
            const value = e.target.value;
            const item = data.find((d) => String(d.id) === value);
            if (item) openItem(table, item);
          }}
        >
          <option value="">Seleziona</option>
          {sorted.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d?.[label] ?? d?.nome ?? d?.titolo ?? "—"}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function getTitle(item: any) {
    if (!item) return "";
    return (
      item.nome ||
      item.username ||
      item.titolo ||
      item.email ||
      "Elemento selezionato"
    );
  }

  if (loading || loadingData) {
    return (
      <div style={pageStyle}>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "red" }}>Accesso negato</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <button onClick={() => setLeftOpen(true)} style={leftButtonStyle}>
        ←
      </button>

      <button onClick={() => setRightOpen(true)} style={rightButtonStyle}>
        →
      </button>

      <div style={titleBoxStyle}>
        <h1 style={titleStyle}>Pannello di Controllo</h1>
      </div>

      <div style={kpiGridStyle}>
        <Box title="UTENTI" value={kpi.utenti} />
        <Box title="LOCALI" value={kpi.locali} />
        <Box title="DRINK" value={kpi.drink} />
        <Box title="ARTICOLI" value={kpi.articoli} />
      </div>

      {selectedItem && (
        <div style={selectedCardStyle}>
          <h2 style={{ margin: 0 }}>{getTitle(selectedItem)}</h2>
          <p style={{ color: "#f59e0b", marginTop: 8 }}>{selectedTable}</p>
        </div>
      )}

      {leftOpen && (
        <>
          <div style={overlayStyle} onClick={() => setLeftOpen(false)} />
          <div style={leftMenuStyle}>
            <button onClick={() => setLeftOpen(false)} style={closeButtonStyle}>
              ✕
            </button>

            {Sidebar("Locali", locali, "Locali", "nome")}
            {Sidebar("Utenti", utenti, "profili", "username")}
            {Sidebar("Cocktail", cocktail, "cocktail", "nome")}
            {Sidebar("Distillati", distillati, "distillati", "nome")}
            {Sidebar("Vini", vini, "vini", "nome")}
            {Sidebar("Articoli", articoli, "articoli", "titolo")}
          </div>
        </>
      )}

      {rightOpen && (
        <>
          <div style={overlayStyle} onClick={() => setRightOpen(false)} />
          <div style={rightMenuStyle}>
            <button onClick={() => setRightOpen(false)} style={closeButtonStyle}>
              ✕
            </button>

            <h3 style={{ color: "#f59e0b" }}>Azioni</h3>
            <button style={actionButtonStyle}>Nuovo Cocktail</button>
            <button style={actionButtonStyle}>Nuovo Distillato</button>
            <button style={actionButtonStyle}>Nuovo Locale</button>
          </div>
        </>
      )}
    </div>
  );
}

function Box({ title, value }: any) {
  return (
    <div style={boxStyle}>
      <div style={boxTitleStyle}>{title}</div>
      <div style={boxValueStyle}>{value}</div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  background: "#020617",
  minHeight: "100vh",
  color: "white",
  padding: "92px 24px 24px",
  position: "relative",
};

const leftButtonStyle: React.CSSProperties = {
  position: "fixed",
  top: 22,
  left: 16,
  zIndex: 50,
  width: 58,
  height: 58,
  borderRadius: "50%",
  border: "none",
  background: "#111827",
  color: "#f59e0b",
  fontSize: 28,
};

const rightButtonStyle: React.CSSProperties = {
  ...leftButtonStyle,
  left: "auto",
  right: 16,
};

const titleBoxStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1f2937",
  padding: "24px 10px",
  textAlign: "center",
  marginBottom: 26,
};

const titleStyle: React.CSSProperties = {
  color: "#f59e0b",
  margin: 0,
  fontSize: 32,
};

const kpiGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const boxStyle: React.CSSProperties = {
  background: "#111827",
  borderRadius: 18,
  padding: "28px 10px",
  textAlign: "center",
};

const boxTitleStyle: React.CSSProperties = {
  color: "#f59e0b",
  fontWeight: 700,
  fontSize: 18,
  marginBottom: 12,
};

const boxValueStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 44,
};

const selectedCardStyle: React.CSSProperties = {
  marginTop: 28,
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: 22,
  padding: 24,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 90,
};

const leftMenuStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "78%",
  height: "100%",
  background: "#0f172a",
  zIndex: 100,
  padding: 20,
  overflowY: "auto",
};

const rightMenuStyle: React.CSSProperties = {
  ...leftMenuStyle,
  left: "auto",
  right: 0,
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "#f59e0b",
  border: "none",
  fontSize: 28,
  marginBottom: 20,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "#020617",
  color: "white",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "14px 12px",
  fontSize: 16,
};

const actionButtonStyle: React.CSSProperties = {
  width: "100%",
  background: "#f59e0b",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  fontWeight: 700,
};