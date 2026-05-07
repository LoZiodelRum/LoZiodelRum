import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
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
  const [saveStatus, setSaveStatus] = useState<"ok" | "error" | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const booleanFields = new Set(["approvato", "in_evidenza", "verificato", "email_verificata"]);

  const removedLocaliFields = new Set([
    "featured",
    "specialties",
    "overall_rating",
    "punti_di_forza",
    "punti_deboli",
  ]);

  const kpi = {
    utenti: utenti.length,
    locali: locali.length,
    drink: cocktail.length + distillati.length + vini.length,
    articoli: articoli.length,
  };

  const fieldLabelMap: Record<string, string> = {
    nome: "Nome",
    username: "Username",
    titolo: "Titolo",
    email: "Email",
    telefono: "Telefono",
    descrizione: "Descrizione",
    contenuto: "Contenuto",
    image_url: "Immagine",
    immagine: "Immagine",
    video_url: "Video",
    price_range: "Fascia prezzo",
    qualita_drink: "Qualità drink",
    competenza_staff: "Competenza staff",
    atmosfera: "Atmosfera",
    qualita_prezzo: "Qualità/prezzo",
  };

  const localiSelectOptions: Record<string, string[]> = {
    qualita_drink: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    competenza_staff: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    atmosfera: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
    qualita_prezzo: ["Scarso", "Mediocre", "Sufficiente", "Buono", "Ottimo", "Eccellente"],
  };

  const profiliSelectOptions: Record<string, string[]> = {
    ruolo: ["utente", "bartender", "proprietario", "admin"],
    status: ["attivo", "sospeso", "admin"],
    genere: ["uomo", "donna"],
  };

  const aisSelectOptions: Record<string, string[]> = {
    categoria: ["rosso", "bianco", "rosato", "bollicine", "altri vini"],
  };

  const cocktailMultiSelectOptions: Record<string, string[]> = {
    base_alcolica: ["Rum", "Gin", "Vodka", "Whisky", "Tequila", "Mezcal", "Brandy", "Amaro"],
    intensita_alcolica: ["Bassa", "Media", "Alta", "Molto alta"],
  };

  const profiliTextareaFields = new Set([
    "bio_breve",
    "certificazioni",
    "descrizione_locale",
    "recensioni",
    "cocktail_creati",
    "locali_segnalati",
    "preferiti",
  ]);

  const profiliNumberFields = new Set([
    "level",
    "points",
    "numero_recensioni",
    "numero_locali_visitati",
    "numero_cocktail_creati",
    "esperienza_anni",
    "numero_dipendenti",
  ]);

  const profiliReadonlyFields = new Set(["id", "created_at", "updated_at", "ultimo_accesso"]);

  useEffect(() => {
    if (!loading && isAdmin) loadData();
    if (!loading && !isAdmin) setLoadingData(false);
  }, [loading, isAdmin]);

  useEffect(() => {
    document.body.style.overflow = leftOpen || rightOpen ? "hidden" : "";
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

  function toBoolean(value: any) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return ["true", "1", "si", "yes", "on"].includes(normalized);
    }
    return false;
  }

  function getTableName() {
    if (selectedTable === "Locali") return "Locali";
    if (selectedTable === "profili") return "Profili";
    if (selectedTable === "cocktail") return "cocktail";
    if (selectedTable === "distillati") return "distillati";
    if (selectedTable === "vini") return "vini";
    if (selectedTable === "articoli") return "Articoli";
    return selectedTable;
  }
  
    function getEditorKeys() {
  try {
    if (!selectedItem) {
      if (selectedTable === "Locali" && locali.length > 0) return Object.keys(locali[0]);
      if (selectedTable === "profili" && utenti.length > 0) return Object.keys(utenti[0]);
      if (selectedTable === "cocktail" && cocktail.length > 0) return Object.keys(cocktail[0]);
      if (selectedTable === "distillati" && distillati.length > 0) return Object.keys(distillati[0]);
      if (selectedTable === "vini" && vini.length > 0) return Object.keys(vini[0]);
      if (selectedTable === "articoli" && articoli.length > 0) return Object.keys(articoli[0]);

      return [];
    }

    return Object.keys(selectedItem).filter((key) => {
      if (selectedTable === "Locali" && removedLocaliFields.has(key)) return false;
      if (selectedTable === "cocktail" && ["data_creazione", "created_at", "texture"].includes(key)) return false;
      return true;
    });
  } catch (err) {
    console.error("Errore getEditorKeys:", err);
    return [];
  }
}

  
  
    

  function openItem(table: string, item: any) {
    setSelectedTable(table);
    setSelectedItem({ ...item });
    setIsCreating(false);
    setSaveStatus(null);
    setLeftOpen(false);
  }

  async function salvaModifiche() {
    if (!selectedItem || !selectedTable) return;
    // 👉 VALIDAZIONE BASE
if (isCreating) {
  if (selectedTable === "Locali" && !selectedItem.nome) {
    alert("Inserisci il nome del locale");
    return;
  }

  if (selectedTable === "cocktail" && !selectedItem.nome) {
    alert("Inserisci il nome del cocktail");
    return;
  }

  if (selectedTable === "vini" && !selectedItem.nome) {
    alert("Inserisci il nome del vino");
    return;
  }

  if (selectedTable === "distillati" && !selectedItem.nome) {
    alert("Inserisci il nome del distillato");
    return;
  }

  if (selectedTable === "profili" && !selectedItem.username) {
    alert("Inserisci username");
    return;
  }
}
// 👉 PULIZIA STRINGHE VUOTE
Object.keys(selectedItem).forEach((key) => {
  if (selectedItem[key] === "") {
    delete selectedItem[key];
  }
});
    try {
      const tableName = getTableName();
      const payload = { ...selectedItem };

// 👉 PULIZIA AUTOMATICA IN CREAZIONE
if (isCreating) {
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  delete payload.ultimo_accesso;
}

      if (!isCreating && payload.id) {
        const { error } = await supabase.from(tableName).update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        delete payload.id;
        const { error } = await supabase.from(tableName).insert(payload);
        if (error) throw error;
      }

      setSaveStatus("ok");
      await loadData();
    } catch (err) {
      console.error("Errore salvataggio:", err);
      setSaveStatus("error");
    }
  }

  async function eliminaElemento() {
    if (!selectedItem?.id || !selectedTable) return;

    const ok = window.confirm("Vuoi eliminare questo elemento?");
    if (!ok) return;

    try {
      const tableName = getTableName();
      const { error } = await supabase.from(tableName).delete().eq("id", selectedItem.id);
      if (error) throw error;

      setSelectedItem(null);
      setSelectedTable("");
      setSaveStatus(null);
      await loadData();
    } catch (err) {
      console.error("Errore eliminazione:", err);
      setSaveStatus("error");
    }
  }

  function Sidebar(title: string, data: any[], table: string, label: string) {
    const sorted = [...data].sort((a, b) =>
      String(a?.[label] ?? a?.nome ?? "").localeCompare(String(b?.[label] ?? b?.nome ?? ""))
    );

    return (
      <div style={{ marginBottom: 18 }}>
        <h4 style={{ color: "#f59e0b", marginBottom: 8 }}>{title}</h4>

        <select
          style={selectStyle}
          value=""
          onChange={(e) => {
            const item = data.find((d) => String(d.id) === e.target.value);
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

  const editorKeys = getEditorKeys();

  return (
    <div style={pageStyle}>
      <button onClick={() => setLeftOpen(true)} style={leftButtonStyle}>
     →
      </button>

      <button onClick={() => setRightOpen(true)} style={rightButtonStyle}>
      ←
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

      {/* EDITOR DETTAGLIO */}
      {(selectedItem || isCreating) && (
        <div style={{ margin: "18px 0 80px 0" }}>
          <div style={editorBoxStyle}>
            <h2 style={editorTitleStyle}>
              {isCreating
                ? "Nuovo elemento"
                : selectedItem.nome || selectedItem.titolo || selectedItem.username || selectedItem.email || "Elemento"}
            </h2>

            {saveStatus === "ok" && <div style={badgeOkStyle}>Modifica salvata</div>}
            {saveStatus === "error" && <div style={badgeErrorStyle}>Modifica non salvata</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {editorKeys.map((key) => {
                if (key === "id" && selectedTable !== "profili") return null;

                if (selectedTable === "profili" && key === "password") {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <input
                        type="password"
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                          setSaveStatus(null);
                        }}
                        placeholder="Lascia vuoto per non cambiarla"
                        style={inputMobileStyle}
                      />
                    </FieldWrap>
                  );
                }

                if (selectedTable === "profili" && profiliSelectOptions[key]) {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <select
                        value={selectedItem[key] ?? ""}
                        disabled={profiliReadonlyFields.has(key)}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                          setSaveStatus(null);
                        }}
                        style={inputMobileStyle}
                      >
                        <option value="">Scegli</option>
                        {profiliSelectOptions[key].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FieldWrap>
                  );
                }

                if (booleanFields.has(key)) {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <select
                        value={String(toBoolean(selectedItem[key]))}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value === "true" }));
                          setSaveStatus(null);
                        }}
                        style={inputMobileStyle}
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </FieldWrap>
                  );
                }

                if (selectedTable === "Locali" && localiSelectOptions[key]) {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <select
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                          setSaveStatus(null);
                        }}
                        style={inputMobileStyle}
                      >
                        <option value="">Scegli</option>
                        {localiSelectOptions[key].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FieldWrap>
                  );
                }

                if (selectedTable === "vini" && aisSelectOptions[key]) {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <select
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                          setSaveStatus(null);
                        }}
                        style={inputMobileStyle}
                      >
                        <option value="">Scegli</option>
                        {aisSelectOptions[key].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FieldWrap>
                  );
                }

                if (selectedTable === "cocktail" && cocktailMultiSelectOptions[key]) {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <input
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                          setSaveStatus(null);
                        }}
                        style={inputMobileStyle}
                      />
                    </FieldWrap>
                  );
                }

                if (
                  key === "contenuto" ||
                  key === "descrizione" ||
                  key === "descrizione_completa" ||
                  (selectedTable === "profili" && profiliTextareaFields.has(key))
                ) {
                  return (
                    <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                      <textarea
                        rows={5}
                        value={selectedItem[key] ?? ""}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                          setSaveStatus(null);
                        }}
                        style={{ ...inputMobileStyle, minHeight: 110, resize: "vertical" }}
                      />
                    </FieldWrap>
                  );
                }

                return (
                  <FieldWrap key={key} label={fieldLabelMap[key] ?? key}>
                    <input
                      type={selectedTable === "profili" && profiliNumberFields.has(key) ? "number" : "text"}
                      value={selectedItem[key] ?? ""}
                      disabled={selectedTable === "profili" && profiliReadonlyFields.has(key)}
                      onChange={(e) => {
                        setSelectedItem((prev: any) => ({ ...prev, [key]: e.target.value }));
                        setSaveStatus(null);
                      }}
                      style={{
                        ...inputMobileStyle,
                        opacity: selectedTable === "profili" && profiliReadonlyFields.has(key) ? 0.7 : 1,
                      }}
                    />
                  </FieldWrap>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
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
            {Sidebar("Utenti", utenti, "Profili", "username")}
            {Sidebar("Bartender", utenti.filter((u) => u.ruolo === "bartender"), "Profili", "username")}
            {Sidebar("Proprietari", utenti.filter((u) => u.ruolo === "proprietario"), "Profili", "username")}
            {Sidebar("Cocktail", cocktail, "Cocktail", "nome")}
            {Sidebar("Distillati", distillati, "Distillati", "nome")}
            {Sidebar("Vini", vini, "Vini", "nome")}
            {Sidebar("Articoli", articoli, "Articoli", "titolo")}
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
            <button
  style={actionButtonStyle}
  onClick={() => {
    setSelectedTable("cocktail");
    setSelectedItem(null);
    setIsCreating(true);
    setRightOpen(false);
  }}
>
  Nuovo Cocktail
</button>

<button
  style={actionButtonStyle}
  onClick={() => {
    setSelectedTable("distillati");
    setSelectedItem(null);
    setIsCreating(true);
    setRightOpen(false);
  }}
>
  Nuovo Distillato
</button>

<button
  style={actionButtonStyle}
  onClick={() => {
    setSelectedTable("vini");
    setSelectedItem(null);
    setIsCreating(true);
    setRightOpen(false);
  }}
>
  Nuovo Vino
</button>

<button
  style={actionButtonStyle}
  onClick={() => {
    setSelectedTable("Locali");
    setSelectedItem(null);
    setIsCreating(true);
    setRightOpen(false);
  }}
>
  Nuovo Locale
</button>

<button
  style={actionButtonStyle}
  onClick={() => {
    setSelectedTable("profili");
    setSelectedItem({ ruolo: "proprietario" });
    setIsCreating(true);
    setRightOpen(false);
  }}
>
  Nuovo Proprietario
</button>

<button
  style={actionButtonStyle}
  onClick={() => {
    setSelectedTable("profili");
    setSelectedItem({ ruolo: "bartender" });
    setIsCreating(true);
    setRightOpen(false);
  }}
>
  Nuovo Bartender
</button>
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

function FieldWrap({ label, children }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 14, color: "#f5a623", fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

const pageStyle: CSSProperties = {
  background: "#020617",
  minHeight: "100vh",
  color: "white",
  padding: "76px 22px 24px",
  position: "relative",
};

const leftButtonStyle: CSSProperties = {
  position: "fixed",
  top: 86,
  left: 16,
  zIndex: 50,
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "none",
  background: "#111827",
  color: "#f59e0b",
  fontSize: 28,
  fontWeight: 700,
};

const rightButtonStyle: CSSProperties = {
  ...leftButtonStyle,
  left: "auto",
  right: 16,
};

const titleBoxStyle: CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1f2937",
  padding: "16px 8px",
  textAlign: "center",
  marginBottom: 18,
};

const titleStyle: CSSProperties = {
  color: "#f59e0b",
  margin: 0,
  fontSize: 24,
};

const kpiGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const boxStyle: CSSProperties = {
  background: "#111827",
  borderRadius: 12,
  padding: "14px 6px",
  textAlign: "center",
};

const boxTitleStyle: CSSProperties = {
  color: "#f59e0b",
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 4,
};

const boxValueStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 26,
};

const editorBoxStyle: CSSProperties = {
  background: "#0f172a",
  padding: "18px 10px 28px",
  borderRadius: 16,
  marginTop: 18,
  border: "1px solid #1e293b",
  boxShadow: "0 2px 12px #0002",
};

const editorTitleStyle: CSSProperties = {
  fontSize: 20,
  marginBottom: 18,
  color: "#f59e0b",
  textAlign: "center",
  fontWeight: 700,
};

const inputMobileStyle: CSSProperties = {
  width: "100%",
  background: "#020617",
  color: "white",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: "12px",
  fontSize: 15,
};

const badgeOkStyle: CSSProperties = {
  background: "#064e3b",
  color: "#d1fae5",
  borderRadius: 10,
  padding: 8,
  marginBottom: 14,
  textAlign: "center",
};

const badgeErrorStyle: CSSProperties = {
  background: "#7f1d1d",
  color: "#fee2e2",
  borderRadius: 10,
  padding: 8,
  marginBottom: 14,
  textAlign: "center",
};

const btnSaveStyle: CSSProperties = {
  flex: 1,
  background: "#f59e0b",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: "13px 0",
  fontWeight: 700,
  fontSize: 16,
};

const btnDeleteStyle: CSSProperties = {
  flex: 1,
  background: "#7f1d1d",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "13px 0",
  fontWeight: 700,
  fontSize: 16,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 90,
};

const leftMenuStyle: CSSProperties = {
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

const rightMenuStyle: CSSProperties = {
  ...leftMenuStyle,
  left: "auto",
  right: 0,
};

const closeButtonStyle: CSSProperties = {
  background: "transparent",
  color: "#f59e0b",
  border: "none",
  fontSize: 28,
  marginBottom: 20,
};

const selectStyle: CSSProperties = {
  width: "100%",
  background: "#020617",
  color: "white",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "14px 12px",
  fontSize: 16,
};

const actionButtonStyle: CSSProperties = {
  width: "100%",
  background: "#f59e0b",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  fontWeight: 700,
};