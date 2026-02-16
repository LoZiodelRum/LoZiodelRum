/**
 * AdminCard – Visualizzatore universale per verifica profili pending.
 * Mostra campi testuali, foto profilo e video (solo locali).
 * Pulsanti: APPROVA (status → approved) e ELIMINA (rimuove record).
 */
import { MapPin, Phone, Globe, Instagram, Clock, User, Wine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FIELD = ({ label, value }) =>
  value != null && value !== "" ? (
    <div className="mb-3">
      <p className="text-xs text-stone-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-stone-200">{String(value)}</p>
    </div>
  ) : null;

export default function AdminCard({ type, item, onApprove, onDelete, onClose, isPending }) {
  if (!item) return null;

  const imgUrl = type === "venue" ? item.cover_image : (item.photo || item.image_url);
  const videoUrl = type === "venue" ? item.video_url : null;

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

        {/* Foto profilo / cover */}
        {imgUrl && (
          <div className="mb-4">
            <img
              src={imgUrl}
              alt={item.name || "Preview"}
              className="w-full max-w-xs h-40 object-cover rounded-xl"
            />
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
              <FIELD label="Indirizzo" value={item.address} />
              <FIELD label="Descrizione" value={item.description} />
              <FIELD label="Telefono" value={item.phone} />
              <FIELD label="Sito web" value={item.website} />
              <FIELD label="Instagram" value={item.instagram} />
              <FIELD label="Orari" value={item.opening_hours} />
              <FIELD label="Categoria" value={item.category} />
              <FIELD label="Fascia prezzo" value={item.price_range} />
            </>
          )}
          {(type === "bartender" || type === "user") && (
            <>
              <FIELD label="Nome" value={item.name} />
              {type === "bartender" && <FIELD label="Cognome" value={item.surname} />}
              <FIELD label="Email" value={item.email} />
              {type === "bartender" && (
                <>
                  <FIELD label="Locale" value={item.custom_venue_name || item.venue_name} />
                  <FIELD label="Città" value={item.city} />
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
              onClick={() => onApprove?.(item)}
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
