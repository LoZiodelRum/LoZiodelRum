/**
 * AdminDashboard – Centro di gestione totale.
 * Gestione: Locali, Utenti (Proprietario/Bartender/User), Recensioni.
 * Locale: scheda finita con foto upload e mappa.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/AppDataContext";
import { createPageUrl } from "@/utils";
import {
  MapPin, ChevronLeft, Loader2, RefreshCw, X, Save, Trash2,
  CheckCircle, Clock, User, MessageSquare, Store, ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { uploadToSupabaseStorage } from "@/lib/supabaseStorage";
import "leaflet/dist/leaflet.css";

const adminPinIcon = new L.DivIcon({
  className: "admin-pin",
  html: `<div style="position:relative;width:36px;height:48px;display:flex;justify-content:center;background:transparent;">
    <svg width="36" height="48" viewBox="0 0 36 48" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <defs><radialGradient id="lzdrAdminGrad" cx="30%" cy="30%" r="70%" fx="25%" fy="25%"><stop offset="0%" style="stop-color:#fbbf24"/><stop offset="100%" style="stop-color:#d97706"/></radialGradient></defs>
      <path d="M18 3 C10 3 3 9 3 18 C3 27 18 48 18 48 C18 48 33 27 33 18 C33 9 26 3 18 3 Z" fill="url(#lzdrAdminGrad)"/>
    </svg>
    <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:16px;height:16px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1917" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 5h16l-2 7H6l2-7z"/>
        <path d="M6 12l6 7 6-7"/>
        <path d="M12 19v1"/>
        <path d="M9 12h6"/>
        <path d="M6 12l3 4h6l3-4" fill="#1c1917"/>
        <ellipse cx="18" cy="4.5" rx="1.8" ry="1.2" fill="#e8dcc4" stroke="#1c1917" stroke-width="1"/>
        <path d="M18 4l1.5 2" stroke="#1c1917" stroke-width="0.8"/>
      </svg>
    </div>
  </div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
});

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) map.setView(center, 15);
  }, [center, map]);
  return null;
}

const TABLE_LOCALI = "Locali";
const TABLE_APP_USERS = "app_users";
const TABLE_REVIEWS = "reviews_cloud";

const safeStr = (v) => (v == null ? "" : String(v));
const safeNum = (v) => (v == null || v === "" ? null : parseFloat(v));

export default function AdminDashboard() {
  const { reloadVenuesFromSupabase } = useAppData();
  const [locali, setLocali] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const photoInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [locRes, usrRes, revRes] = await Promise.all([
        supabase.from(TABLE_LOCALI).select("*"),
        supabase.from(TABLE_APP_USERS).select("*"),
        supabase.from(TABLE_REVIEWS).select("*"),
      ]);
      if (locRes.error) throw locRes.error;
      if (usrRes.error) throw usrRes.error;
      if (revRes.error) throw revRes.error;
      setLocali(locRes.data || []);
      setUsers(usrRes.data || []);
      setReviews(revRes.data || []);
    } catch (err) {
      toast({ title: "Errore caricamento", description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = (item, type) => {
    setSelected({ item, type });
    setImagePreview(null);
    if (type === "locale") {
      setEditForm({
        nome: safeStr(item.nome),
        indirizzo: safeStr(item.indirizzo),
        citta: safeStr(item.citta),
        descrizione: safeStr(item.descrizione),
        image_url: safeStr(item.image_url),
        latitudine: item.latitudine != null ? String(item.latitudine) : "",
        longitudine: item.longitudine != null ? String(item.longitudine) : "",
        approvato: item.approvato === true,
        telefono: safeStr(item.telefono),
        orari: safeStr(item.orari),
        paese: safeStr(item.paese),
        sito: safeStr(item.sito),
        instagram: safeStr(item.instagram),
        categoria: safeStr(item.categoria) || "cocktail_bar",
        price_range: safeStr(item.price_range) || "€€",
        slug: safeStr(item.slug),
        video_url: safeStr(item.video_url),
      });
    } else if (type === "user") {
      setEditForm({
        name: safeStr(item.name || item.full_name),
        email: safeStr(item.email),
        role: safeStr(item.role) || "user",
        status: safeStr(item.status) || "pending",
      });
    } else if (type === "review") {
      setEditForm({
        content: safeStr(item.content),
        overall_rating: item.overall_rating != null ? String(item.overall_rating) : "",
        status: safeStr(item.status) || "approved",
      });
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { item, type } = selected;
      if (type === "locale") {
        const payload = {
          nome: editForm.nome || null,
          indirizzo: editForm.indirizzo || null,
          citta: editForm.citta || null,
          descrizione: editForm.descrizione || null,
          image_url: editForm.image_url || null,
          latitudine: safeNum(editForm.latitudine),
          longitudine: safeNum(editForm.longitudine),
          approvato: !!editForm.approvato,
          status: editForm.approvato ? "approved" : (item.status || "pending"),
          telefono: editForm.telefono || null,
          orari: editForm.orari || null,
          paese: editForm.paese || null,
          sito: editForm.sito || null,
          instagram: editForm.instagram || null,
          categoria: editForm.categoria || "cocktail_bar",
          price_range: editForm.price_range || "€€",
          slug: editForm.slug || null,
          video_url: editForm.video_url || null,
        };
        const { error } = await supabase.from(TABLE_LOCALI).update(payload).eq("id", item.id);
        if (error) throw error;
        await reloadVenuesFromSupabase?.();
        toast({ title: "Locale aggiornato" });
      } else if (type === "user") {
        const payload = {
          name: editForm.name || null,
          email: editForm.email || null,
          role: editForm.role || "user",
          status: editForm.status || "pending",
        };
        const { error } = await supabase.from(TABLE_APP_USERS).update(payload).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Utente aggiornato" });
      } else if (type === "review") {
        const payload = {
          content: editForm.content || null,
          overall_rating: safeNum(editForm.overall_rating),
          status: editForm.status || "approved",
        };
        const { error } = await supabase.from(TABLE_REVIEWS).update(payload).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Recensione aggiornata" });
      }
      setSelected(null);
      loadData();
    } catch (err) {
      toast({ title: "Errore salvataggio", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (table, id, label) => {
    if (!confirm(`Eliminare definitivamente ${label}?`)) return;
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Eliminato" });
      setSelected(null);
      loadData();
    } catch (err) {
      toast({ title: "Errore", description: err?.message, variant: "destructive" });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Seleziona un'immagine", variant: "destructive" });
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadToSupabaseStorage(file, "venues", "image");
      setEditForm((p) => ({ ...p, image_url: url }));
      setImagePreview(URL.createObjectURL(file));
      toast({ title: "Foto caricata" });
    } catch (err) {
      toast({ title: "Errore upload", description: err?.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleVideoOrPhotoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast({ title: "Seleziona un video o un'immagine", variant: "destructive" });
      return;
    }
    setUploadingMedia(true);
    try {
      const url = await uploadToSupabaseStorage(file, "venues", isVideo ? "video" : "image");
      if (isVideo) {
        setEditForm((p) => ({ ...p, video_url: url }));
        toast({ title: "Video caricato" });
      } else {
        const existing = (editForm.image_url || "").split(",").map((s) => s.trim()).filter(Boolean);
        setEditForm((p) => ({ ...p, image_url: [...existing, url].join(",") }));
        setImagePreview(URL.createObjectURL(file));
        toast({ title: "Foto aggiunta" });
      }
    } catch (err) {
      toast({ title: "Errore upload", description: err?.message, variant: "destructive" });
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const localiInAttesa = locali.filter((l) => l.approvato !== true);
  const localiOnline = locali.filter((l) => l.approvato === true);
  const usersPending = users.filter((u) => u.status === "pending");
  const usersApproved = users.filter((u) => u.status === "approved");
  const reviewsPending = reviews.filter((r) => r.status === "pending");
  const reviewsApproved = reviews.filter((r) => r.status === "approved");

  const inputClass = "w-full px-4 py-2 bg-stone-800/50 border border-stone-700 rounded-xl text-stone-200 text-sm";
  const labelClass = "block text-xs uppercase text-stone-500 font-bold mb-1";

  if (loading) {
    return (
      <div className="h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 border-b border-stone-800 pb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-amber-500 tracking-tight">Centro Gestione Admin</h1>
          </div>
          <Button onClick={loadData} variant="outline" className="border-stone-800">
            <RefreshCw className="w-4 h-4 mr-2" /> Sync
          </Button>
        </div>

        {/* MODALE EDITING IN-PLACE */}
        {selected && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
            <div className="bg-stone-900 w-full max-w-2xl rounded-3xl border border-stone-800 p-8 shadow-2xl relative my-8">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 p-2 bg-stone-800 rounded-full hover:bg-stone-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-amber-400 mb-6">
                {selected.type === "locale" && "Modifica Locale"}
                {selected.type === "user" && "Modifica Utente"}
                {selected.type === "review" && "Modifica Recensione"}
              </h2>

              {selected.type === "locale" && (
                <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-2">
                  {/* Hero + Allega foto */}
                  <div className="rounded-2xl overflow-hidden border border-stone-800">
                    <div className="relative h-40 bg-stone-800">
                      <img
                        src={imagePreview || (editForm.image_url ? (editForm.image_url || "").split(",")[0]?.trim() : null) || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800"}
                        alt={editForm.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute bottom-3 left-3 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold rounded-xl"
                      >
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                        Allega foto
                      </button>
                    </div>
                  </div>

                  {/* Tutti i campi modificabili */}
                  <div className="grid gap-4">
                    <div><label className={labelClass}>Nome *</label><input type="text" value={editForm.nome} onChange={(e) => setEditForm((p) => ({ ...p, nome: e.target.value }))} className={inputClass} placeholder="Nome locale" /></div>
                    <div><label className={labelClass}>Indirizzo</label><input type="text" value={editForm.indirizzo} onChange={(e) => setEditForm((p) => ({ ...p, indirizzo: e.target.value }))} className={inputClass} placeholder="Via Roma 1" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Città</label><input type="text" value={editForm.citta} onChange={(e) => setEditForm((p) => ({ ...p, citta: e.target.value }))} className={inputClass} placeholder="Milano" /></div>
                      <div><label className={labelClass}>Paese</label><input type="text" value={editForm.paese} onChange={(e) => setEditForm((p) => ({ ...p, paese: e.target.value }))} className={inputClass} placeholder="Italia" /></div>
                    </div>
                    <div><label className={labelClass}>Descrizione</label><textarea value={editForm.descrizione} onChange={(e) => setEditForm((p) => ({ ...p, descrizione: e.target.value }))} className={inputClass + " min-h-[80px]"} rows={4} placeholder="Descrizione" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Telefono</label><input type="text" value={editForm.telefono} onChange={(e) => setEditForm((p) => ({ ...p, telefono: e.target.value }))} className={inputClass} placeholder="+39 02 1234567" /></div>
                      <div><label className={labelClass}>Orari</label><input type="text" value={editForm.orari} onChange={(e) => setEditForm((p) => ({ ...p, orari: e.target.value }))} className={inputClass} placeholder="Mar-Dom 18:00-02:00" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Sito web</label><input type="text" value={editForm.sito} onChange={(e) => setEditForm((p) => ({ ...p, sito: e.target.value }))} className={inputClass} placeholder="https://..." /></div>
                      <div><label className={labelClass}>Instagram</label><input type="text" value={editForm.instagram} onChange={(e) => setEditForm((p) => ({ ...p, instagram: e.target.value }))} className={inputClass} placeholder="@nomelocale" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Categoria</label><input type="text" value={editForm.categoria} onChange={(e) => setEditForm((p) => ({ ...p, categoria: e.target.value }))} className={inputClass} placeholder="cocktail_bar" /></div>
                      <div><label className={labelClass}>Fascia prezzo</label><select value={editForm.price_range} onChange={(e) => setEditForm((p) => ({ ...p, price_range: e.target.value }))} className={inputClass}><option value="€">€</option><option value="€€">€€</option><option value="€€€">€€€</option><option value="€€€€">€€€€</option></select></div>
                    </div>
                    <div><label className={labelClass}>Slug</label><input type="text" value={editForm.slug} onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))} className={inputClass} placeholder="nome-locale" /></div>
                    <div>
                      <label className={labelClass}>Video o foto</label>
                      <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleVideoOrPhotoUpload} />
                      <button type="button" onClick={() => mediaInputRef.current?.click()} disabled={uploadingMedia} className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 border border-stone-700 rounded-xl text-stone-300 text-sm transition-colors">
                        {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                        Allega video o foto
                      </button>
                      {editForm.video_url && <p className="text-xs text-stone-500 mt-1 truncate">Video: {editForm.video_url}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>Latitudine</label><input type="number" step="any" value={editForm.latitudine} onChange={(e) => setEditForm((p) => ({ ...p, latitudine: e.target.value }))} className={inputClass} placeholder="45.46" /></div>
                      <div><label className={labelClass}>Longitudine</label><input type="number" step="any" value={editForm.longitudine} onChange={(e) => setEditForm((p) => ({ ...p, longitudine: e.target.value }))} className={inputClass} placeholder="9.19" /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="approvato" checked={editForm.approvato} onChange={(e) => setEditForm((p) => ({ ...p, approvato: e.target.checked }))} className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-amber-500" />
                      <label htmlFor="approvato" className="text-sm font-medium">Approvato</label>
                    </div>
                  </div>

                  {/* Mappa con marker */}
                  <div>
                    <p className="text-xs uppercase text-stone-500 font-bold mb-2">Posizione sulla mappa</p>
                    {editForm.latitudine && editForm.longitudine && !isNaN(parseFloat(editForm.latitudine)) && !isNaN(parseFloat(editForm.longitudine)) ? (
                      <div className="h-[220px] rounded-xl overflow-hidden border border-stone-800">
                        <MapContainer center={[parseFloat(editForm.latitudine), parseFloat(editForm.longitudine)]} zoom={15} className="h-full w-full" style={{ background: "#1c1917" }} zoomControl={false}>
                          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                          <Marker position={[parseFloat(editForm.latitudine), parseFloat(editForm.longitudine)]} icon={adminPinIcon} />
                          <MapCenterUpdater center={[parseFloat(editForm.latitudine), parseFloat(editForm.longitudine)]} />
                        </MapContainer>
                      </div>
                    ) : (
                      <div className="h-[100px] rounded-xl border border-stone-800 bg-stone-800/50 flex items-center justify-center text-stone-500 text-sm">Inserisci latitudine e longitudine per vedere il marker</div>
                    )}
                  </div>
                </div>
              )}

              {selected.type === "user" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Nome</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ruolo</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="proprietario">Proprietario</option>
                      <option value="bartender">Bartender</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Stato</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              )}

              {selected.type === "review" && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Testo</label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                      className={inputClass + " min-h-[100px]"}
                      placeholder="Contenuto recensione"
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Voto (overall_rating)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editForm.overall_rating}
                      onChange={(e) => setEditForm((p) => ({ ...p, overall_rating: e.target.value }))}
                      className={inputClass}
                      placeholder="4.5"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stato approvazione</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8 pt-6 border-t border-stone-800">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold h-12"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Salva Modifiche
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    selected.type === "locale"
                      ? handleDelete(TABLE_LOCALI, selected.item.id, "il locale")
                      : selected.type === "user"
                      ? handleDelete(TABLE_APP_USERS, selected.item.id, "l'utente")
                      : handleDelete(TABLE_REVIEWS, selected.item.id, "la recensione")
                  }
                  className="h-12"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* LOCALI */}
        <section className="mb-12">
          <h2 className="text-amber-500 font-bold mb-4 flex items-center gap-2 text-xl">
            <Store className="w-5 h-5" /> Locali
          </h2>
          <div className="mb-4">
            <h3 className="text-amber-400/80 font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Da approvare ({localiInAttesa.length})
            </h3>
            <div className="grid gap-3">
              {localiInAttesa.map((l) => (
                <div
                  key={l.id}
                  onClick={() => openModal(l, "locale")}
                  className="p-4 bg-stone-900 border border-amber-500/20 rounded-xl flex justify-between items-center cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <div>
                    <span className="font-bold text-stone-200">{l.nome || "Senza nome"}</span>
                    <p className="text-stone-500 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {l.citta || "—"}
                    </p>
                  </div>
                </div>
              ))}
              {localiInAttesa.length === 0 && <p className="text-stone-600 italic text-sm">Nessun locale in attesa.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-green-500/80 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Online ({localiOnline.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {localiOnline.map((l) => (
                <div
                  key={l.id}
                  onClick={() => openModal(l, "locale")}
                  className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl flex justify-between items-center cursor-pointer hover:bg-stone-900 transition-all"
                >
                  <span className="font-medium text-stone-300">{l.nome}</span>
                  <span className="text-xs text-stone-500">{l.citta || ""}</span>
                </div>
              ))}
              {localiOnline.length === 0 && <p className="text-stone-600 italic text-sm">Nessun locale online.</p>}
            </div>
          </div>
        </section>

        {/* UTENTI */}
        <section className="mb-12">
          <h2 className="text-amber-500 font-bold mb-4 flex items-center gap-2 text-xl">
            <User className="w-5 h-5" /> Utenti (Proprietari / Bartender / User)
          </h2>
          <div className="mb-4">
            <h3 className="text-amber-400/80 font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Da approvare ({usersPending.length})
            </h3>
            <div className="grid gap-3">
              {usersPending.map((u) => (
                <div
                  key={u.id}
                  onClick={() => openModal(u, "user")}
                  className="p-4 bg-stone-900 border border-amber-500/20 rounded-xl flex justify-between items-center cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <div>
                    <span className="font-bold text-stone-200">{u.name || u.full_name || "Senza nome"}</span>
                    <p className="text-stone-500 text-sm">{u.email || "—"} · {u.role || "—"}</p>
                  </div>
                </div>
              ))}
              {usersPending.length === 0 && <p className="text-stone-600 italic text-sm">Nessun utente in attesa.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-green-500/80 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approvati ({usersApproved.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {usersApproved.map((u) => (
                <div
                  key={u.id}
                  onClick={() => openModal(u, "user")}
                  className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl flex justify-between items-center cursor-pointer hover:bg-stone-900 transition-all"
                >
                  <span className="font-medium text-stone-300">{u.name || u.full_name}</span>
                  <span className="text-xs text-stone-500">{u.role || ""}</span>
                </div>
              ))}
              {usersApproved.length === 0 && <p className="text-stone-600 italic text-sm">Nessun utente approvato.</p>}
            </div>
          </div>
        </section>

        {/* RECENSIONI */}
        <section>
          <h2 className="text-amber-500 font-bold mb-4 flex items-center gap-2 text-xl">
            <MessageSquare className="w-5 h-5" /> Recensioni
          </h2>
          <div className="mb-4">
            <h3 className="text-amber-400/80 font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Da approvare ({reviewsPending.length})
            </h3>
            <div className="grid gap-3">
              {reviewsPending.map((r) => (
                <div
                  key={r.id}
                  onClick={() => openModal(r, "review")}
                  className="p-4 bg-stone-900 border border-amber-500/20 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <p className="text-stone-300 text-sm line-clamp-2">{r.content || "—"}</p>
                  <p className="text-stone-500 text-xs mt-1">{r.author_name || "—"} · {r.overall_rating != null ? `${r.overall_rating}` : "—"}</p>
                </div>
              ))}
              {reviewsPending.length === 0 && <p className="text-stone-600 italic text-sm">Nessuna recensione in attesa.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-green-500/80 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approvate ({reviewsApproved.length})
            </h3>
            <div className="grid gap-3">
              {reviewsApproved.map((r) => (
                <div
                  key={r.id}
                  onClick={() => openModal(r, "review")}
                  className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl cursor-pointer hover:bg-stone-900 transition-all"
                >
                  <p className="text-stone-300 text-sm line-clamp-2">{r.content || "—"}</p>
                  <p className="text-stone-500 text-xs mt-1">{r.author_name || "—"} · {r.overall_rating != null ? `${r.overall_rating}` : "—"}</p>
                </div>
              ))}
              {reviewsApproved.length === 0 && <p className="text-stone-600 italic text-sm">Nessuna recensione approvata.</p>}
            </div>
          </div>
        </section>
      </div>
      <style>{`
        .admin-pin { background: transparent !important; border: none !important; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}
