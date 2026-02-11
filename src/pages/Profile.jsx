import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { 
  User, 
  MapPin, 
  Star, 
  Edit3, 
  Settings, 
  LogOut,
  Wine,
  BookmarkPlus,
  Award,
  TrendingUp,
  Camera,
  Save,
  X,
  Shield,
  ShieldOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCard from "@/components/review/ReviewCard";
import VenueCard from "@/components/venue/VenueCard";
import { motion } from "framer-motion";

const expertiseLevels = {
  novice: { label: "Novizio", color: "bg-stone-500" },
  enthusiast: { label: "Appassionato", color: "bg-blue-500" },
  connoisseur: { label: "Intenditore", color: "bg-purple-500" },
  expert: { label: "Esperto", color: "bg-amber-500" },
  master: { label: "Maestro", color: "bg-emerald-500" }
};

export default function Profile() {
  const { user, setUser, getReviews, getVenues, getVenueById } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const safeUser = user || { name: "Utente", email: "", role: "user" };
  const loadingReviews = false;

  const allReviews = getReviews();
  const userReviews = allReviews
    .filter((r) => r.created_by === safeUser?.email)
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
  const allVenues = getVenues();
  const savedVenues = allVenues.filter((v) => safeUser?.saved_venues?.includes(v.id));

  const updateUserMutation = useMutation({
    mutationFn: (data) => {
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
    },
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (safeUser) {
      setEditData({
        name: safeUser.name || "",
        bio: safeUser.bio || "",
        home_city: safeUser.home_city || "",
      });
    }
  }, [safeUser]);

  const handleSave = () => {
    updateUserMutation.mutate(editData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const getVenueForReview = (venueId) => {
    return getVenueById(venueId);
  };

  const isAdmin = safeUser?.role === "admin";
  const expectedAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || (import.meta.env.DEV ? "admin" : "");

  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleAdminLoginClick = () => {
    setAdminPasswordInput("");
    setAdminError("");
    setAdminDialogOpen(true);
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    const password = (adminPasswordInput || "").trim();
    if (password === expectedAdminPassword) {
      setUser((prev) => ({ ...prev, name: "Admin", email: "admin@loziodelrum.local", role: "admin" }));
      setAdminDialogOpen(false);
      setAdminPasswordInput("");
      setAdminError("");
    } else {
      setAdminError("Password non corretta.");
    }
  };

  const handleAdminLogout = () => {
    setUser((prev) => ({ ...prev, role: "user", name: prev?.name || "Utente", email: prev?.email || "" }));
  };

  const stats = [
    { label: "Recensioni", value: safeUser?.reviews_count ?? userReviews.length, icon: Star },
    { label: "Locali visitati", value: safeUser?.venues_visited ?? [...new Set(userReviews.map(r => r.venue_id))].length, icon: MapPin },
    { label: "Drink degustati", value: safeUser?.drinks_tasted ?? userReviews.reduce((acc, r) => acc + (r.drinks_ordered?.length || 0), 0), icon: Wine },
  ];

  const expertiseLevel = expertiseLevels[safeUser?.expertise_level || "novice"] || expertiseLevels.novice;

  return (
    <div className="min-h-screen px-4 md:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Accesso amministratore: solo tu puoi vedere Dashboard e Scrivi articolo */}
        <div className="mb-6 rounded-2xl border border-stone-800/50 bg-stone-900/50 p-4">
          {isAdmin ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Sei connesso come amministratore. Dashboard e Scrivi articolo sono visibili nel menu.</span>
              </div>
              <Button size="sm" onClick={handleAdminLogout} className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                <ShieldOff className="w-4 h-4 mr-2" />
                Esci da amministratore
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-stone-500 text-sm">Per gestire contenuti e vedere Dashboard e Scrivi articolo, accedi come amministratore.</span>
              <Button size="sm" onClick={handleAdminLoginClick} className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                <Shield className="w-4 h-4 mr-2" />
                Accedi come amministratore
              </Button>
            </div>
          )}
        </div>

        {/* Dialog password amministratore (funziona bene su mobile, a differenza di prompt()) */}
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <DialogContent className="bg-stone-900 border-stone-700 text-stone-100 max-w-[min(90vw,24rem)]">
            <DialogHeader>
              <DialogTitle className="text-amber-400">Accesso amministratore</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-stone-400 mb-2">Password</label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => { setAdminPasswordInput(e.target.value); setAdminError(""); }}
                  placeholder="Inserisci la password"
                  className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              {adminError && <p className="text-sm text-red-400">{adminError}</p>}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setAdminDialogOpen(false)} className="border-stone-600 text-stone-300">
                  Annulla
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                  Accedi
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/50 rounded-3xl border border-stone-800/50 p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-stone-800">
                <AvatarImage src={safeUser?.avatar} />
                <AvatarFallback className="bg-stone-800 text-amber-500 text-2xl">
                  {safeUser?.full_name?.[0] || safeUser?.name?.[0] || safeUser?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${expertiseLevel.color} text-white border-0`}>
                {expertiseLevel.label}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Nome"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                  <Textarea
                    placeholder="Bio..."
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                  <Input
                    placeholder="Città"
                    value={editData.home_city}
                    onChange={(e) => setEditData(prev => ({ ...prev, home_city: e.target.value }))}
                    className="bg-stone-800/50 border-stone-700"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </Button>
                    <Button onClick={() => setIsEditing(false)} className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                      <X className="w-4 h-4 mr-2" />
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold mb-1">
                        {safeUser?.name || safeUser?.username || safeUser?.full_name || "Utente"}
                      </h1>
                      {safeUser?.home_city && (
                        <p className="text-stone-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {safeUser.home_city}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="icon"
                        onClick={() => setIsEditing(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon"
                        onClick={handleLogout}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {user?.bio && (
                    <p className="text-stone-400 mt-3">{safeUser.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center p-4 bg-stone-800/30 rounded-xl">
                <Icon className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-stone-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          {safeUser?.badges && safeUser.badges.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-stone-500 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badge
              </p>
              <div className="flex flex-wrap gap-2">
                {safeUser.badges.map((badge, i) => (
                  <Badge key={i} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="reviews">
          <TabsList className="bg-stone-900/50 border border-stone-800/50 p-1 rounded-xl">
            <TabsTrigger 
              value="reviews"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-amber-400 rounded-lg"
            >
              <Star className="w-4 h-4 mr-2" />
              Recensioni
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-amber-400 rounded-lg"
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Salvati
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            {loadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review, i) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    showVenue={true}
                    venue={getVenueForReview(review.venue_id)}
                    index={i}
                    currentUser={safeUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-stone-900/30 rounded-2xl">
                <Star className="w-16 h-16 text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna recensione ancora</h3>
                <p className="text-stone-500 mb-6">Inizia a condividere le tue esperienze</p>
                <Link to={createPageUrl("AddReview")}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    Scrivi la tua prima recensione
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {savedVenues.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {savedVenues.map((venue, i) => (
                  <VenueCard key={venue.id} venue={venue} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-stone-900/30 rounded-2xl">
                <BookmarkPlus className="w-16 h-16 text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessun locale salvato</h3>
                <p className="text-stone-500 mb-6">Salva i tuoi locali preferiti per ritrovarli facilmente</p>
                <Link to={createPageUrl("Explore")}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    Esplora locali
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}