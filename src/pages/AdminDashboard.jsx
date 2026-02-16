/**
 * AdminDashboard – Tre sezioni: Locali, Bartender, Utenti.
 * Query aggressiva: select('*') senza filtri per debug sync Invio/Database/Dashboard.
 *
 * RLS BYPASS (DEBUG): Se i dati non appaiono nonostante l'inserimento riuscito,
 * disattiva temporaneamente l'RLS su Supabase: Table Editor → venues_cloud / app_users → RLS → Disable.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { TABLE_VENUES, TABLE_APP_USERS } from "@/lib/supabaseTables";
import { MapPin, User, Wine, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import { toast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const {
    isSupabaseConfigured,
    getPendingVenuesFromCloud,
    getPendingRegistrationsFromCloud,
    approveVenueCloud,
    rejectVenueCloud,
    deleteVenueCloud,
    updateAppUserStatus,
    deleteBartender,
    deleteAppUser,
  } = useAppData();

  const [pendingVenues, setPendingVenues] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [venues, regs] = await Promise.all([
        getPendingVenuesFromCloud?.() ?? [],
        getPendingRegistrationsFromCloud?.() ?? [],
      ]);
      setPendingVenues(Array.isArray(venues) ? venues : []);
      setPendingRegistrations(Array.isArray(regs) ? regs : []);
    } catch (err) {
      console.error(err);
      setLoadError(err?.message || "Errore di connessione al database");
      toast({ title: "Errore caricamento", description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingBartenders = pendingRegistrations.filter((r) => r.role === "bartender");
  const pendingUsers = pendingRegistrations.filter((r) => r.role === "user" || r.role === "proprietario");

  const handleApprove = async (item) => {
    try {
      if (selected?.type === "venue") {
        await approveVenueCloud?.(item.id);
        toast({ title: "Locale approvato" });
      } else {
        await updateAppUserStatus?.(item.id, "approved");
        toast({ title: "Profilo approvato" });
      }
      setSelected(null);
      loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Eliminare definitivamente questo record?")) return;
    try {
      if (selected?.type === "venue") {
        await deleteVenueCloud?.(item.id);
        toast({ title: "Locale eliminato" });
      } else if (selected?.type === "bartender") {
        await deleteBartender?.(item.id);
        toast({ title: "Bartender eliminato" });
      } else {
        await deleteAppUser?.(item.id);
        toast({ title: "Utente eliminato" });
      }
      setSelected(null);
      loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  if (!isSupabaseConfigured?.()) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 p-8">
        <p className="text-amber-400">Supabase non configurato. Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-8 pb-28 lg:pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={createPageUrl("Dashboard")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin – Verifica profili</h1>
            <p className="text-stone-500">Locali, Bartender e Utenti in attesa</p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Errore di connessione</p>
              <p className="text-sm mt-1">{loadError}</p>
              <Button variant="outline" size="sm" onClick={loadData} className="mt-3 border-red-500/50 text-red-200 hover:bg-red-500/20">
                Riprova
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : selected ? (
          <div className="space-y-4">
            <AdminCard
              type={selected.type}
              item={selected.item}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onClose={() => setSelected(null)}
            />
            <Button variant="outline" onClick={() => setSelected(null)} className="border-stone-600">
              Torna alla lista
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Locali */}
            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Locali ({pendingVenues.length})
              </h2>
              {pendingVenues.length === 0 ? (
                <p className="text-stone-500">
                  {!loadError ? `Database collegato, ma la tabella ${TABLE_VENUES} è vuota` : "Nessun locale"}
                </p>
              ) : (
                <ul className="space-y-2">
                  {pendingVenues.map((v) => (
                    <li key={v.id}>
                      <button
                        onClick={() => setSelected({ type: "venue", item: v })}
                        className="w-full text-left p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/30 transition-colors"
                      >
                        <span className="font-medium">{v.name}</span>
                        <span className="text-stone-500 text-sm ml-2">
                          {v.city || ""} {v.country ? `, ${v.country}` : ""}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Bartender */}
            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-500" />
                Bartender ({pendingBartenders.length})
              </h2>
              {pendingBartenders.length === 0 ? (
                <p className="text-stone-500">
                  {!loadError && pendingRegistrations.length === 0
                    ? `Database collegato, ma la tabella ${TABLE_APP_USERS} è vuota`
                    : "Nessun bartender"}
                </p>
              ) : (
                <ul className="space-y-2">
                  {pendingBartenders.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => setSelected({ type: "bartender", item: r })}
                        className="w-full text-left p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/30 transition-colors"
                      >
                        <span className="font-medium">{r.name} {r.surname || ""}</span>
                        <span className="text-stone-500 text-sm ml-2">{r.custom_venue_name || r.venue_name || ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Utenti */}
            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Utenti ({pendingUsers.length})
              </h2>
              {pendingUsers.length === 0 ? (
                <p className="text-stone-500">
                  {!loadError && pendingRegistrations.length === 0
                    ? `Database collegato, ma la tabella ${TABLE_APP_USERS} è vuota`
                    : "Nessun utente"}
                </p>
              ) : (
                <ul className="space-y-2">
                  {pendingUsers.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => setSelected({ type: "user", item: r })}
                        className="w-full text-left p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/30 transition-colors"
                      >
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
