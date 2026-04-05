import "../App.css";
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
  const [selectedOriginalItem, setSelectedOriginalItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createRoleHint, setCreateRoleHint] = useState<string | null>(null);

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

    const normalizeValue = (value: any) => {
      if (value === "") return null;
      return value ?? null;
    };

    const cleanData: any = {};
    Object.keys(dataToUpdate).forEach(k => {
      cleanData[k] = normalizeValue(dataToUpdate[k]);
    });

    const changedData: any = {};
    if (!isCreating) {
      Object.keys(cleanData).forEach((k) => {
        const current = cleanData[k];
        const previous = normalizeValue(selectedOriginalItem?.[k]);
        if (JSON.stringify(current) !== JSON.stringify(previous)) {
          changedData[k] = current;
        }
      });

      if (Object.keys(changedData).length === 0) {
        setSaveStatus("ok");
        setTimeout(() => setSaveStatus(null), 2000);
        return;
      }
    }

    let error: any = null;

    if (isCreating) {
      if (!cleanData.id) {
        cleanData.id = crypto.randomUUID();
      }

      if (selectedTable === "profili") {
        cleanData.ruolo = cleanData.ruolo || createRoleHint || "utente";
        cleanData.approvato = cleanData.approvato ?? false;
      }

      const result = await supabase
        .from(selectedTable)
        .insert([cleanData])
        .select("id");

      error = result.error;

      if (!error && (!result.data || result.data.length === 0)) {
        error = { message: "Nessun record creato. Verifica i permessi di scrittura." };
      }
    } else {
      const result = await supabase
        .from(selectedTable)
        .update(changedData)
        .eq("id", id)
        .select("id");

      error = result.error;

      if (!error && (!result.data || result.data.length === 0)) {
        error = { message: "Nessuna modifica salvata. Verifica permessi o id record." };
      }
    }

    if (error) {
      setSaveStatus("error");
      console.error("Errore salvataggio:", error);
      alert(error.message || "Errore salvataggio");
      return;
    }

    setSaveStatus("ok");

    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);

    setIsCreating(false);
    setCreateRoleHint(null);

    if (!isCreating) {
      const { data: refreshedItem } = await supabase
        .from(selectedTable)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (refreshedItem) {
        setSelectedItem(refreshedItem);
        setSelectedOriginalItem(refreshedItem);
      }
    }

    await loadData();
  }

  async function eliminaElemento() {
    if (!selectedItem || !selectedTable || isCreating) return;

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
    setSelectedOriginalItem(null);
    await loadData();
  }

  if (loading) return null;
  if (!isAdmin) return <div style={{ padding: 20, color: "red" }}>Accesso negato</div>;

  const booleanFields = new Set(["approvato", "in_evidenza", "verificato"]);
  const toBoolean = (value: any) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return ["true", "1", "si", "yes", "on"].includes(normalized);
    }
    return false;
  };

  function openFirstEditor(table: string, data: any[]) {
    if (!Array.isArray(data) || data.length === 0) return;

    const firstItem = { ...data[0] };
    if (table === "Locali" && firstItem.recensioni === undefined) {
      firstItem.recensioni = "";
    }

    setSelectedTable(table);
    setSelectedItem(firstItem);
    setSelectedOriginalItem(firstItem);
    setSaveStatus(null);
    setIsCreating(false);
    setCreateRoleHint(null);
  }

  function openCreateEditor(table: string, data: any[], roleHint?: string) {
    const base = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const draft: any = {};

    if (base) {
      Object.keys(base).forEach((k) => {
        if (k === "id") return;

        if (booleanFields.has(k)) {
          draft[k] = false;
          return;
        }

        draft[k] = "";
      });
    }

    if (table === "cocktail") {
      draft.categoria = draft.categoria || "cocktail";
    }

    if (table === "Locali") {
      draft.recensioni = draft.recensioni || "";
    }

    if (table === "profili") {
      draft.ruolo = roleHint || "utente";
      draft.approvato = false;
      draft.status = draft.status || "in_attesa";
    }

    setSelectedTable(table);
    setSelectedItem(draft);
    setSelectedOriginalItem(null);
    setSaveStatus(null);
    setIsCreating(true);
    setCreateRoleHint(roleHint || null);
  }

  function Sidebar(title: string, data: any[], table: string, label: string) {
    const sorted = [...data].sort((a, b) =>
      String(a?.[label] ?? a?.nome ?? "").localeCompare(
        String(b?.[label] ?? b?.nome ?? "")
      )
    );

    return (
      <div style={{ marginBottom: 20 }}>
        <h4 style={sidebarTitleStyle}>{title}</h4>
        <select
          style={selectStyle}
          value={selectedTable === table && selectedItem ? String(selectedItem.id) : ""}
          onChange={(e) => {
            const value = e.target.value;
            const item = data.find(d => String(d.id) === value);
            if (table === "Locali" && item) {
              const normalizedItem = { ...item, recensioni: item.recensioni ?? "" };
              setSelectedItem(normalizedItem);
              setSelectedOriginalItem(normalizedItem);
            } else {
              setSelectedItem(item || null);
              setSelectedOriginalItem(item || null);
            }
            setSelectedTable(table);
            setSaveStatus(null);
            setIsCreating(false);
            setCreateRoleHint(null);
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
    <div className="page page-full-bleed fade-in" style={layoutStyle}>
      <div style={sidebarStyle}>
        <h2 style={{ color: "#f59e0b", marginBottom: 20, fontSize: "1.2rem" }}>Pannello di Controllo</h2>

        <div style={{ marginTop: 20 }}>
          {Sidebar("Locali", locali, "Locali", "nome")}
        </div>

        {Sidebar("Utenti", utenti, "profili", "username")}
        {Sidebar("Bartender", bartender, "profili", "username")}
        {Sidebar("Proprietari", proprietari, "profili", "username")}
        {Sidebar("Cocktail", cocktail, "cocktail", "nome")}
        {Sidebar("Distillati", distillati, "distillati", "nome")}
        {Sidebar("Articoli", articoli, "articoli", "titolo")}
      </div>

      <div style={contentStyle}>
        <div style={kpiGridStyle}>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Utenti</span> <strong>{kpi.utenti}</strong></div>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Locali</span> <strong>{kpi.locali}</strong></div>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Drink</span> <strong>{kpi.drink}</strong></div>
          <div style={kpiCardStyle}><span style={kpiLabelStyle}>Articoli</span> <strong>{kpi.articoli}</strong></div>
        </div>

        <div style={approvalBoxStyle}>
          <h3 style={{ fontSize: "1rem", color: "#f59e0b", marginBottom: 10 }}>Approvazioni pendenti</h3>
          {utenti.filter(u => !u.approvato).map(u => (
            <div key={u.id} style={approvalRowStyle}>
              <span style={{ fontSize: "0.9rem" }}>{u.username} ({u.ruolo})</span>
              <button style={btnApproveStyle} onClick={() => toggleApprovazione(u)}>
                Approva
              </button>
            </div>
          ))}
          {utenti.filter(u => !u.approvato).length === 0 && (
            <p style={{ fontSize: "0.8rem", color: "#666" }}>Nessun utente da approvare.</p>
          )}
        </div>

        <div style={quickActionGridStyle}>
          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Cocktail</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("cocktail", cocktail)}>
              Apri scheda modifica cocktail
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Distillati</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("distillati", distillati)}>
              Apri scheda modifica distillati
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Locali</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("Locali", locali)}>
              Apri scheda modifica locali
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Bartender</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("profili", bartender, "bartender")}>
              Apri scheda modifica bartender
            </button>
          </div>

          <div style={quickActionCardStyle}>
            <h3 style={quickActionTitleStyle}>Aggiunta Proprietari</h3>
            <button style={quickActionBtnStyle} onClick={() => openCreateEditor("profili", proprietari, "proprietario")}>
              Apri scheda modifica proprietari
            </button>
          </div>
        </div>

        {selectedItem && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 15 }}>
              {isCreating
                ? "Nuovo elemento"
                : (selectedItem.nome || selectedItem.titolo || selectedItem.username)}
            </h2>

            {saveStatus === "ok" && (
              <div style={badgeOkStyle}>Modifica salvata</div>
            )}

            {saveStatus === "error" && (
              <div style={badgeErrorStyle}>Modifica non salvata</div>
            )}

            <div style={formGridStyle}>
              {Object.keys(selectedItem).map(key =>
                key !== "id" && (
                  <div
                    key={key}
                    style={
                      key === "contenuto"
                        ? { ...fieldStyle, gridColumn: "1 / -1" }
                        : fieldStyle
                    }
                  >
                    <label style={labelStyle}>{key}</label>
                    {booleanFields.has(key) ? (
                      <select
                        value={String(toBoolean(selectedItem[key]))}
                        onChange={(e) => {
                          const value = e.target.value === "true";
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            [key]: value,
                          }));
                          setSaveStatus(null);
                        }}
                        style={selectStyle}
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : key === "contenuto" ? (
                      <textarea
                        rows={6}
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            [key]: value,
                          }));
                          setSaveStatus(null);
                        }}
                        style={{ ...inputStyle, width: "100%", resize: "vertical" }}
                      />
                    ) : (
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
                        style={inputStyle}
                      />
                    )}
                  </div>
                )
              )}
            </div>

            <div style={buttonRowStyle}>
              <button style={btnSaveStyle} onClick={salvaModifiche}>
                {isCreating ? "Crea" : "Salva"}
              </button>

              {!isCreating && (
                <button style={btnDeleteStyle} onClick={eliminaElemento}>
                  Elimina
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* STILI OTTIMIZZATI PER MOBILE & TABLET */

const layoutStyle: React.CSSProperties = { 
  display: "flex", 
  flexWrap: "wrap", // Permette alla sidebar di andare sopra il contenuto su mobile
  minHeight: "100vh", 
  background: "#020617", 
  color: "white" 
};

const sidebarStyle: React.CSSProperties = { 
  width: "100%", 
  maxWidth: "16.25rem",
  flexBasis: "260px",
  flexGrow: 1,
  padding: 20, 
  borderRight: "1px solid #1e293b",
  background: "#0f172a" 
};

const contentStyle: React.CSSProperties = { 
  flex: 1, 
  minWidth: 0,
  padding: "20px" 
};

const kpiGridStyle: React.CSSProperties = { 
  display: "flex", 
  gap: 10, 
  flexWrap: "wrap", // I KPI vanno a capo su mobile
  marginBottom: 20 
};

const kpiCardStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: 12,
  border: "1px solid #334155",
  flex: "1 1 140px", // Cresce e si restringe, minimo 140px
  textAlign: "center"
};

const kpiLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  color: "#94a3b8",
  marginBottom: 5,
  textTransform: "uppercase"
};

const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 16,
  marginTop: 20,
  border: "1px solid #1e293b"
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // Griglia automatica per i campi input
  gap: 15
};

const sidebarTitleStyle = { color: "#f59e0b", fontSize: "0.9rem", marginBottom: 8 };

const fieldStyle = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const labelStyle = {
  fontSize: "0.8rem",
  color: "#94a3b8",
  marginBottom: 5
};

const inputStyle = {
  padding: "10px",
  borderRadius: 6,
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
  fontSize: "14px"
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
};

const approvalBoxStyle = {
  marginTop: 20,
  background: "#0f172a",
  padding: 15,
  borderRadius: 10,
  border: "1px solid #1e293b"
};

const quickActionGridStyle: React.CSSProperties = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
};

const quickActionCardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 15,
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const quickActionTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  color: "#f59e0b",
  margin: 0,
};

const quickActionBtnStyle: React.CSSProperties = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const approvalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #1e293b",
};

const btnApproveStyle = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  fontWeight: "bold" as const,
  cursor: "pointer"
};

const buttonRowStyle = {
  display: "flex",
  gap: 10,
  marginTop: 25,
};

const btnSaveStyle = {
  background: "#10b981",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 6,
  fontWeight: "bold" as const,
  cursor: "pointer",
  flex: 1
};

const btnDeleteStyle = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 6,
  fontWeight: "bold" as const,
  cursor: "pointer",
  flex: 1
};

const badgeOkStyle = {
  background: "rgba(16, 185, 129, 0.2)",
  color: "#10b981",
  padding: 10,
  borderRadius: 6,
  marginBottom: 15,
  border: "1px solid #10b981",
  textAlign: "center" as const
};

const badgeErrorStyle = {
  background: "rgba(239, 68, 68, 0.2)",
  color: "#ef4444",
  padding: 10,
  borderRadius: 6,
  marginBottom: 15,
  border: "1px solid #ef4444",
  textAlign: "center" as const
};