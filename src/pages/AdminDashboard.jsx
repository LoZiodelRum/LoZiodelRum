import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [locali, setLocali] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    // Legge SOLO dalla tabella Locali di Supabase
    const { data, error } = await supabase.from("Locali").select("*");
    if (error) console.error("Errore:", error);
    setLocali(data || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  // FILTRI: Separazione netta tra approvati e non
  const inAttesa = locali.filter(l => l.approvato === false || l.approvato === null);
  const online = locali.filter(l => l.approvato === true);

  if (loading) return (
    <div className="h-screen bg-stone-950 flex items-center justify-center text-white">
      <Loader2 className="animate-spin mr-2" /> Caricamento dati reali...
    </div>
  );

  return (
    <div className="p-8 bg-stone-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-amber-500">Gestione Locali Real-Time</h1>
          <Button onClick={loadData} variant="outline" className="text-white border-white/20">
            <RefreshCw className="mr-2 h-4 w-4" /> Aggiorna da Cloud
          </Button>
        </div>

        {/* SEZIONE 1: NUOVI LOCALI (Qui apparirà IL CANTIERE) */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-amber-400">
            <Clock className="w-5 h-5" /> Da Revisionare ({inAttesa.length})
          </h2>
          <div className="space-y-3">
            {inAttesa.map(l => (
              <div key={l.id} className="p-5 bg-stone-900 border border-amber-500/20 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">{l.nome}</p>
                  <p className="text-stone-400 text-sm">{l.citta} - {l.indirizzo}</p>
                </div>
                <div className="flex gap-3">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={async () => {
                    await supabase.from("Locali").update({ approvato: true }).eq("id", l.id);
                    loadData();
                  }}>Approva</Button>
                  <Button variant="destructive" onClick={async () => {
                    if(confirm("Eliminare per sempre?")) {
                      await supabase.from("Locali").delete().eq("id", l.id);
                      loadData();
                    }
                  }}>Elimina</Button>
                </div>
              </div>
            ))}
            {inAttesa.length === 0 && <p className="text-stone-500 italic">Nessuna nuova richiesta.</p>}
          </div>
        </section>

        {/* SEZIONE 2: LOCALI GIÀ APPROVATI (Qui i 19 e La Sultana) */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-green-400">
            <CheckCircle className="w-5 h-5" /> Locali Online ({online.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {online.map(l => (
              <div key={l.id} className="p-3 bg-stone-900/40 border border-stone-800 rounded-lg flex justify-between items-center">
                <span className="text-stone-300">{l.nome}</span>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={async () => {
                    if(confirm("Spostare di nuovo in REVISIONE?")) {
                      await supabase.from("Locali").update({ approvato: false }).eq("id", l.id);
                      loadData();
                    }
                  }}>Rimuovi</Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}