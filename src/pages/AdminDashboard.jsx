import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { 
  MapPin, ChevronLeft, Loader2, RefreshCw, 
  CheckCircle, Clock, Edit3, Trash2, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import { toast } from "@/components/ui/use-toast";

const TABELLA = "Locali";

export default function AdminDashboard() {
  const [locali, setLocali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); 

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Carico i locali senza ordinamento temporale per evitare l'errore della colonna mancante
      const { data, error } = await supabase.from(TABELLA).select("*");
      if (error) throw error;
      setLocali(data || []);
    } catch (err) {
      console.error("Errore Supabase:", err);
      toast({ title: "Errore", description: "Impossibile caricare i dati", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Mappa i campi del DB per farli leggere correttamente alla AdminCard
  const mapItem = (l) => ({
    ...l,
    name: l.nome,
    city: l.citta,
    address: l.indirizzo,
    type: 'venue'
  });

  const inAttesa = locali.filter(l => l.approvato !== true);
  const online = locali.filter(l => l.approvato === true);

  if (loading) return (
    <div className="h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 border-b border-stone-800 pb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")} className="p-2 hover:bg-stone-800 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-amber-500">Gestione Locali Cloud</h1>
          </div>
          <Button onClick={loadData} variant="outline" className="border-stone-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Sincronizza
          </Button>
        </div>

        {/* --- SCHEDA DI VERIFICA (MODALE) --- */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-4xl bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl p-6 relative">
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 bg-stone-800 rounded-full hover:bg-stone-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
                <Info className="w-5 h-5" /> Revisione Locale: {selected.nome}
              </h2>

              <AdminCard 
                type="venue" 
                item={selected} 
                onClose={() => setSelected(null)} 
                onApprove={async () => {
                  await supabase.from(TABELLA).update({ approvato: true }).eq('id', selected.id);
                  setSelected(null);
                  loadData();
                }}
                onDelete={async () => {
                  if(confirm("Vuoi davvero RIFIUTARE ed eliminare questo locale?")) {
                    await supabase.from(TABELLA).delete().eq('id', selected.id);
                    setSelected(null);
                    loadData();
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* SEZIONE 1: DA REVISIONARE */}
        <section className="mb-12">
          <h2 className="text-amber-500 font-bold flex items-center gap-2 mb-6 text-xl tracking-tight">
            <Clock className="w-6 h-6" /> Da Revisionare ({inAttesa.length})
          </h2>
          <div className="grid gap-4">
            {inAttesa.map(l => (
              <div 
                key={l.id} 
                className="bg-stone-900/80 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-amber-500/5 transition-all cursor-pointer group"
                onClick={() => setSelected(mapItem(l))}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-xl group-hover:text-amber-400">{l.nome}</h3>
                  <p className="text-stone-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {l.indirizzo}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                    Clicca per revisionare
                  </span>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">Vedi Scheda</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEZIONE 2: ONLINE */}
        <section>
          <h2 className="text-green-500 font-bold flex items-center gap-2 mb-6 text-xl tracking-tight">
            <CheckCircle className="w-6 h-6" /> Loc