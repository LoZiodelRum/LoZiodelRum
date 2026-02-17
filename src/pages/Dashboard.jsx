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
  RefreshCw,
  Eye,
  Phone,
  Globe,
  Instagram,
  Clock,
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
import { removeFromImagesStorage } from "@/lib/supabaseStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function Dashboard() {
  const { user, getVenues, getArticles, getDrinks, getBartenders, getPendingBartenders, loadBartendersFromCloud, updateVenue, deleteVenue, deleteVenueCloud, setBartenderStatus, deleteBartender, exportData, importData, restoreReviewsFromSeed, isSupabaseConfigured, getPendingVenuesFromCloud, getPendingLocalVenues, approveVenueCloud, rejectVenueCloud, getPendingRegistrationsFromCloud, updateAppUserStatus, deleteAppUser } = useAppData();
  const allVenues = getVenues();
  const allArticles = getArticles();
  const allDrinks = getDrinks();
  const pendingVenues = getPendingLocalVenues?.() ?? [];
  const pendingBartenders = getPendingBartenders();
  const approvedBartenders = getBartenders("approved");
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [selectedDrinkId, setSelectedDrinkId] = useState("");
  const [selectedBartenderId, setSelectedBartenderId] = useState("");
  const [cloudPendingVenues, setCloudPendingVenues] = useState([]);
  const [loadingCloudPending, setLoadingCloudPending] = useState(false);
  const [cloudError, setCloudError] = useState(null);
  const [venueCoords, setVenueCoords] = useState({});
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPendingBartender, setSelectedPendingBartender] = useState(null);
  const [showBartenderDeleteConfirm, setShowBartenderDeleteConfirm] = useState(false);
  const [loadingBartenders, setLoadingBartenders] = useState(false);
  const [previewVenue, setPreviewVenue] = useState(null);
  const selectedArticle = selectedArticleId ? allArticles.find((a) => a.id === selectedArticleId) : null;
  const selectedDrink = selectedDrinkId ? allDrinks.find((d) => d.id === selectedDrinkId) : null;
  const selectedBartender = selectedBartenderId ? getBartenders().find((b) => b.id === selectedBartenderId) : null;
  const fileInputRef = useRef(null);
  const loadCloudPending = () => {
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

  const loadPendingRegistrations = () => {
    setLoadingRegistrations(true);
    getPendingRegistrationsFromCloud?.()
      .then((list) => setPendingRegistrations(list || []))
      .catch(() => setPendingRegistrations([]))
      .finally(() => setLoadingRegistrations(false));
  };

  useEffect(() => {
    loadCloudPending();
    loadPendingRegistrations();
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
      } catch {
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
        <div className="mb-8 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Amministratore</h1>
            <p className="text-stone-500">Gestisci i contenuti in attesa di approvazione</p>
          </div>
          <Link to="/admin">
            <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
              Verifica profili (Locali, Bartender, Utenti)
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-stone-700/50 rounded-xl">
                <MapPin className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{pendingVenues.length + cloudPendingVenues.length}</p>
                <p className="text-stone-500">Locali in attesa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nuovi iscritti (app_users pending) */}
        {getPendingRegistrationsFromCloud && (
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Nuovi iscritti ({pendingRegistrations.length})
              </h2>
              <Button size="sm" variant="outline" onClick={loadPendingRegistrations} disabled={loadingRegistrations}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingRegistrations ? "animate-spin" : ""}`} />
                Aggiorna
              </Button>
            </div>
            {loadingRegistrations ? (
              <div className="text-center py-8 text-stone-500">Caricamento...</div>
            ) : pendingRegistrations.length === 0 ? (
              <div className="text-center py-8 text-stone-500">Nessun nuovo iscritto in attesa</div>
            ) : (
              <>
                <div className="space-y-3">
                  {pendingRegistrations.map((r) => (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedRegistration(r)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedRegistration(r)}
                      className="flex items-center justify-between p-4 bg-stone-800/30 rounded-xl border border-stone-700/50 cursor-pointer hover:bg-stone-800/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-sm text-stone-500">{r.role_label || r.role} • {r.created_at ? new Date(r.created_at).toLocaleDateString("it-IT") : ""}</p>
                      </div>
                      <Eye className="w-5 h-5 text-stone-500" />
                    </div>
                  ))}
                </div>

                {/* Modal dettagli iscritto */}
              <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-stone-900 border-stone-700 rounded-2xl sm:rounded-2xl p-4 sm:p-6 w-[95vw] sm:w-full max-w-[calc(100vw-2rem)]">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-amber-500 text-xl">Scheda iscritto</DialogTitle>
                  </DialogHeader>
                  {selectedRegistration && (
                    <div className="space-y-4">
                      {/* Foto Profilo: immagine da bucket images o icona utente */}
                      <div className="flex justify-center">
                        {(selectedRegistration.image_url || selectedRegistration.photo) ? (
                          <div className="flex gap-2 flex-wrap justify-center">
                            {(typeof (selectedRegistration.image_url || selectedRegistration.photo) === "string"
                              ? (selectedRegistration.image_url || selectedRegistration.photo).split(",").map((u) => u.trim()).filter(Boolean)
                              : [selectedRegistration.image_url || selectedRegistration.photo]
                            ).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`${selectedRegistration.name} ${i + 1}`}
                                className="w-24 h-24 rounded-full object-cover border-2 border-stone-600"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center">
                            <User className="w-12 h-12 text-stone-500" />
                          </div>
                        )}
                      </div>
                      {/* Dati principali: Nome, Ruolo, Data iscrizione */}
                      <div className="text-center space-y-1 pb-4 border-b border-stone-700">
                        <p className="font-semibold text-lg text-stone-100">{selectedRegistration.full_name || selectedRegistration.name || "—"}</p>
                        <p className="text-amber-500">{(selectedRegistration.role_label || selectedRegistration.role) || "—"}</p>
                        <p className="text-sm text-stone-500">{selectedRegistration.created_at ? new Date(selectedRegistration.created_at).toLocaleString("it-IT") : ""}</p>
                      </div>
                      <div className="grid gap-2 text-sm">
                        {[
                          { label: "Nome", val: selectedRegistration.name },
                          { label: "Cognome", val: selectedRegistration.surname },
                          { label: "Nome completo", val: selectedRegistration.full_name },
                          { label: "Email", val: selectedRegistration.email },
                          { label: "Ruolo", val: selectedRegistration.role_label || selectedRegistration.role },
                          { label: "Città", val: selectedRegistration.home_city || selectedRegistration.city },
                          { label: "Locale", val: selectedRegistration.custom_venue_name || selectedRegistration.venue_name },
                          { label: "Specializzazione", val: selectedRegistration.specialization },
                          { label: "Anni di esperienza", val: selectedRegistration.years_experience },
                          { label: "Bio", val: selectedRegistration.bio },
                          { label: "Motivazione", val: selectedRegistration.motivation },
                          { label: "Filosofia", val: selectedRegistration.philosophy },
                          { label: "Distillati preferiti", val: selectedRegistration.distillati_preferiti },
                          { label: "Approccio alla degustazione", val: selectedRegistration.approccio_degustazione },
                          { label: "Consiglio per chi inizia", val: selectedRegistration.consiglio_inizio },
                          { label: "Signature drink / Selezioni", val: selectedRegistration.signature_drinks },
                          { label: "Percorso esperienze", val: selectedRegistration.percorso_esperienze },
                          { label: "Bio breve", val: selectedRegistration.bio_light },
                          { label: "Video", val: selectedRegistration.video_url },
                          { label: "Consenso linee editoriali", val: selectedRegistration.consent_linee_editoriali === true ? "Sì" : null },
                        ].filter(({ val }) => val != null && val !== "").map(({ label, val }) => (
                          <div key={label} className="flex gap-2">
                            <span className="text-stone-500 min-w-[120px]">{label}:</span>
                            <span className="text-stone-200 break-words">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-stone-700">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          onClick={async () => {
                            await updateAppUserStatus?.(selectedRegistration.id, "approved");
                            setSelectedRegistration(null);
                            loadPendingRegistrations();
                            toast.success("Iscritto approvato");
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approva
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 flex-1"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Conferma eliminazione */}
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-stone-900 border-stone-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sei sicuro di voler eliminare definitivamente questo iscritto?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        if (selectedRegistration) {
                          const urlsToRemove = [
                            selectedRegistration.image_url,
                            selectedRegistration.photo,
                            selectedRegistration.video_url,
                          ].filter(Boolean).join(",");
                          if (urlsToRemove) {
                            try {
                              await removeFromImagesStorage(urlsToRemove);
                            } catch (e) {
                              console.warn("[Dashboard] Rimozione file da storage fallita:", e);
                            }
                          }
                          await deleteAppUser?.(selectedRegistration.id);
                          setShowDeleteConfirm(false);
                          setSelectedRegistration(null);
                          loadPendingRegistrations();
                          toast.success("Iscritto eliminato");
                        }
                      }}
                    >
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </>
            )}
          </div>
        )}

        {/* Locali in attesa - unificato (locale + cloud) */}
        <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Locali in attesa
              </h2>
              <p className="text-stone-500 text-sm">Locali da questo dispositivo e da tablet/cellulare. Approva per renderli visibili a tutti.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 min-h-[44px]"
                onClick={loadCloudPending}
                disabled={loadingCloudPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingCloudPending ? "animate-spin" : ""}`} />
                Aggiorna
              </Button>
              {!isSupabaseConfigured() && pendingVenues.length > 0 && (
                <Button
                  variant="outline"
                  className="border-amber-500/50 text-amber-400 min-h-[44px]"
                  onClick={async () => {
                    const ok = await exportAsFile(pendingVenues, `locali-da-approvare-${new Date().toISOString().slice(0, 10)}.json`, {
                      title: "Locali da approvare",
                      onSuccess: () => toast.success("Condividi il file e importalo su desktop"),
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
          </div>

          {loadingCloudPending && pendingVenues.length === 0 ? (
            <div className="text-center py-12 text-stone-500">Caricamento...</div>
          ) : pendingVenues.length === 0 && cloudPendingVenues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-stone-500">Nessun locale in attesa</p>
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
                            <span>
                              {venue.city}
                              {venue.province ? ` (${venue.province})` : ""}
                              {venue.country ? `, ${venue.country}` : ""}
                            </span>
                          </div>
                          {venue.address && <p className="text-stone-400 text-sm mb-2">{venue.address}</p>}
                          {venue.phone && (
                            <p className="text-stone-400 text-sm flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {venue.phone}
                            </p>
                          )}
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
                      <div className="mb-4">
                        <p className="text-xs text-stone-500 mb-2">Inserisci le coordinate per mostrare il marker nella posizione esatta sulla mappa</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-stone-500">Latitudine</Label>
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
                            <Label className="text-xs text-stone-500">Longitudine</Label>
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
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="border-stone-600 text-stone-400 hover:bg-stone-800"
                          onClick={() => setPreviewVenue(venue)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Anteprima
                        </Button>
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
              {cloudPendingVenues.map((venue, index) => (
                <motion.div
                  key={`cloud-${venue.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (pendingVenues.length + index) * 0.05 }}
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
                            <span>
                              {venue.city}
                              {venue.province ? ` (${venue.province})` : ""}
                              {venue.country ? `, ${venue.country}` : ""}
                            </span>
                          </div>
                          {venue.address && <p className="text-stone-400 text-sm mb-2">{venue.address}</p>}
                          {venue.phone && (
                            <p className="text-stone-400 text-sm flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {venue.phone}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">In attesa</Badge>
                      </div>
                      {venue.description && <p className="text-stone-400 text-sm mb-4 line-clamp-2">{venue.description}</p>}
                      {venue.created_at && (
                        <p className="text-xs text-stone-500 mb-4">Inviato il {new Date(venue.created_at).toLocaleDateString("it-IT")}</p>
                      )}
                      <div className="mb-4">
                        <p className="text-xs text-stone-500 mb-2">Inserisci le coordinate per mostrare il marker nella posizione esatta sulla mappa</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-stone-500">Latitudine</Label>
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
                            <Label className="text-xs text-stone-500">Longitudine</Label>
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
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="border-stone-600 text-stone-400 hover:bg-stone-800"
                          onClick={() => setPreviewVenue(venue)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Anteprima
                        </Button>
                        <Button
                          onClick={async () => {
                            const lat = venueCoords[venue.id]?.latitude ?? venue.latitude;
                            const lng = venueCoords[venue.id]?.longitude ?? venue.longitude;
                            const extra = {};
                            if (lat != null && !isNaN(lat)) extra.latitude = lat;
                            if (lng != null && !isNaN(lng)) extra.longitude = lng;
                            await approveVenueCloud(venue.id, extra);
                            loadCloudPending();
                            toast.success("Locale approvato. Se hai inserito latitudine e longitudine, il marker apparirà sulla mappa.");
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

        {/* Dialog Anteprima locale */}
        <Dialog open={!!previewVenue} onOpenChange={(open) => !open && setPreviewVenue(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border-stone-800 text-stone-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-amber-400">
                Anteprima scheda locale – dati da Supabase
              </DialogTitle>
            </DialogHeader>
            {previewVenue && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <img
                    src={previewVenue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"}
                    alt={previewVenue.name}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1">{previewVenue.name}</h3>
                    <div className="flex items-center gap-2 text-stone-400 text-sm mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {previewVenue.city || "—"}
                        {previewVenue.province ? ` (${previewVenue.province})` : ""}
                        {previewVenue.country ? `, ${previewVenue.country}` : ""}
                      </span>
                    </div>
                    {previewVenue.address && (
                      <p className="text-stone-400 text-sm">{previewVenue.address}</p>
                    )}
                    {((previewVenue.categories?.length) || previewVenue.category || previewVenue.price_range) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(previewVenue.categories || (previewVenue.category ? [previewVenue.category] : [])).filter(Boolean).map((cat, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-stone-600 text-stone-400">
                            {CATEGORY_LABELS[cat] || cat}
                          </Badge>
                        ))}
                        {previewVenue.price_range && (
                          <Badge variant="outline" className="text-xs border-stone-600 text-stone-400">
                            {previewVenue.price_range}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {previewVenue.description && (
                  <div>
                    <p className="text-xs text-stone-500 font-medium mb-1">Descrizione</p>
                    <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">{previewVenue.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {previewVenue.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-amber-500" />
                      <a href={`tel:${previewVenue.phone}`} className="text-amber-400 hover:underline">{previewVenue.phone}</a>
                    </div>
                  )}
                  {previewVenue.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-amber-500" />
                      <a href={previewVenue.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline truncate">{previewVenue.website}</a>
                    </div>
                  )}
                  {previewVenue.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <Instagram className="w-4 h-4 text-amber-500" />
                      <a href={`https://instagram.com/${previewVenue.instagram}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">@{previewVenue.instagram}</a>
                    </div>
                  )}
                  {previewVenue.opening_hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-stone-300">{previewVenue.opening_hours}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {previewVenue.latitude != null && (
                    <div>
                      <p className="text-xs text-stone-500 mb-0.5">Latitudine</p>
                      <p className="text-sm text-stone-300">{previewVenue.latitude}</p>
                    </div>
                  )}
                  {previewVenue.longitude != null && (
                    <div>
                      <p className="text-xs text-stone-500 mb-0.5">Longitudine</p>
                      <p className="text-sm text-stone-300">{previewVenue.longitude}</p>
                    </div>
                  )}
                </div>
                {(previewVenue.created_at || previewVenue.created_date || previewVenue.created_by) && (
                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-800">
                    {(previewVenue.created_at || previewVenue.created_date) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(previewVenue.created_at || previewVenue.created_date).toLocaleString("it-IT")}
                      </div>
                    )}
                    {previewVenue.created_by && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {previewVenue.created_by}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Locali approvati: modifica o elimina */}
        <div className="mt-8 bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Modifica o elimina un locale
          </h2>
          {allVenues.length === 0 ? (
            <p className="text-stone-500 py-6">Nessun locale approvato. I locali in attesa sono nella sezione sopra.</p>
          ) : (
            <div className="space-y-3">
              {allVenues.map((venue) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50"
                >
                  <div>
                    <p className="font-semibold">{venue.name}</p>
                    <p className="text-sm text-stone-500">
                      {venue.city}
                      {venue.province ? ` (${venue.province})` : ""}
                      {venue.country ? `, ${venue.country}` : ""}
                    </p>
                    {venue.address && <p className="text-xs text-stone-500 mt-0.5">{venue.address}</p>}
                    {(venue.categories?.length || venue.category) && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        {(venue.categories || [venue.category]).filter(Boolean).map((c) => CATEGORY_LABELS[c] || c).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl(`EditVenue?id=${venue.id}`)}>
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
                      onClick={async () => {
                        if (!confirm(`Eliminare "${venue.name}"?`)) return;
                        if (venue.supabase_id && isSupabaseConfigured()) {
                          await deleteVenueCloud(venue.supabase_id);
                          toast.success("Locale eliminato");
                        } else {
                          deleteVenue(venue.id);
                          toast.success("Locale eliminato");
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Elimina
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BartenderIcon className="w-5 h-5 text-amber-500" />
              Bartender
            </h2>
            {isSupabaseConfigured() && (
              <Button size="sm" variant="outline" onClick={async () => { setLoadingBartenders(true); await loadBartendersFromCloud?.(); setLoadingBartenders(false); toast.success("Bartender aggiornati"); }} disabled={loadingBartenders} className="border-stone-600">
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingBartenders ? "animate-spin" : ""}`} />
                Aggiorna
              </Button>
            )}
          </div>
          {pendingBartenders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-400 mb-3">In attesa di approvazione</h3>
              <div className="space-y-3">
                {pendingBartenders.map((b) => (
                  <div
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPendingBartender(b)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedPendingBartender(b)}
                    className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-stone-800/30 border border-stone-700/50 cursor-pointer hover:bg-stone-800/50 transition-colors"
                  >
                    {b.photo || b.image_url ? (
                      <img src={(b.photo || b.image_url)?.split?.(",")?.[0]?.trim() || b.photo || b.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <BartenderIcon className="w-7 h-7 text-amber-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{b.name} {b.surname}</p>
                      <p className="text-sm text-stone-500">{b.specialization || b.city ? [b.specialization, b.city].filter(Boolean).join(" · ") : "-"}</p>
                    </div>
                    <Eye className="w-5 h-5 text-stone-500" />
                  </div>
                ))}
              </div>

              {/* Modal scheda bartender in attesa */}
              <Dialog open={!!selectedPendingBartender} onOpenChange={(open) => !open && (setSelectedPendingBartender(null), setShowBartenderDeleteConfirm(false))}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-stone-900 border-stone-700">
                  <DialogHeader>
                    <DialogTitle className="text-amber-500">Scheda bartender</DialogTitle>
                  </DialogHeader>
                  {selectedPendingBartender && (
                    <div className="space-y-4">
                      {(selectedPendingBartender.photo || selectedPendingBartender.image_url) && (
                        <div className="flex justify-center gap-2 flex-wrap">
                          {(typeof (selectedPendingBartender.photo || selectedPendingBartender.image_url) === "string"
                            ? (selectedPendingBartender.photo || selectedPendingBartender.image_url).split(",").map((u) => u.trim()).filter(Boolean)
                            : [selectedPendingBartender.photo || selectedPendingBartender.image_url]
                          ).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-stone-600" />
                          ))}
                        </div>
                      )}
                      <div className="grid gap-2 text-sm">
                        {[
                          { label: "Nome", val: selectedPendingBartender.name },
                          { label: "Cognome", val: selectedPendingBartender.surname },
                          { label: "Città", val: selectedPendingBartender.city },
                          { label: "Locale", val: selectedPendingBartender.venue_name },
                          { label: "Specializzazione", val: selectedPendingBartender.specialization },
                          { label: "Anni di esperienza", val: selectedPendingBartender.years_experience },
                          { label: "Bio", val: selectedPendingBartender.bio },
                          { label: "Motivazione", val: selectedPendingBartender.motivation },
                          { label: "Filosofia", val: selectedPendingBartender.philosophy },
                          { label: "Distillati preferiti", val: selectedPendingBartender.distillati_preferiti },
                          { label: "Approccio alla degustazione", val: selectedPendingBartender.approccio_degustazione },
                          { label: "Consiglio per chi inizia", val: selectedPendingBartender.consiglio_inizio },
                          { label: "Signature drink / Selezioni", val: selectedPendingBartender.signature_drinks },
                          { label: "Percorso esperienze", val: selectedPendingBartender.percorso_esperienze },
                          { label: "Video", val: selectedPendingBartender.video_url },
                          { label: "Data registrazione", val: selectedPendingBartender.created_at ? new Date(selectedPendingBartender.created_at).toLocaleString("it-IT") : null },
                        ].filter(({ val }) => val != null && val !== "").map(({ label, val }) => (
                          <div key={label} className="flex gap-2">
                            <span className="text-stone-500 min-w-[120px]">{label}:</span>
                            <span className="text-stone-200 break-words">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-stone-700">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          onClick={async () => {
                            await setBartenderStatus(selectedPendingBartender.id, "approved");
                            setSelectedPendingBartender(null);
                            toast.success("Bartender approvato");
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approva
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 flex-1"
                          onClick={() => setShowBartenderDeleteConfirm(true)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <AlertDialog open={showBartenderDeleteConfirm} onOpenChange={setShowBartenderDeleteConfirm}>
                <AlertDialogContent className="bg-stone-900 border-stone-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sei sicuro di voler eliminare definitivamente questo bartender?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        if (selectedPendingBartender) {
                          await deleteBartender(selectedPendingBartender.id);
                          setShowBartenderDeleteConfirm(false);
                          setSelectedPendingBartender(null);
                          toast.success("Bartender eliminato");
                        }
                      }}
                    >
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
            <Button
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              onClick={() => {
                restoreReviewsFromSeed();
                toast.success("Recensioni ripristinate dal seed");
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Ripristina recensioni
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