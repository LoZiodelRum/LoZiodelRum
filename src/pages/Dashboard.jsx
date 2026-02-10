import { useState, useRef } from "react";
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
  Wine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function Dashboard() {
  const { user, getVenues, getArticles, getDrinks, updateVenue, deleteVenue, exportData, importData } = useAppData();
  const allVenues = getVenues();
  const allArticles = getArticles();
  const allDrinks = getDrinks();
  const pendingVenues = allVenues.filter((v) => !v.verified);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [selectedDrinkId, setSelectedDrinkId] = useState("");
  const selectedVenue = selectedVenueId ? allVenues.find((v) => v.id === selectedVenueId) : null;
  const selectedArticle = selectedArticleId ? allArticles.find((a) => a.id === selectedArticleId) : null;
  const selectedDrink = selectedDrinkId ? allDrinks.find((d) => d.id === selectedDrinkId) : null;
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loziodelrum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup scaricato");
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
    mutationFn: (venueId) => updateVenue(venueId, { verified: true }),
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
    <div className="min-h-screen px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Amministratore</h1>
          <p className="text-stone-500">Gestisci i contenuti in attesa di approvazione</p>
        </div>

        {/* Anteprima dell'app */}
        <div className="mb-8 rounded-2xl overflow-hidden border-2 border-stone-700 bg-stone-900 shadow-xl">
          <div className="flex items-center gap-2 px-4 py-3 bg-stone-800 border-b border-stone-700">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
            </div>
            <span className="text-xs text-stone-500 font-medium ml-2">Anteprima app — Lo Zio del Rum</span>
          </div>
          <div className="aspect-video bg-stone-950 relative">
            <iframe
              title="Anteprima app Lo Zio del Rum"
              src="/Explore"
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{pendingVenues.length}</p>
                <p className="text-stone-500">In attesa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Venues */}
        <div className="bg-stone-900/50 rounded-2xl border border-stone-800/50 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Locali in attesa di approvazione
          </h2>

          {pendingVenues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-stone-500">Nessun contenuto in attesa di approvazione</p>
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
                    {/* Image */}
                    <img
                      src={venue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"}
                      alt={venue.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />

                    {/* Info */}
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
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          In attesa
                        </Badge>
                      </div>

                      {venue.description && (
                        <p className="text-stone-400 text-sm mb-4 line-clamp-2">
                          {venue.description}
                        </p>
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

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => approveMutation.mutate(venue.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approva
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Sei sicuro di voler eliminare questo locale?')) {
                              rejectMutation.mutate(venue.id);
                            }
                          }}
                          disabled={rejectMutation.isPending}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

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