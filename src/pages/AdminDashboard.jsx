/**
 * AdminDashboard – ZERO dati statici. NESSUN import da venues.js o file locali.
 * Stato iniziale: useState([]). Fetch SOLO da supabase.from('Locali').select('*').
 * approvato: letto dal DB, mai sovrascritto.
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

const CATEGORY_LABELS = {
  cocktail_bar: "Cocktail Bar",
  rum_bar: "Rum Bar",
  wine_bar: "Wine Bar",
  speakeasy: "Speakeasy",
  distillery: "Distilleria",
  enoteca: "Enoteca",
  pub: "Pub",
  rooftop: "Rooftop Bar",
  hotel_bar: "Hotel Bar",
};

function rowToDisplay(row) {
  const catRaw = row.categoria || "cocktail_bar";
  const categories = catRaw ? catRaw.split(",").map((s) => s.trim()).filter(Boolean) : ["cocktail_bar"];
  return {
    id: String(row.id),
    name: row.nome || "",
    city: row.citta || "",
    province: row.provincia || "",
    country: row.paese || "Italia",
    address: row.indirizzo || "",
    description: row.descrizione || "",
    cover_image: row.image_url || "",
    video_url: row.video_url || null,
    category: categories[0] || "cocktail_bar",
    categories,
    price_range: row.price_range || "€€",
    phone: row.telefono || "",
    website: row.sito || "",
    instagram: row.instagram || "",
    opening_hours: row.orari || "",
    slug: row.slug || null,
    latitude: row.latitudine != null ? parseFloat(row.latitudine) : null,
    longitude: row.longitudine != null ? parseFloat(row.longitudine) : null,
    status: row.status || "pending",
    approvato: row.approvato === true,
    created_at: row.created_at,
  };
}

/** Legge approvato dal DB. NON sovrascrive. Se DB dice true → locale approvato. */
function isApprovedFromDb(row) {
  return row.approvato === true || String(row.status || "").toLowerCase() === "approved";
}

export default function AdminDashboard() {
  const [venues, setVenues] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured?.() || !supabase) return;
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.from("Locali").select("*").order("created_at", { ascending: false });

      if (error) {
        console.error("[AdminDashboard] Errore Supabase:", error);
        throw error;
      }

      console.log("DATI DA SUPABASE:", data);

      const list = Array.isArray(data) ? data : [];
      setVenues(list);

      const hasIlCantiere = list.some((r) => String(r.nome || "").toLowerCase().includes("cantiere"));
      if (!hasIlCantiere && list.length > 0) {
        console.error("[AdminDashboard] 'Il Cantiere' NON in lista. Totale:", list.length, "| Nomi:", list.map((r) => r.nome));
      }

      const { data: regs, error: errRegs } = await supabase.from(TABLE_APP_USERS).select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (!errRegs) setPendingRegistrations(Array.isArray(regs) ? regs : []);
    } catch (err) {
      const msg = err?.message || err?.code || "Errore di connessione";
      setLoadError(msg);
      console.error("[AdminDashboard] Errore caricamento:", err);
      toast({ title: "Errore caricamento", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useVenuesRealtime(loadData, loadData, loadData);
  useAppUsersRealtime(null, loadData, loadData, loadData);

  const handleStatusToggle = async (row) => {
    const currentlyApproved = isApprovedFromDb(row);
    const update = currentlyApproved ? { approvato: false, status: "pending" } : { approvato: true, status: "approved" };
    setUpdatingId(row.id);
    try {
      const { error } = await supabase.from("Locali").update(update).eq("id", row.id);
      if (error) throw error;
      toast({ title: update.status === "approved" ? "Locale approvato" : "Locale in attesa" });
      await loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteLocale = async (row) => {
    if (!confirm(`Eliminare definitivamente "${row.nome}"?`)) return;
    setUpdatingId(row.id);
    try {
      const { error } = await supabase.from("Locali").delete().eq("id", row.id);
      if (error) throw error;
      toast({ title: "Locale eliminato" });
      setSelected(null);
      await loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprove = async (item, extra = {}) => {
    try {
      if (selected?.type === "venue") {
        const update = {
          approvato: true,
          status: "approved",
          ...(extra.latitude != null && { latitudine: extra.latitude }),
          ...(extra.longitude != null && { longitudine: extra.longitude }),
        };
        const { error } = await supabase.from("Locali").update(update).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Locale approvato" });
      } else {
        const { error } = await supabase.from(TABLE_APP_USERS).update({ status: "approved" }).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Profilo approvato" });
      }
      setSelected(null);
      await loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Eliminare definitivamente questo record?")) return;
    try {
      if (selected?.type === "venue") {
        const { error } = await supabase.from("Locali").delete().eq("id", item.id);
        if (error) throw error;
        toast({ title: "Locale eliminato" });
      } else if (selected?.type === "bartender" || selected?.type === "user") {
        const { error } = await supabase.from(TABLE_APP_USERS).delete().eq("id", item.id);
        if (error) throw error;
        toast({ title: "Utente eliminato" });
      }
      setSelected(null);
      await loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  const pendingBartenders = pendingRegistrations.filter((r) => r.role === "bartender");
  const pendingUsers = pendingRegistrations.filter((r) => r.role === "user" || r.role === "proprietario");

  const daRevisionare = venues.filter((r) => !isApprovedFromDb(r));
  const approvati = venues.filter((r) => isApprovedFromDb(r));
  const venuesOrdinati = [...daRevisionare, ...approvati];

  if (!isSupabaseConfigured?.()) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 p-8">
        <p className="text-amber-400">Supabase non configurato.</p>
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
            <p className="text-stone-500">Solo Supabase · Tabella: Locali · Nessun dato statico</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="ml-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Aggiorna
          </Button>
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
          <div className="space-y-8">
            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Locali
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                In attesa: {daRevisionare.length} · Approvati: {approvati.length}
              </p>
              {venues.length === 0 ? (
                <p className="text-stone-500 py-4">
                  {!loadError ? "Nessun locale nella tabella Locali." : "Impossibile caricare."}
                </p>
              ) : (
                <div className="space-y-3">
                  {venuesOrdinati.map((row) => {
                    const d = rowToDisplay(row);
                    const isUpdating = updatingId === row.id;
                    const isApproved = isApprovedFromDb(row);
                    const catLabel = (d.categories || [d.category]).filter(Boolean).map((c) => CATEGORY_LABELS[c] || c).join(", ") || "—";
                    return (
                      <div
                        key={row.id}
                        className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/50 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{row.nome || "—"}</p>
                          <p className="text-sm text-stone-500">{row.citta || "—"}{row.provincia ? ` (${row.provincia})` : ""}</p>
                          {row.indirizzo && <p className="text-xs text-stone-500 truncate">{row.indirizzo}</p>}
                          <p className="text-xs text-stone-500 mt-0.5">{catLabel}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isApproved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {isApproved ? "Approvato" : "In attesa"}
                          </span>
                          <button
                            onClick={() => handleStatusToggle(row)}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded text-xs border border-stone-600 text-stone-300 hover:bg-stone-700"
                          >
                            {isUpdating ? "..." : isApproved ? "Annulla" : "Approva"}
                          </button>
                          <Link to={createPageUrl(`EditVenue?id=${row.id}`)} state={{ venue: d, fromCloud: true }}>
                            <Button size="sm" variant="outline" className="border-stone-600">
                              <Edit3 className="w-3.5 h-3.5 mr-1" />
                              Modifica
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteLocale(row)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Rifiuta / Elimina
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected({ type: "venue", item: d })}
                            className="border-stone-600"
                          >
                            Dettagli
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-500" />
                Bartender in attesa ({pendingBartenders.length})
              </h2>
              {pendingBartenders.length === 0 ? (
                <p className="text-stone-500">Nessun bartender in attesa</p>
              ) : (
                <ul className="space-y-2">
                  {pendingBartenders.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => setSelected({ type: "bartender", item: r })}
                        className="w-full text-left p-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/30 transition-colors"
                      >
                        <span className="font-medium">{r.full_name || `${r.name || ""} ${r.surname || ""}`.trim()}</span>
                        <span className="text-stone-500 text-sm ml-2">{r.custom_venue_name || r.venue_name || ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Utenti in attesa ({pendingUsers.length})
              </h2>
              {pendingUsers.length === 0 ? (
                <p className="text-stone-500">Nessun utente in attesa</p>
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
