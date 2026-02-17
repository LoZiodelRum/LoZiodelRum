/**
 * AdminCard – Visualizzatore universale per verifica profili pending.
 * Mostra campi testuali, foto profilo e video (solo locali).
 * Per locali: caselle Latitudine e Longitudine per posizione sulla mappa.
 * Pulsanti: APPROVA (status → approved, salva coord per marker) e ELIMINA.
 */
import { useState, useEffect } from "react";
import { MapPin, Phone, Globe, Instagram, Clock, User, Wine, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dbStringToUrls } from "@/lib/supabaseStorage";

const FIELD = ({ label, value }) =>
  value != null && value !== "" ? (
    <div className="mb-3">
      <p className="text-xs text-stone-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-stone-200">{String(value)}</p>
    </div>
  ) : null;

export default function AdminCard({ type, item, onApprove, onDelete, onClose, isPending }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  useEffect(() => {
    if (item) {
      setLatitude(item.latitude ?? item.latitudine ?? "");
      setLongitude(item.longitude ?? item.longitudine ?? "");
    }
  }, [item?.id]);
  if (!item) return null;

  const imgUrlRaw = type === "venue" ? item.cover_image : (item.image_url || item.photo);
  const imgUrls = dbStringToUrls(imgUrlRaw);
  const videoUrl = type === "venue" ? item.video_url : (type === "bartender" ? item.video_url : null);
  const currentImg = imgUrls[imgIndex] || imgUrls[0];

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-amber-400">
            {type === "venue" ? "Locale" : type === "bartender" ? "Bartender" : "Utente"}
          </h3>
          {onClose && (
            <button onClick={onClose} className="p-1 text-stone-500 hover:text-stone-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Foto profilo / cover – gallery se più immagini */}
        {imgUrls.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <img
                src={currentImg}
                alt={item.name || "Preview"}
                className="w-full max-w-xs h-40 object-cover rounded-xl"
                onError={(e) => e.target.style.display = "none"}
              />
              {imgUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImgIndex((i) => (i - 1 + imgUrls.length) % imgUrls.length)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgIndex((i) => (i + 1) % imgUrls.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imgUrls.map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === imgIndex ? "bg-amber-500" : "bg-stone-500/60"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Video (solo locali) */}
        {videoUrl && (
          <div className="mb-4">
            <p className="text-xs text-stone-500 font-medium mb-1">Video</p>
            <video
              src={videoUrl}
              controls
              className="w-full max-w-md rounded-xl"
            />
          </div>
        )}

        {/* Campi testuali */}
        <div className="space-y-1">
          {type === "venue" && (
            <>
              <FIELD label="Nome" value={item.name} />
              <FIELD label="Città" value={item.city} />
              <FIELD label="Provincia" value={item.province} />
              <FIELD label="Indirizzo" value={item.address} />
              <FIELD label="Descrizione" value={item.description} />
              <FIELD label="Telefono" value={item.phone} />
              <FIELD label="Sito web" value={item.website} />
              <FIELD label="Instagram" value={item.instagram} />
              <FIELD label="Orari" value={item.opening_hours} />
              <FIELD
                label="Categoria"
                value={(item.categories || (item.category ? [item.category] : [])).filter(Boolean).join(", ")}
              />
              <FIELD label="Fascia prezzo" value={item.price_range} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <Label className="text-xs text-stone-500 mb-1 block">Latitudine (per mappa)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="45.4642"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="bg-stone-800/50 border-stone-700 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-500 mb-1 block">Longitudine (per mappa)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="9.1900"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="bg-stone-800/50 border-stone-700 h-9 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-1">Inserisci le coordinate per mostrare il marker nella posizione esatta sulla mappa.</p>
            </>
          )}
          {(type === "bartender" || type === "user") && (
            <>
              <FIELD label="Nome" value={item.full_name || item.name} />
              <FIELD label="Email" value={item.email} />
              {type === "bartender" && (
                <>
                  <FIELD label="Locale" value={item.custom_venue_name || item.venue_name} />
                  <FIELD label="Città" value={item.home_city || item.city} />
                  <FIELD label="Specializzazione" value={item.specialization} />
                  <FIELD label="Bio" value={item.bio} />
                  <FIELD label="Motivazione" value={item.motivation} />
                  <FIELD label="Filosofia" value={item.philosophy} />
                </>
              )}
              {type === "user" && (
                <>
                  <FIELD label="Bio breve" value={item.bio_light} />
                  <FIELD label="Città" value={item.home_city} />
                </>
              )}
            </>
          )}
        </div>

        {item.created_at && (
          <p className="text-xs text-stone-500 mt-4 pt-4 border-t border-stone-800">
            Inviato il {new Date(item.created_at).toLocaleString("it-IT")}
          </p>
        )}

        {/* Pulsanti */}
        {isPending !== false && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-stone-800">
            <Button
              onClick={() => {
                const extra = {};
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);
                if (!isNaN(lat)) extra.latitude = lat;
                if (!isNaN(lng)) extra.longitude = lng;
                onApprove?.(item, extra);
              }}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              APPROVA
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete?.(item)}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex-1"
            >
              ELIMINA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
