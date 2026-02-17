import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { ChevronLeft, Save, Loader2, MapPin, Phone, Globe, Instagram, Clock, Image as ImageIcon, Trash2, X } from "lucide-react";
import { uploadToSupabaseStorage, uploadMultipleToSupabaseStorage, urlsToDbString, dbStringToUrls } from "@/lib/supabaseStorage";

const categories = [
  { value: "cocktail_bar", label: "Cocktail Bar" },
  { value: "rum_bar", label: "Rum Bar" },
  { value: "wine_bar", label: "Wine Bar" },
  { value: "speakeasy", label: "Speakeasy" },
  { value: "distillery", label: "Distilleria" },
  { value: "enoteca", label: "Enoteca" },
  { value: "pub", label: "Pub" },
  { value: "rooftop", label: "Rooftop Bar" },
  { value: "hotel_bar", label: "Hotel Bar" }
];

const priceRanges = ["€", "€€", "€€€", "€€€€"];

const specialtyOptions = [
  "Cocktail d'autore", "Rum collection", "Whisky selection", "Vini naturali",
  "Champagne bar", "Gin tonic bar", "Mixology", "Degustazioni"
];

const fieldStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontSize: "16px",
  minHeight: "2.5rem",
  backgroundColor: "rgba(41,37,36,0.5)",
  border: "1px solid rgba(68,64,60,0.8)",
  borderRadius: "0.5rem",
  color: "#e7e5e4",
  pointerEvents: "auto",
  WebkitUserSelect: "text",
  userSelect: "text",
};

export default function EditVenue() {
  const urlParams = new URLSearchParams(window.location.search);
  const venueId = urlParams.get("id");
  const location = useLocation();
  const stateVenue = location.state?.fromCloud ? location.state?.venue : null;

  const navigate = useNavigate();
  const { getVenueById, updateVenue, updateVenueCloud, deleteVenue, rejectVenueCloud, isSupabaseConfigured } = useAppData();
  const venue = stateVenue || getVenueById(venueId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    province: "",
    country: "",
    address: "",
    latitude: null,
    longitude: null,
    categories: [],
    specialties: [],
    price_range: "€€",
    phone: "",
    website: "",
    instagram: "",
    opening_hours: "",
    cover_image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [coverImageFiles, setCoverImageFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (venue && venueId) {
      setFormData({
        name: venue.name || "",
        description: venue.description || "",
        city: venue.city || "",
        province: venue.province || "",
        country: venue.country || "",
        address: venue.address || "",
        latitude: venue.latitude ?? null,
        longitude: venue.longitude ?? null,
        categories: venue.categories?.length ? venue.categories : (venue.category ? [venue.category] : ["cocktail_bar"]),
        specialties: venue.specialties || [],
        price_range: venue.price_range || "€€",
        phone: venue.phone || "",
        website: venue.website || "",
        instagram: venue.instagram || "",
        opening_hours: venue.opening_hours || "",
        cover_image: venue.cover_image || "",
      });
    }
  // venue non in deps: getVenueById restituisce nuovo oggetto ogni render, causava reset continuo e blocco modifica
  }, [venueId]);

  const isCloudVenue = !!location.state?.fromCloud;
  const updateVenueMutation = useMutation({
    mutationFn: async (venueData) => {
      return isCloudVenue ? updateVenueCloud(venueId, venueData) : updateVenue(venueId, venueData);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      if (isCloudVenue) {
        navigate(createPageUrl("Dashboard"));
      } else {
        navigate(createPageUrl(`VenueDetail?id=${venueId}`));
      }
    },
    onError: () => setIsSubmitting(false),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.country || formData.categories.length === 0 || isSubmitting) return;
    if (coverImageFiles.length > 0 && !isSupabaseConfigured?.()) {
      return;
    }
    setIsSubmitting(true);
    try {
      let coverImageUrl = formData.cover_image || "";
      if (coverImageFiles.length > 0) {
        const urls = await uploadMultipleToSupabaseStorage(
          coverImageFiles,
          "venues",
          (current, total) => setUploadProgress({ current, total })
        );
        const existingUrls = dbStringToUrls(formData.cover_image);
        coverImageUrl = urlsToDbString([...existingUrls, ...urls]);
      }
      setUploadProgress({ current: 0, total: 0 });
      updateVenueMutation.mutate({
        ...formData,
        cover_image: coverImageUrl,
        categories: formData.categories?.length ? formData.categories : ["cocktail_bar"],
      });
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (v) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(v) ? prev.categories.filter((c) => c !== v) : [...prev.categories, v],
    }));
  };

  const toggleSpecialty = (s) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s) ? prev.specialties.filter((x) => x !== s) : [...prev.specialties, s],
    }));
  };

  const handleDelete = async () => {
    if (!venueId || !venue) return;
    if (isCloudVenue) {
      const supabaseId = venue.supabase_id || venueId;
      await rejectVenueCloud(supabaseId);
      navigate(createPageUrl("Dashboard"));
    } else {
      deleteVenue(venueId);
      navigate(createPageUrl("Explore"));
    }
    setShowDeleteConfirm(false);
  };

  const handlePaste = (field, e) => {
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const val = String(formData[field] ?? "");
    const newVal = val.slice(0, start) + text + val.slice(end);
    setFormData((p) => ({ ...p, [field]: newVal }));
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
    }, 0);
  };

  if (venueId && !venue) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ textAlign: "center" }}>
          <MapPin style={{ width: 80, height: 80, color: "#44403c", margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Locale non trovato</h2>
          <p style={{ color: "#78716c", marginBottom: "1.5rem" }}>Il locale che stai cercando non esiste.</p>
          <Link to={createPageUrl("Explore")} style={{ display: "inline-block", padding: "0.5rem 1rem", backgroundColor: "#f59e0b", color: "#0c0a09", borderRadius: "0.5rem", fontWeight: 600, textDecoration: "none" }}>
            Torna all'esplorazione
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = formData.name && formData.city && formData.country && formData.categories.length > 0 && !isSubmitting;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1rem 1.5rem 7rem 1.5rem",
        backgroundColor: "#0c0a09",
        color: "#e7e5e4",
        pointerEvents: "auto",
      }}
    >
      <div style={{ maxWidth: 768, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", paddingTop: "1.5rem" }}>
          <Link
            to={createPageUrl(`VenueDetail?id=${venueId}`)}
            style={{ padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "inherit" }}
          >
            <ChevronLeft style={{ width: 24, height: 24 }} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Modifica Locale</h1>
            <p style={{ color: "#78716c", fontSize: "0.875rem" }}>Aggiorna le informazioni</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Elimina locale"
            style={{
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            <Trash2 style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "#1c1917",
                borderRadius: "1rem",
                padding: "1.5rem",
                maxWidth: 360,
                border: "1px solid rgba(68,64,60,0.5)",
              }}
            >
              <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>Sei sicuro di voler eliminare questo locale?</p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(68,64,60,0.8)",
                    background: "transparent",
                    color: "#a8a29e",
                    cursor: "pointer",
                  }}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section style={{ backgroundColor: "rgba(28,25,23,0.5)", borderRadius: "1rem", border: "1px solid rgba(68,64,60,0.5)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>Informazioni Base</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Nome del locale *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  onPaste={(e) => handlePaste("name", e)}
                  placeholder="Es. The Rum Bar"
                  style={fieldStyle}
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  onPaste={(e) => handlePaste("description", e)}
                  placeholder="Racconta qualcosa su questo locale..."
                  rows={4}
                  style={{ ...fieldStyle, minHeight: 100 }}
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Categorie *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      style={{
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.875rem",
                        borderRadius: "0.5rem",
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: formData.categories.includes(cat.value) ? "rgba(245,158,11,0.2)" : "rgba(41,37,36,0.8)",
                        borderColor: formData.categories.includes(cat.value) ? "rgba(245,158,11,0.5)" : "rgba(68,64,60,0.8)",
                        color: formData.categories.includes(cat.value) ? "#fbbf24" : "#a8a29e",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section style={{ backgroundColor: "rgba(28,25,23,0.5)", borderRadius: "1rem", border: "1px solid rgba(68,64,60,0.5)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin style={{ width: 20, height: 20, color: "#f59e0b" }} /> Località
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Indirizzo</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} onPaste={(e) => handlePaste("address", e)} placeholder="Via Roma 123" style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Città *</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} onPaste={(e) => handlePaste("city", e)} placeholder="Milano" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Provincia</label>
                  <input type="text" value={formData.province} onChange={(e) => setFormData((p) => ({ ...p, province: e.target.value }))} onPaste={(e) => handlePaste("province", e)} placeholder="MI" style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Paese *</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} onPaste={(e) => handlePaste("country", e)} placeholder="Italia" style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Latitudine</label>
                  <input type="number" step="any" value={formData.latitude ?? ""} onChange={(e) => setFormData((p) => ({ ...p, latitude: parseFloat(e.target.value) || null }))} placeholder="45.46" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Longitudine</label>
                  <input type="number" step="any" value={formData.longitude ?? ""} onChange={(e) => setFormData((p) => ({ ...p, longitude: parseFloat(e.target.value) || null }))} placeholder="9.19" style={fieldStyle} />
                </div>
              </div>
            </div>
          </section>

          <section style={{ backgroundColor: "rgba(28,25,23,0.5)", borderRadius: "1rem", border: "1px solid rgba(68,64,60,0.5)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>Specialità e Prezzi</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Specialità</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {specialtyOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      style={{
                        padding: "0.375rem 0.75rem",
                        fontSize: "0.875rem",
                        borderRadius: "9999px",
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: formData.specialties.includes(s) ? "rgba(245,158,11,0.2)" : "rgba(41,37,36,0.8)",
                        borderColor: formData.specialties.includes(s) ? "rgba(245,158,11,0.5)" : "rgba(68,64,60,0.8)",
                        color: formData.specialties.includes(s) ? "#fbbf24" : "#a8a29e",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Fascia di prezzo</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {priceRanges.map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, price_range: pr }))}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        backgroundColor: formData.price_range === pr ? "#f59e0b" : "rgba(41,37,36,0.8)",
                        color: formData.price_range === pr ? "#0c0a09" : "#a8a29e",
                      }}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section style={{ backgroundColor: "rgba(28,25,23,0.5)", borderRadius: "1rem", border: "1px solid rgba(68,64,60,0.5)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>Contatti</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.875rem" }}><Phone style={{ width: 16, height: 16, color: "#f59e0b" }} /> Telefono</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} onPaste={(e) => handlePaste("phone", e)} placeholder="+39 02 1234567" style={fieldStyle} />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.875rem" }}><Globe style={{ width: 16, height: 16, color: "#f59e0b" }} /> Sito web</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))} onPaste={(e) => handlePaste("website", e)} placeholder="https://..." style={fieldStyle} />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.875rem" }}><Instagram style={{ width: 16, height: 16, color: "#f59e0b" }} /> Instagram</label>
                <input type="text" value={formData.instagram} onChange={(e) => setFormData((p) => ({ ...p, instagram: e.target.value }))} onPaste={(e) => handlePaste("instagram", e)} placeholder="nomelocale" style={fieldStyle} />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.875rem" }}><Clock style={{ width: 16, height: 16, color: "#f59e0b" }} /> Orari</label>
                <input type="text" value={formData.opening_hours} onChange={(e) => setFormData((p) => ({ ...p, opening_hours: e.target.value }))} onPaste={(e) => handlePaste("opening_hours", e)} placeholder="Mar-Dom 18:00-02:00" style={fieldStyle} />
              </div>
            </div>
          </section>

          <section style={{ backgroundColor: "rgba(28,25,23,0.5)", borderRadius: "1rem", border: "1px solid rgba(68,64,60,0.5)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ImageIcon style={{ width: 20, height: 20, color: "#f59e0b" }} /> Immagine di copertina
            </h3>
            <label
              htmlFor="edit-venue-cover-input"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                backgroundColor: "rgba(41,37,36,0.8)",
                border: "1px solid rgba(68,64,60,0.8)",
                borderRadius: "0.5rem",
                color: "#d6d3d1",
                cursor: "pointer",
              }}
            >
              {coverImageFiles.length > 0 ? `${coverImageFiles.length} file` : "carica una foto"}
            </label>
            <input
              id="edit-venue-cover-input"
              type="file"
              accept="image/*,video/*"
              capture="environment"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setCoverImageFiles((prev) => [...prev, ...files]);
                e.target.value = "";
              }}
              className="sr-only"
            />
            <p style={{ fontSize: "0.75rem", color: "#78716c", marginTop: "0.5rem" }}>Fotocamera, video o galleria • max 5MB foto, 10MB video</p>
            {uploadProgress.total > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ height: 6, backgroundColor: "rgba(68,64,60,0.8)", borderRadius: 9999, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      backgroundColor: "#f59e0b",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#78716c", marginTop: "0.25rem" }}>
                  Caricamento {uploadProgress.current}/{uploadProgress.total}
                </p>
              </div>
            )}
            {(formData.cover_image || coverImageFiles.length > 0) && (
              <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {dbStringToUrls(formData.cover_image).map((url, i) => (
                  <div key={`url-${i}`} style={{ position: "relative" }}>
                    <img src={url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "0.5rem" }} onError={(e) => e.target.style.display = "none"} />
                  </div>
                ))}
                {coverImageFiles.map((f, i) => (
                  <div key={`file-${i}`} style={{ position: "relative" }} className="group">
                    {f.type.startsWith("video/") ? (
                      <video src={URL.createObjectURL(f)} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "0.5rem" }} muted playsInline />
                    ) : (
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "0.5rem" }} />
                    )}
                    <button
                      type="button"
                      onClick={() => setCoverImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ position: "absolute", top: -4, right: -4, padding: 4, backgroundColor: "#dc2626", borderRadius: "9999px", border: "none", cursor: "pointer" }}
                    >
                      <X style={{ width: 12, height: 12, color: "white" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              fontSize: "1.125rem",
              fontWeight: 600,
              backgroundColor: canSubmit ? "#f59e0b" : "#44403c",
              color: canSubmit ? "#0c0a09" : "#78716c",
              border: "none",
              borderRadius: "0.75rem",
              cursor: canSubmit ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                Salvataggio...
              </>
            ) : (
              <>
                <Save style={{ width: 20, height: 20 }} />
                Salva Modifiche
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
