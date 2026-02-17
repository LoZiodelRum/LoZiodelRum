import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { 
  MapPin, ChevronLeft, Loader2, RefreshCw, 
  CheckCircle, Clock, Edit3, Trash2, X, Eye, Check, Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TABELLA = "Locali";

export default function AdminDashboard() {
  const [locali, setLocali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from(TABELLA).select("*");
      if (error) throw error;
      setLocali(data || []);
    } catch (err) {
      console.error("Errore Database:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase.from(TABELLA).update({ approvato: true, status: "approved" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Locale approvato!" });
      setSelected(null);
      loadData();
    } catch (err) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questo locale?")) return;
    try {
      const { error } = await supabase.from(TABELLA).delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Locale eliminato" });
      setSelected(null);
      loadData();
    } catch (err) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    }
  };

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
            <Link to={createPageUrl("Dashboard")} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
              <ChevronLeft />
            </Link>
            <h1 className="text-2xl font-bold text-amber-500 tracking-tight">Admin Cloud</h1>
          </div>
          <Button onClick={loadData} variant="outline" className="border-stone-800"><RefreshCw className="w-4 h-4 mr-2" /> Sync</Button>
        </div>

        {/* --- SCHEDA DI REVISIONE INTEGRATA (Bypassa AdminCard) --- */}
        {selected && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-stone-900 w-full max-w-2xl rounded-3xl border border-stone-800 p-8 shadow-2xl relative">
              <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 bg-stone-800 rounded-full hover:bg-stone-700">
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                {selected.image_url && (
                  <img src={(selected.image_url || "").split(",")[0]?.trim()} alt="Cover" className="w-full h-48 object-cover rounded-2xl border border-stone-800" />
                )}
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selected.nome}</h2>
                  <p className="text-amber-500 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4" /> {selected.indirizzo}, {selected.citta}
                  </p>
                </div>
                <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                  <h3 className="text-xs uppercase text-stone-500 font-bold mb-2">Descrizione</h3>
                  <p className="text-stone-300 text-sm leading-relaxed">{selected.descrizione || "Nessuna descrizione fornita."}</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => handleApprove(selected.id)} className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-lg font-bold">
                    <Check className="mr-2" /> Approva Locale
                  </Button>
                  <Button onClick={() => handleDelete(selected.id)} variant="destructive" className="h-14 px-6">
                    <Trash />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA RICHIESTE */}
        <section className="mb-12">
          <h2 className="text-amber-500 font-bold mb-6 flex items-center gap-2 text-xl"><Clock /> In Attesa ({inAttesa.length})</h2>
          <div className="grid gap-4">
            {inAttesa.map(l => (
              <div key={l.id} className="p-5 bg-stone-900 border border-amber-500/20 rounded-2xl flex justify-between items-center group hover:border-amber-500/50 transition-all shadow-lg">
                <div onClick={() => setSelected(l)} className="flex-1 cursor-pointer">
                  <div className="font-bold text-xl group-hover:text-amber-400 transition-colors">{l.nome}</div>
                  <div className="text-stone-500 text-sm">{l.citta}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(l)}><Eye className="mr-2 h-4 w-4" /> Vedi</Button>
                  <Button size="sm" className="bg-green-600" onClick={() => handleApprove(l.id)}>Approva</Button>
                </div>
              </div>
            ))}
            {inAttesa.length === 0 && <p className="text-stone-700 italic">Nessun locale da revisionare.</p>}
          </div>
        </section>

        {/* LISTA ONLINE */}
        <section>
          <h2 className="text-green-500 font-bold mb-6 flex items-center gap-2 text-xl"><CheckCircle /> Online ({online.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {online.map(l => (
              <div key={l.id} className="p-4 bg-stone-900/40 border border-stone-800 rounded-2xl flex justify-between items-center hover:bg-stone-900 transition-all">
                <span className="font-medium text-stone-300 cursor-pointer" onClick={() => setSelected(l)}>{l.nome}</span>
                <div className="flex gap-2">
                  <Link to={createPageUrl(`EditVenue?id=${l.id}`)}>
                    <Button size="icon" variant="ghost" className="text-blue-400"><Edit3 className="w-4 h-4" /></Button>
                  </Link>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}