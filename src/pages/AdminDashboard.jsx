import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { createPageUrl } from "@/utils";
import { 
  MapPin, User, Wine, ChevronLeft, Loader2, 
  RefreshCw, CheckCircle, Clock, Edit3, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import { toast } from "@/components/ui/use-toast";

const TABELLA = "Locali";

export default function AdminDashboard() {
  const [locali, setLocali] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // Per aprire la scheda dettaglio

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Carica Locali
      const { data: venues, error: vError } = await supabase.from(TABELLA).select("*");
      if (vError) throw vError;
      setLocali(venues || []);

      // 2. Carica Utenti/Bartender in attesa
      const { data: users, error: uError } = await supabase.from("app_users").select("*").eq("status", "pending");
      if (!uError) setPendingUsers(users || []);

    } catch (err) {
      toast({ title: "Errore caricamento", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id) => {
    const { error } = await supabase.from(TABELLA).update({ approvato: true, status: 'approved' }).eq('id', id);
    if (!error) {
      toast({ title: "Approvato!" });
      loadData();
    }
  };

  // Funzione per mappare i dati per AdminCard e EditVenue
  const mapItem = (l) => ({
    id: l.id,
    nome: l.nome,
    citta: l.citta,
    indirizzo: l.indirizzo,
    descrizione: l.descrizione,
    image_url: l.image_url,
    latitudine: l.latitudine,
    longitudine: l.longitudine,
    status: l.status,
    approvato: l.approvato
  });

  const inAttesa = locali.filter(l => l.approvato !== true);
  const online = locali.filter(l => l.approvato === true);

  if (loading) return (
    <div className="h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")} className="p-2 hover:bg-stone-800 rounded-full">
              <ChevronLeft />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Console</h1>
          </div>
          <Button onClick={loadData} variant="outline" size="sm" className="border-stone-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Sync
          </Button>
        </div>

        {/* SE VISUALIZZO UN DETTAGLIO (AdminCard) */}
        {selected ? (
          <div className="space-y-4">
            <AdminCard 
              type={selected.type} 
              item={selected.item} 
              onClose={() => setSelected(null)} 
              onApprove={() => { setSelected(null); loadData(); }}
              onDelete={() => { setSelected(null); loadData(); }}
            />
            <Button variant="ghost" onClick={() => setSelected(null)} className="w-full text-stone-500">
              Chiudi e torna alla lista
            </Button>
          </div>
        ) : (
          <div className="grid gap-8">
            
            {/* SEZIONE: NUOVI LOCALI (Il Cantiere apparirà qui) */}
            <section>
              <h2 className="text-amber-500 font-bold flex items-center gap-2 mb-4 text-lg">
                <Clock className="w-5 h-5" /> Da Revisionare ({inAttesa.length})
              </h2>
              <div className="grid gap-3">
                {inAttesa.map(l => (
                  <div key={l.id} className="bg-stone-900 border border-amber-500/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-500/50 transition-all cursor-pointer" onClick={() => setSelected({ type: 'venue', item: mapItem(l) })}>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{l.nome || "Senza Nome"}</h3>
                      <p className="text-stone-400 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.citta}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto flex-wrap">
                      <Link to={createPageUrl(`EditVenue?id=${l.id}`)} onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="border-stone-600 text-stone-300 hover:bg-stone-800">
                          <Edit3 className="w-4 h-4 mr-1" /> Modifica
                        </Button>
                      </Link>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); handleApprove(l.id); }}>Approva</Button>
                      <Button variant="destructive" size="sm" onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (confirm("Eliminare questo locale?")) { await supabase.from(TABELLA).delete().eq('id', l.id); loadData(); }
                      }}>
                        <Trash2 className="w-4 h-4 mr-1" /> Elimina
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SEZIONE: LOCALI ONLINE */}
            <section>
              <h2 className="text-green-500 font-bold flex items-center gap-2 mb-4 text-lg">
                <CheckCircle className="w-5 h-5" /> Online su App ({online.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {online.map(l => (
                  <div key={l.id} className="group bg-stone-900/40 border border-stone-800 p-4 rounded-xl flex justify-between items-center hover:bg-stone-900 transition-colors cursor-pointer" onClick={() => setSelected({ type: 'venue', item: mapItem(l) })}>
                    <div className="flex-1">
                      <span className="font-medium">{l.nome}</span>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest">{l.citta}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`EditVenue?id=${l.id}`)} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="border-stone-600 text-stone-300 hover:bg-stone-800">
                          <Edit3 className="w-4 h-4 mr-1" /> Modifica
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (confirm("Eliminare questo locale?")) { await supabase.from(TABELLA).delete().eq('id', l.id); loadData(); }
                      }}>
                        <Trash2 className="w-4 h-4 mr-1" /> Rimuovi
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SEZIONE: UTENTI/BARTENDER */}
            <section className="border-t border-stone-800 pt-8">
              <h2 className="text-stone-300 font-bold flex items-center gap-2 mb-4">
                <User className="w-5 h-5" /> Utenti in attesa ({pendingUsers.length})
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-4">
                {pendingUsers.map(u => (
                  <div key={u.id} className="min-w-[200px] bg-stone-900 p-3 rounded-lg border border-stone-800 cursor-pointer" onClick={() => setSelected({ type: u.role === 'bartender' ? 'bartender' : 'user', item: u })}>
                    <p className="font-bold text-sm truncate">{u.full_name || u.name}</p>
                    <p className="text-[10px] text-amber-500 uppercase">{u.role}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}