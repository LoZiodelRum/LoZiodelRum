import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar,
  User,
  AlertCircle,
  Edit3,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Wine,
  Wine as BartenderIcon,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppData } from "@/lib/AppDataContext";
import { exportAsFile } from "@/utils/mobileExport";

export default function Dashboard() {
  const { user, getVenues, getArticles, getDrinks, getBartenders, getPendingBartenders, getVenueById, updateVenue, deleteVenue, setBartenderStatus, deleteBartender, exportData, importData, importVenuesFromMobile, isSupabaseConfigured, getPendingVenuesFromCloud, getPendingLocalVenues, approveVenueCloud, rejectVenueCloud } = useAppData();
  const allVenues = getVenues();
  const allArticles = getArticles();
  const allDrinks = getDrinks();
  const pendingVenues = getPendingLocalVenues?.() ?? [];
  const pendingBartenders = getPendingBartenders();
  const approvedBartenders = getBartenders("approved");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [selectedDrinkId, setSelectedDrinkId] = useState("");
  const [selectedBartenderId, setSelectedBartenderId] = useState("");
  const [cloudPendingVenues, setCloudPendingVenues] = useState([]);
  const [loadingCloudPending, setLoadingCloudPending] = useState(false);
  const [cloudError, setCloudError] = useState(null);
  const [venueCoords, setVenueCoords] = useState({});
  const selectedVenue = selectedVenueId ? allVenues.find((v) => v.id === selectedVenueId) : null;
  const selectedArticle = selectedArticleId ? allArticles.find((a) => a.id === selectedArticleId) : null;
  const selectedDrink = selectedDrinkId ? allDrinks.find((d) => d.id === selectedDrinkId) : null;
  const selectedBartender = selectedBartenderId ? getBartenders().find((b) => b.id === selectedBartenderId) : null;
  const fileInputRef = useRef(null);
  const mobileVenuesInputRef = useRef(null);

  const loadCloudPending = () => {
    if (!isSupabaseConfigured()) return;
    setLoadingCloudPending(true);
    setCloudError(null);
    getPendingVenuesFromCloud().then((list) => {
      setCloudPendingVenues(list);
      setLoadingCloudPending(false);
    }).catch((err) => {
      setLoadingCloudPending(false);
      setCloudError(err?.message || err?.code || "Errore connessione");
    });
  };

  useEffect(() => {
    loadCloudPending();
  }, []);

  const handleExport = async () => {
    const data = exportData();
    const ok = await exportAsFile(data, `loziodelrum-backup-${new Date().toISOString().slice(0, 10)}.json`, {
      title: "Backup Lo Zio del Rum",
      onSuccess: () => toast.success("Backup esportato"),
      onError: () => toast.error("Errore durante l'esportazione"),
    });
    if (!ok) toast.info("Esportazione annullata");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        importData(data);
        toast.success("Dati importati con successo");
      } catch (err) {
        toast.error("File non valido. Usa un backup JSON esportato da questa app.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const approveMutation = useMutation({
    mutationFn: ({ venueId, latitude, longitude }) => {
      const data = { verified: true };
      if (latitude != null) data.latitude = latitude;
      if (longitude != null) data.longitude = longitude;
      return updateVenue(venueId, data);
    },
    onSuccess: () => {
      toast.success('Locale approvato con successo');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (venueId) => deleteVenue(venueId),
    onSuccess: () => {
      toast.success('Locale rifiutato ed eliminato');
    },
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Accesso Negato</h2>
          <p className="text-stone-500">Solo gli amministratori possono accedere a questa pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pt-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Amministratore</h1>
          <p className="text-stone-500">Gestisci i contenuti in attesa di approvazione</p>
        </div>

        {/* Avviso: Supabase non configurato - Importa da cellulare */}
        {!isSupabaseConfigured() && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Importa locali dal cellulare (es. Madrè)
            </h3>
            <p className="text-stone-300 text-sm mb-3">
              Sul cellulare: accedi come admin → Dashboard → &quot;Esporta locali&quot;. Invia il file a te stesso (email, AirDrop, WhatsApp). Poi qui:
            </p>
            <input
              ref={mobileVenuesInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const data = JSON.parse(reader.result);
                    const venuesToImport = Array.isArray(data) ? data : data?.venues;
                    if (Array.isArray(venuesToImport) && venuesToImport.length > 0) {
                      importVenuesFromMobile?.(venuesToImport);
                      toast.success(`${venuesToImport.length} locale/i importato/i. Ora compaiono qui sotto.`);
                    } else {
                      toast.error("Nessun locale nel file. Esporta dal cellulare (Dashboard → Esporta locali).");
                    }
                  } catch {
                    toast.error("File non valido. Usa il JSON esportato dal cellulare.");
                  }
                  e.target.value = "";
                };
                reader.readAsText(file);
              }}
            />
            <div className="flex flex-wrap gap-3 mb-3">
              <Button
                onClick={() => mobileVenuesInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 min-h-[44px]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importa file
              </Button>
              <Button
                variant="outline"
                className="border-amber-500/50 text-amber-400 min-h-[44px]"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard?.readText?.();
                    if (!text) throw new Error("Appunti vuoti");
                    const data = JSON.parse(text);
                    const venuesToImport = Array.isArray(data) ? data : data?.venues;
                    if (Array.isArray(venuesToImport) && venuesToImport.length > 0) {
                      importVenuesFromMobile?.(venuesToImport);
                      toast.success(`${venuesToImport.length} locale/i importato/i da appunti`);
                    } else {
                      toast.error("Nessun locale negli appunti. Copia il JSON esportato dal cellulare.");
                    }
                  } catch (e) {
                    if (e?.name === "NotAllowedError") toast.error("Permesso appunti negato");
                    else toast.error("Appunti non validi. Copia il JSON dal cellulare.");
                  }
                }}
              >
                Incolla da appunti
              </Button>
            </div>
            <p className="text-stone-500 text-xs">
              Oppure configura Supabase per la sincronizzazione automatica (docs/CONFIGURAZIONE_SUPABASE.md)
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{pendingVenues.length + cloudPendingVenues.length}</p>
                <p className="text-stone-500">Locali in attesa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locali in attesa (dal tuo dispositivo) */}
        <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Locali in attesa (dal tuo dispositivo)
              </h2>
              <p className="text-stone-500 text-sm">I locali inseriti da questo dispositivo compaiono qui. Approvali per renderli visibili a tutti.</p>
            </div>
            {!isSupabaseConfigured() && pendingVenues.length > 0 && (
              <Button
                variant="outline"
                className="border-amber-500/50 text-amber-400 min-h-[44px]"
                onClick={async () => {
                  const ok = await exportAsFile(pendingVenues, `locali-da-approvare-${new Date().toISOString().slice(0, 10)}.json`, {
                    title: "Locali da approvare",
                    onSuccess: () => toast.success("Condividi il file (WhatsApp, email) e importalo su desktop"),
                    onError: () => toast.error("Errore esportazione"),
                  });
                  if (!ok) toast.info("Condivisione annullata");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta locali
              </Button>
            )}
          </div>

          {pendingVenues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-stone-500">Nessun locale in attesa da questo dispositivo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-stone-800/30 rounded-xl p-5 border border-stone-700/50"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"}
                      alt={venue.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                          <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{venue.city}, {venue.country}</span>
                          </div>
                          <p className="text-stone-400 text-sm mb-3">{venue.address}</p>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">In attesa</Badge>
                      </div>
                      {venue.description && (
                        <p className="text-stone-400 text-sm mb-4 line-clamp-2">{venue.description}</p>
                      )}
                      {(venue.created_date || venue.created_by) && (
                        <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
                          {venue.created_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(venue.created_date).toLocaleDateString('it-IT')}
                            </div>
                          )}
                          {venue.created_by && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {venue.created_by}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <Label className="text-xs text-stone-500">Latitudine (per mappa)</Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="45.4642"
                            value={venueCoords[venue.id]?.latitude ?? venue.latitude ?? ""}
                            onChange={(e) => setVenueCoords(prev => ({ ...prev, [venue.id]: { ...(prev[venue.id] || {}), latitude: parseFloat(e.target.value) || null } }))}
                            className="bg-stone-800/50 border-stone-700 h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-stone-500">Longitudine (per mappa)</Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="9.1900"
                            value={venueCoords[venue.id]?.longitude ?? venue.longitude ?? ""}
                            onChange={(e) => setVenueCoords(prev => ({ ...prev, [venue.id]: { ...(prev[venue.id] || {}), longitude: parseFloat(e.target.value) || null } }))}
                            className="bg-stone-800/50 border-stone-700 h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => approveMutation.mutate({ venueId: venue.id, latitude: venueCoords[venue.id]?.latitude ?? venue.latitude, longitude: venueCoords[venue.id]?.longitude ?? venue.longitude })}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approva
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            if (confirm('Sei sicuro di voler eliminare questo locale?')) {
                              rejectMutation.mutate(venue.id);
                            }
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rifiuta
                        </Button>
                        <Link to={createPageUrl(`EditVenue?id=${venue.id}`)}>
                          <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Modifica
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Locali inviati dal cellulare (Supabase) */}
        {isSupabaseConfigured() && (
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Locali inviati dal cellulare (da approvare)
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="border-stone-600 min-h-[44px]"
                onClick={loadCloudPending}
                disabled={loadingCloudPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingCloudPending ? "animate-spin" : ""}`} />
                Aggiorna
              </Button>
            </div>
            {cloudError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm font-medium mb-2">Errore: {cloudError}</p>
                <p className="text-stone-400 text-xs mb-2">Se la tabella venues_cloud non esiste, esegui: <code className="bg-stone-800 px-1 rounded">npm run supabase:setup</code></p>
                <p className="text-stone-500 text-xs">Con Supabase locale (127.0.0.1) i locali aggiunti dal cellulare non arrivano qui: il telefono non può connettersi. Usa Supabase cloud per produzione.</p>
              </div>
            )}
            {loadingCloudPending ? (
              <div className="text-center py-8 text-stone-500">Caricamento...</div>
            ) : cloudPendingVenues.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-stone-500">Nessun locale inviato dai cellulari</p>
                <p className="text-stone-500 text-sm mt-2">Quando un utente aggiunge un locale dall’app, qui comparirà in attesa di approvazione.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cloudPendingVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-stone-800/30 rounded-xl p-5 border border-stone-700/50"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"}
                        alt={venue.name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                            <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{venue.city}, {venue.country}</span>
                            </div>
                            {venue.address && <p className="text-stone-400 text-sm mb-3">{venue.address}</p>}
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Dal cellulare</Badge>
                        </div>
                        {venue.description && <p className="text-stone-400 text-sm mb-4 line-clamp-2">{venue.description}</p>}
                        {venue.created_at && (
                          <p className="text-xs text-stone-500 mb-4">Inviato il {new Date(venue.created_at).toLocaleDateString("it-IT")}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div>
                            <Label className="text-xs text-stone-500">Latitudine (per mappa)</Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder="45.4642"
                              value={venueCoords[venue.id]?.latitude ?? venue.latitude ?? ""}
                              onChange={(e) => setVenueCoords(prev => ({ ...prev, [venue.id]: { ...(prev[venue.id] || {}), latitude: parseFloat(e.target.value) || null } }))}
                              className="bg-stone-800/50 border-stone-700 h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-stone-500">Longitudine (per mappa)</Label>
                            <Input
                              type="number"
                              step="any"
                              placeholder="9.1900"
                              value={venueCoords[venue.id]?.longitude ?? venue.longitude ?? ""}
                              onChange={(e) => setVenueCoords(prev => ({ ...prev, [venue.id]: { ...(prev[venue.id] || {}), longitude: parseFloat(e.target.value) || null } }))}
                              className="bg-stone-800/50 border-stone-700 h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={async () => {
                              const lat = venueCoords[venue.id]?.latitude ?? venue.latitude;
                              const lng = venueCoords[venue.id]?.longitude ?? venue.longitude;
                              const extra = {};
                              if (lat != null && !isNaN(lat)) extra.latitude = lat;
                              if (lng != null && !isNaN(lng)) extra.longitude = lng;
                              await approveVenueCloud(venue.id, extra);
                              loadCloudPending();
                              toast.success("Locale approvato: ora è visibile a tutti");
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approva
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={async () => {
                              if (confirm("Rifiutare questo locale? Non sarà visibile in app.")) {
                                await rejectVenueCloud(venue.id);
                                loadCloudPending();
                                toast.success("Locale rifiutato");
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rifiuta
                          </Button>
                          <Link to={createPageUrl(`EditVenue?id=${venue.id}`)} state={{ venue, fromCloud: true }}>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Modifica
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scegli locale da modificare o eliminare */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Modifica o elimina un locale
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-400 mb-2 block">
                Seleziona il locale
              </label>
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger className="w-full max-w-md bg-stone-800/50 border-stone-700">
                  <SelectValue placeholder="Scegli un locale dall'elenco..." />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
                  {allVenues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} — {venue.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVenue && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{selectedVenue.name}</p>
                  <p className="text-sm text-stone-500">
                    {selectedVenue.city}
                    {selectedVenue.country ? `, ${selectedVenue.country}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl(`EditVenue?id=${selectedVenue.id}`)}>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Modifica
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm(`Eliminare "${selectedVenue.name}"?`)) {
                        deleteVenue(selectedVenue.id);
                        setSelectedVenueId("");
                        toast.success("Locale eliminato");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Elimina
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modifica articolo */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Modifica un articolo
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-400 mb-2 block">
                Seleziona l'articolo
              </label>
              <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
                <SelectTrigger className="w-full max-w-md bg-stone-800/50 border-stone-700">
                  <SelectValue placeholder="Scegli un articolo..." />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
                  {allArticles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title || "Senza titolo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedArticle && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold line-clamp-1">{selectedArticle.title}</p>
                  <p className="text-sm text-stone-500">{selectedArticle.category}</p>
                </div>
                <Link to={createPageUrl(`EditArticle?id=${selectedArticle.id}`)}>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Modifica
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modifica drink */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Wine className="w-5 h-5 text-amber-500" />
            Modifica un drink
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-400 mb-2 block">
                Seleziona il drink
              </label>
              <Select value={selectedDrinkId} onValueChange={setSelectedDrinkId}>
                <SelectTrigger className="w-full max-w-md bg-stone-800/50 border-stone-700">
                  <SelectValue placeholder="Scegli un drink..." />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
                  {allDrinks.map((drink) => (
                    <SelectItem key={drink.id} value={drink.id}>
                      {drink.name || "Senza nome"}
                      {drink.category ? ` — ${drink.category}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDrink && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{selectedDrink.name}</p>
                  <p className="text-sm text-stone-500">{selectedDrink.category}</p>
                </div>
                <Link to={createPageUrl(`EditDrink?id=${selectedDrink.id}`)}>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Modifica
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bartender */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BartenderIcon className="w-5 h-5 text-amber-500" />
            Bartender
          </h2>
          {pendingBartenders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-400 mb-3">In attesa di approvazione</h3>
              <div className="space-y-3">
                {pendingBartenders.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50">
                    {b.photo ? (
                      <img src={b.photo} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <BartenderIcon className="w-7 h-7 text-amber-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{b.name} {b.surname}</p>
                      <p className="text-sm text-stone-500">{b.specialization} · {b.city}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950" onClick={() => { setBartenderStatus(b.id, "approved"); toast.success("Bartender approvato"); }}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approva
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => { deleteBartender(b.id); toast.success("Rifiutato"); }}>
                        <XCircle className="w-4 h-4 mr-1" /> Rifiuta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link to={createPageUrl("AddBartender")}>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                <Edit3 className="w-4 h-4 mr-1" />
                Aggiungi bartender
              </Button>
            </Link>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-400 mb-2 block">Bartender approvati</label>
            <Select value={selectedBartenderId} onValueChange={setSelectedBartenderId}>
              <SelectTrigger className="w-full max-w-md bg-stone-800/50 border-stone-700">
                <SelectValue placeholder="Seleziona un bartender..." />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
                {approvedBartenders.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} {b.surname} — {b.specialization || b.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBartender && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-wrap items-center gap-4 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{selectedBartender.name} {selectedBartender.surname}</p>
                  <p className="text-sm text-stone-500">{selectedBartender.status === "featured" ? "In evidenza" : "Approvato"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-stone-600" onClick={() => { setBartenderStatus(selectedBartender.id, selectedBartender.status === "featured" ? "approved" : "featured"); toast.success(selectedBartender.status === "featured" ? "Rimosso da in evidenza" : "Impostato in evidenza"); }}>
                    {selectedBartender.status === "featured" ? "Rimuovi da in evidenza" : "In evidenza"}
                  </Button>
                  <Link to={createPageUrl(`EditBartender?id=${selectedBartender.id}`)}>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                      <Edit3 className="w-4 h-4 mr-1" /> Modifica
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Backup dati */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            Backup dati
          </h2>
          <p className="text-stone-500 text-sm mb-4">
            Esporta o importa locali, recensioni, articoli e drink. Utile per non perdere i dati o spostarli su un altro dispositivo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExport}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta backup (JSON)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importa backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}