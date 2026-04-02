import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function PannelloControllo() {
  const { loading } = useUser();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [locali, setLocali] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [articoli, setArticoli] = useState<any[]>([]);
  const [cocktail, setCocktail] = useState<any[]>([]);
  const [distillati, setDistillati] = useState<any[]>([]);

  const [bartender, setBartender] = useState<any[]>([]);
  const [proprietari, setProprietari] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");

  const [kpi, setKpi] = useState({
    utenti: 0,
    locali: 0,
    drink: 0,
    articoli: 0,
  });

  const [saveStatus, setSaveStatus] = useState<"ok" | "error" | null>(null);

  useEffect(() => {
    if (!loading && isAdmin) {
      loadData();
    }
  }, [loading]);

  async function loadData() {
    const { data: localiData } = await supabase.from("Locali").select("*");
    const { data: utentiData } = await supabase.from("profili").select("*");
    const { data: articoliData } = await supabase.from("articoli").select("*");
    const { data: cocktailData } = await supabase.from("cocktail").select("*");
    const { data: distillatiData } = await supabase.from("distillati").select("*");

    const safeUsers = Array.isArray(utentiData) ? utentiData : [];
    const safeCocktail = Array.isArray(cocktailData) ? cocktailData : [];

    setLocali(localiData || []);
    setUtenti(safeUsers);

    setBartender(safeUsers.filter(u => u?.ruolo === "bartender"));
    setProprietari(safeUsers.filter(u => u?.ruolo === "proprietario"));

    setArticoli(articoliData || []);
    setCocktail(safeCocktail);
    setDistillati(distillatiData || []);

    setKpi({
      utenti: safeUsers.length,
      locali: (localiData || []).length,
      drink: (safeCocktail.length || 0) + (distillatiData?.length || 0),
      articoli: (articoliData || []).length,
    });
  }

  async function toggleApprovazione(user: any) {
    await supabase
      .from("profili")
      .update({ approvato: !user.approvato })
      .eq("id", user.id);

    loadData();
  }

  async function salvaModifiche() {
    if (!selectedItem || !selectedTable) return;

    const { id, ...dataToUpdate } = selectedItem;

    const cleanData: any = {};
    Object.keys(dataToUpdate).forEach(k => {
      cleanData[k] = dataToUpdate[k] ?? null;
    });

    const { error } = await supabase
      .from(selectedTable)
      .update(cleanData)
      .eq("id", id);

    if (error) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("ok");

    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);

    await loadData();
  }

  async function eliminaElemento() {
    if (!selectedItem || !selectedTable) return;

    const { error } = await supabase
      .from(selectedTable)
      .delete()
      .eq("id", selectedItem.id);

    if (error) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("ok");

    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);

    setSelectedItem(null);
    await loadData();
  }

  if (loading) return null;
  if (!isAdmin) return <div>Accesso negato</div>;

  function Sidebar(title: string, data: any[], table: string, label: string) {
    const sorted = [...data].sort((a, b) =>
      String(a?.[label] ?? a?.nome ?? "").localeCompare(
        String(b?.[label] ?? b?.nome ?? "")
      )
    );

    return (
      <div style={{ marginBottom: 20 }}>
        <h4 style={sidebarTitle}>{title}</h4>
        <select
          style={select}
          value={selectedTable === table && selectedItem ? String(selectedItem.id) : ""}
          onChange={(e) => {
            const value = e.target.value;
            const item = data.find(d => String(d.id) === value);
            setSelectedItem(item || null);
            setSelectedTable(table);
            setSaveStatus(null);
          }}
        >
          <option value="">Scegli</option>
          {sorted.map(d => (
            <option key={d.id} value={String(d.id)}>
              {d?.[label] ?? d?.nome ?? "—"}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={layout}>
      <div style={sidebar}>
        <h2 style={{ color: "#f59e0b", marginBottom: 30 }}>Pannello di Controllo</h2>

        <div style={{ marginTop: 40 }}>
          {Sidebar("Locali", locali, "Locali", "nome")}
        </div>

        {Sidebar("Utenti", utenti, "profili", "username")}
        {Sidebar("Bartender", bartender, "profili", "username")}
        {Sidebar("Proprietari", proprietari, "profili", "username")}
        {Sidebar("Cocktail", cocktail, "cocktail", "nome")}
        {Sidebar("Distillati", distillati, "distillati", "nome")}
        {Sidebar("Articoli", articoli, "articoli", "titolo")}
      </div>

      <div style={content}>
        <div style={kpiGrid}>
          <div style={kpiCard}>Utenti {kpi.utenti}</div>
          <div style={kpiCard}>Locali {kpi.locali}</div>
          <div style={kpiCard}>Drink {kpi.drink}</div>
          <div style={kpiCard}>Articoli {kpi.articoli}</div>
        </div>

        <div style={approvalBox}>
          {utenti.filter(u => !u.approvato).map(u => (
            <div key={u.id} style={approvalRow}>
              <span>{u.username} ({u.ruolo})</span>
              <button style={btnApprove} onClick={() => toggleApprovazione(u)}>
                Approva
              </button>
            </div>
          ))}
        </div>

        {selectedItem && (
          <div style={card}>
            <h2>{selectedItem.nome || selectedItem.titolo || selectedItem.username}</h2>

            {saveStatus === "ok" && (
              <div style={badgeOk}>Modifica salvata</div>
            )}

            {saveStatus === "error" && (
              <div style={badgeError}>Modifica non salvata</div>
            )}

            {Object.keys(selectedItem).map(key =>
              key !== "id" && (
                <div key={key} style={field}>
                  <label>{key}</label>
                  <input
                    value={selectedItem[key] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedItem((prev: any) => ({
                        ...prev,
                        [key]: value,
                      }));

                      setSaveStatus(null);
                    }}
                    style={input}
                  />
                </div>
              )
            )}

            <div style={buttonRow}>
              <button style={btnSave} onClick={salvaModifiche}>
                Salva
              </button>

              <button style={btnDelete} onClick={eliminaElemento}>
                Elimina
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* STILI */

const layout = { display: "flex", height: "100vh", background: "#020617", color: "white" };
const sidebar = { width: 260, padding: 20 };
const content = { flex: 1, padding: 30 };

const kpiGrid = { display: "flex", gap: 20 };

const kpiCard = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #334155",
};

const card = {
  background: "#0f172a",
  padding: 25,
  borderRadius: 16,
  marginTop: 20,
};

const sidebarTitle = { color: "#f59e0b" };

const field = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const input = {
  padding: 8,
  borderRadius: 6,
  background: "#020617",
  color: "#fff",
};

const select = {
  width: "100%",
  padding: 8,
  borderRadius: 6,
  background: "#020617",
  color: "#fff",
};

const approvalBox = {
  marginTop: 20,
  background: "#111",
  padding: 15,
  borderRadius: 10,
};

const approvalRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderBottom: "1px solid #333",
};

const btnApprove = {
  background: "#f59e0b",
  padding: "6px 10px",
  borderRadius: 6,
};

const buttonRow = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const btnSave = {
  background: "green",
  padding: "10px 16px",
  borderRadius: 6,
};

const btnDelete = {
  background: "red",
  padding: "10px 16px",
  borderRadius: 6,
};

const badgeOk = {
  background: "green",
  padding: 10,
  borderRadius: 6,
  marginBottom: 10,
};

const badgeError = {
  background: "red",
  padding: 10,
  borderRadius: 6,
  marginBottom: 10,
};