import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function AdminPanelMobile() {
  const { loading, isAdmin } = useUser();

  // KPI
  const [kpi, setKpi] = useState({
    utenti: 0,
    locali: 0,
    drink: 0,
    articoli: 0,
  });

  // dati base (serviranno dopo)
  const [utenti, setUtenti] = useState<any[]>([]);
  const [locali, setLocali] = useState<any[]>([]);

  // selezione
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState("");

  const [loadingData, setLoadingData] = useState(true);

  // LOAD DATI
  useEffect(() => {
    if (!loading && isAdmin) {
      loadData();
    }
  }, [loading]);

  async function loadData() {
    try {
      const { data: utentiData, count: utentiCount } = await supabase
        .from("Profili")
        .select("*", { count: "exact" });

      const { data: localiData, count: localiCount } = await supabase
        .from("Locali")
        .select("*", { count: "exact" });

      const { count: drinkCount } = await supabase
        .from("cocktail")
        .select("*", { count: "exact", head: true });

      const { count: articoliCount } = await supabase
        .from("Articoli")
        .select("*", { count: "exact", head: true });

      setUtenti(utentiData || []);
      setLocali(localiData || []);

      setKpi({
        utenti: utentiCount || 0,
        locali: localiCount || 0,
        drink: drinkCount || 0,
        articoli: articoliCount || 0,
      });
    } catch (err) {
      console.error("Errore loadData:", err);
    } finally {
      setLoadingData(false);
    }
  }

  // apertura editor (SEMPLICE E STABILE)
  function openFirstEditor(table: string, data: any[]) {
    if (!Array.isArray(data) || data.length === 0) return;

    setSelectedTable(table);
    setSelectedItem(data[0]);
  }

  // LOADING / BLOCCO ACCESSO
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Caricamento...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Accesso negato
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen bg-[#020617] text-white p-4">
      <h1 className="text-2xl font-bold text-[#f59e0b] mb-6">
        Pannello di Controllo
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4">
        <Box
          titolo="UTENTI"
          valore={kpi.utenti}
          onClick={() => openFirstEditor("profili", utenti)}
        />

        <Box
          titolo="LOCALI"
          valore={kpi.locali}
          onClick={() => openFirstEditor("locali", locali)}
        />

        <Box titolo="DRINK" valore={kpi.drink} />
        <Box titolo="ARTICOLI" valore={kpi.articoli} />
      </div>

      {/* EDITOR */}
      {selectedItem && (
        <div className="mt-6 bg-[#0f172a] p-4 rounded-xl">
          <p className="text-[#f59e0b] mb-2">
            Modifica: {selectedTable}
          </p>

          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(selectedItem, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// COMPONENTE BOX
function Box({
  titolo,
  valore,
  onClick,
}: {
  titolo: string;
  valore: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-[#0f172a] rounded-xl p-4 text-center shadow-md active:scale-95 transition cursor-pointer"
    >
      <p className="text-[#f59e0b] text-sm">{titolo}</p>
      <p className="text-2xl font-bold">{valore}</p>
    </div>
  );
}