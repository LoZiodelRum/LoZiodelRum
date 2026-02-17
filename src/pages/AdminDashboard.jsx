/**
 * AdminDashboard – SOLO tabella Locali di Supabase.
 * Nessun dato locale. useState([]) vuoto. approvato dal DB.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useVenuesRealtime, useAppUsersRealtime } from "@/hooks/useSupabaseRealtime";
import { TABLE_APP_USERS } from "@/lib/supabaseTables";
import { MapPin, User, Wine, ChevronLeft, Loader2, AlertCircle, Edit3, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import { toast } from "@/components/ui/use-toast";

const TABELLA = "Locali";

function isApproved(row) {
  return row.approvato === true || row.approvato === "t" || String(row.status || "").toLowerCase() === "approved";
}

export default function AdminDashboard() {
  const [locali, setLocali] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured?.() || !supabase) {
      setLoadError("Supabase non configurato");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.from(TABELLA).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setLocali(Array.isArray(data) ? data : []);

      const { data: regs, error: errRegs } = await supabase.from(TABLE_APP_USERS).select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (!errRegs) setPendingRegistrations(Array.isArray(regs) ? regs : []);
    } catch (err) {
      const msg = err?.message || err?.code || "Errore connessione Supabase";
      setLoadError(msg);
      setLocali([]);
      console.error("[AdminDashboard] Errore Supabase:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useVenuesRealtime(load, load, load);
  useAppUsersRealtime(null, load, load, load);

  const handleApprove = async (row) => {
    setUpdatingId(row.id);
    try {
      const { error } = await supabase.from(TABELLA).update({ approvato: true, status: "approved" }).eq("id", row.id);
      if (error) throw error;
      toast({ title: "Locale approvato" });
      await load();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Eliminare definitivamente "${row.nome ?? "questo locale"}"?`)) return;
    setUpdatingId(row.id);
    try {
      const { error } = await supabase.from(TABELLA).delete().eq("id", row.id);
      if (error) throw error;
      toast({ title: "Locale eliminato" });
      setSelected(null);
      await load();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveFromCard = async (item, extra = {}) => {
    try {
      if (selected?.type === "venue") {
        const payload = { approvato: true, status: "approved" };
        if (extra.latitude != null) payload.latitudine = extra.latitude;
        if (extra.longitude != null) payload.longitudine = extra.longitude;
        const { error } = await supabase.from(TABELLA).update(payload).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Locale approvato" });
      } else {
        const { error } = await supabase.from(TABLE_APP_USERS).update({ status: "approved" }).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Profilo approvato" });
      }
      setSelected(null);
      await load();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  const handleDeleteFromCard = async (item) => {
    if (!confirm("Eliminare definitivamente questo record?")) return;
    try {
      if (selected?.type === "venue") {
        const { error } = await supabase.from(TABELLA).delete().eq("id", item.id);
        if (error) throw error;
        toast({ title: "Locale eliminato" });
      } else if (selected?.type === "bartender" || selected?.type === "user") {
        const { error } = await supabase.from(TABLE_APP_USERS).delete().eq("id", item.id);
        if (error) throw error;
        toast({ title: "Utente eliminato" });
      }
      setSelected(null);
      await load();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  const inAttesa = locali.filter((r) => !isApproved(r));
  const approvati = locali.filter(isApproved);
  const ordinati = [...inAttesa, ...approvati];
  const pendingBartenders = pendingRegistrations.filter((r) => r.role === "bartender");
  const pendingUsers = pendingRegistrations.filter((r) => r.role === "user" || r.role === "proprietario");

  const mapItem = (row) => ({
    id: String(row.id),
    nome: row.nome ?? "",
    citta: row.citta ?? "",
    indirizzo: row.indirizzo ?? "",
    name: row.nome ?? "",
    city: row.citta ?? "",
    address: row.indirizzo ?? "",
    description: row.descrizione ?? "",
    cover_image: row.image_url ?? "",
    video_url: row.video_url ?? null,
    latitudine: row.latitudine != null ? parseFloat(row.latitudine) : null,
    longitudine: row.longitudine != null ? parseFloat(row.longitudine) : null,
    latitude: row.latitudine != null ? parseFloat(row.latitudine) : null,
    longitude: row.longitudine != null ? parseFloat(row.longitudine) : null,
  });

  if (!isSupabaseConfigured?.()) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Supabase non configurato</h2>
          <p className="text-stone-500">Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-8 pb-28 lg:pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 hover:bg-stone-800 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin – Verifica profili</h1>
            <p className="text-stone-500">Solo tabella Locali · Supabase</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="ml-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Aggiorna
          </Button>
        </div>

        {loadError && (
          <div className="mb-6 p-6 rounded-2xl bg-red-500/20 border-2 border-red-500/60 text-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">Errore di connessione a Supabase</p>
                <p className="mt-2 font-mono text-sm bg-stone-900/50 p-3 rounded">{loadError}</p>
                <Button variant="outline" size="sm" onClick={load} className="mt-4 border-red-500/50 text-red-200 hover:bg-red-500/20">
                  Riprova
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : selected ? (
          <div className="space-y-4">
            <AdminCard type={selected.type} item={selected.item} onApprove={handleApproveFromCard} onDelete={handleDeleteFromCard} onClose={() => setSelected(null)} />
            <Button variant="outline" onClick={() => setSelected(null)}>Torna alla lista</Button>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Locali
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                In attesa: {inAttesa.length} · Approvati: {approvati.length}
              </p>
              {locali.length === 0 ? (
                <p className="text-stone-500 py-6">
                  {loadError ? "Impossibile caricare. Controlla l'errore sopra." : "Nessun locale nella tabella Locali di Supabase."}
                </p>
              ) : (
                <div className="space-y-3">
                  {ordinati.map((row) => {
                    const approved = isApproved(row);
                    const d = mapItem(row);
                    return (
                      <div key={row.id} className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/50 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{row.nome ?? "—"}</p>
                          <p className="text-sm text-stone-500">{row.citta ?? "—"}</p>
                          {row.indirizzo && <p className="text-xs text-stone-500 truncate">{row.indirizzo}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${approved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                            {approved ? "Approvato" : "In attesa"}
                          </span>
                          {!approved && (
                            <button onClick={() => handleApprove(row)} disabled={updatingId === row.id} className="px-2 py-1 rounded text-xs border border-green-500/50 text-green-400 hover:bg-green-500/10">
                              {updatingId === row.id ? "..." : "Approva"}
                            </button>
                          )}
                          <Link to={createPageUrl(`EditVenue?id=${row.id}`)} state={{ venue: d, fromCloud: true }}>
                            <Button size="sm" variant="outline" className="border-stone-600"><Edit3 className="w-3.5 h-3.5 mr-1" />Modifica</Button>
                          </Link>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(row)} disabled={updatingId === row.id}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" />Rifiuta
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSelected({ type: "venue", item: d })} className="border-stone-600">Dettagli</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wine className="w-5 h-5 text-amber-500" />Bartender in attesa ({pendingBartenders.length})</h2>
              {pendingBartenders.length === 0 ? <p className="text-stone-500">Nessun bartender in attesa</p> : (
                <ul className="space-y-2">
                  {pendingBartenders.map((r) => (
                    <li key={r.id}>
                      <button onClick={() => setSelected({ type: "bartender", item: r })} className="w-full text-left p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/30 transition-colors">
                        <span className="font-medium">{r.full_name || `${r.name || ""} ${r.surname || ""}`.trim()}</span>
                        <span className="text-stone-500 text-sm ml-2">{r.custom_venue_name || r.venue_name || ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-amber-500" />Utenti in attesa ({pendingUsers.length})</h2>
              {pendingUsers.length === 0 ? <p className="text-stone-500">Nessun utente in attesa</p> : (
                <ul className="space-y-2">
                  {pendingUsers.map((r) => (
                    <li key={r.id}>
                      <button onClick={() => setSelected({ type: "user", item: r })} className="w-full text-left p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/30 transition-colors">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-stone-500 text-sm ml-2">{r.email || ""}</span>
                        <span className="text-stone-500 text-xs ml-2">({r.role})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
