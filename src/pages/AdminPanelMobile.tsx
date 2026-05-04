import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export default function AdminPanelMobile() {
  const { loading, isAdmin } = useUser();

  const [kpi, setKpi] = useState({
    utenti: 0,
    locali: 0,
    drink: 0,
    articoli: 0,
  });

  const [utenti, setUtenti] = useState<any[]>([]);
  const [locali, setLocali] = useState<any[]>([]);
  const [cocktail, setCocktail] = useState<any[]>([]);
  const [articoli, setArticoli] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState("");

  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && isAdmin) {
      loadData();
    }

    if (!loading && !isAdmin) {
      setLoadingData(false);
    }
  }, [loading, isAdmin]);

  async function loadData() {
    try {
      setLoadingData(true);

      const { data: utentiData } = await supabase.from("Profili").select("*");
      const { data: localiData } = await supabase.from("Locali").select("*");
      const { data: cocktailData } = await supabase.from("cocktail").select("*");
      const { data: articoliData } = await supabase.from("Articoli").select("*");

      setUtenti(utentiData || []);
      setLocali(localiData || []);
      setCocktail(cocktailData || []);
      setArticoli(articoliData || []);

      setKpi({
        utenti: utentiData?.length || 0,
        locali: localiData?.length || 0,
        drink: cocktailData?.length || 0,
        articoli: articoliData?.length || 0,
      });
    } catch (err) {
      console.error("Errore loadData AdminPanelMobile:", err);
    } finally {
      setLoadingData(false);
    }
  }

  function openFirstEditor(table: string, data: any[]) {
    if (!Array.isArray(data) || data.length === 0) {
      setSelectedTable(table);
      setSelectedItem(null);
      return;
    }

    setSelectedTable(table);
    setSelectedItem(data[0]);
  }

  function getSelectedTitle(item: any) {
    if (!item) return "Nessun elemento trovato";

    return (
      item.nome ||
      item.name ||
      item.titolo ||
      item.title ||
      item.email ||
      item.username ||
      "Elemento selezionato"
    );
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Caricamento...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Accesso negato
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-6">
      <div className="bg-[#0f172a] border border-[#1f2937] px-4 py-6 mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#f59e0b]">
          Pannello di Controllo
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
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

        <Box
          titolo="DRINK"
          valore={kpi.drink}
          onClick={() => openFirstEditor("cocktail", cocktail)}
        />

        <Box
          titolo="ARTICOLI"
          valore={kpi.articoli}
          onClick={() => openFirstEditor("articoli", articoli)}
        />
      </div>

      {selectedTable && (
        <div className="mt-6 bg-[#0f172a] border border-[#1f2937] p-6 rounded-2xl">
          <p className="text-sm font-bold text-[#f59e0b] mb-3 uppercase">
            {selectedTable}
          </p>

          <p className="text-2xl font-bold text-white">
            {getSelectedTitle(selectedItem)}
          </p>
        </div>
      )}
    </div>
  );
}

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
    <button
      type="button"
      onClick={onClick}
      className="bg-[#111827] rounded-2xl min-h-[105px] p-4 text-center shadow-md active:scale-95 transition"
    >
      <p className="text-[#f59e0b] text-base font-bold mb-2">{titolo}</p>
      <p className="text-4xl font-bold text-white">{valore}</p>
    </button>
  );
}