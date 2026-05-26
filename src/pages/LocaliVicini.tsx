import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type UserPosition = {
  lat: number;
  lng: number;
};

type LocaleRow = {
  id: string;
  nome: string | null;
  image_url?: string | null;
  image?: string | null;
  indirizzo?: string | null;
  latitudine?: number | string | null;
  longitudine?: number | string | null;
  rating?: number | string | null;
  qualita_drink?: number | string | null;
  competenza_staff?: number | string | null;
  atmosfera?: number | string | null;
  qualita_prezzo?: number | string | null;
};

type NearbyLocale = {
  id: string;
  nome: string;
  immagine: string | null;
  indirizzo: string;
  rating: number | null;
  distanzaKm: number;
};

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isLatitude(value: number) {
  return value >= -90 && value <= 90;
}

function isLongitude(value: number) {
  return value >= -180 && value <= 180;
}

function toKmDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function computeRating(locale: LocaleRow) {
  const direct = parseCoordinate(locale.rating);
  if (direct !== null) return Math.min(5, Math.max(0, direct));

  const values = [
    parseCoordinate(locale.qualita_drink),
    parseCoordinate(locale.competenza_staff),
    parseCoordinate(locale.atmosfera),
    parseCoordinate(locale.qualita_prezzo),
  ].filter((value): value is number => value !== null);

  if (!values.length) return null;
  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
  return Math.min(5, Math.max(0, avg));
}

export default function LocaliVicini() {
  const navigate = useNavigate();
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [locali, setLocali] = useState<NearbyLocale[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [loadingLocali, setLoadingLocali] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("La geolocalizzazione non e supportata su questo dispositivo.");
      setLoadingGeo(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingGeo(false);
      },
      () => {
        setGeoError("Impossibile ottenere la tua posizione. Verifica i permessi di geolocalizzazione.");
        setLoadingGeo(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    if (!userPosition) return;

    let active = true;

    async function loadNearby() {
      setLoadingLocali(true);
      setFetchError(null);

      const withRating = await supabase
        .from("Locali")
        .select(
          "id, nome, image_url, image, indirizzo, latitudine, longitudine, rating, qualita_drink, competenza_staff, atmosfera, qualita_prezzo"
        )
        .or("status.eq.approved,approvato.eq.true");

      const fallbackWithoutRating =
        withRating.error && String(withRating.error.message || "").toLowerCase().includes("rating")
          ? await supabase
              .from("Locali")
              .select(
                "id, nome, image_url, image, indirizzo, latitudine, longitudine, qualita_drink, competenza_staff, atmosfera, qualita_prezzo"
              )
              .or("status.eq.approved,approvato.eq.true")
          : null;

      const sourceData = (withRating.data || fallbackWithoutRating?.data || []) as LocaleRow[];
      const sourceError = withRating.error && !fallbackWithoutRating ? withRating.error : fallbackWithoutRating?.error;

      if (sourceError) {
        if (active) {
          setFetchError("Errore nel caricamento dei locali vicini.");
          setLocali([]);
          setLoadingLocali(false);
        }
        return;
      }

      const nearby = sourceData
        .map((locale) => {
          const rawLat = parseCoordinate(locale.latitudine);
          const rawLng = parseCoordinate(locale.longitudine);
          if (rawLat === null || rawLng === null) return null;

          let lat = rawLat;
          let lng = rawLng;

          // Gestisce casi con coordinate invertite inserite a mano.
          if (!isLatitude(lat) && isLatitude(lng) && isLongitude(lat)) {
            lat = rawLng;
            lng = rawLat;
          }

          if (!isLatitude(lat) || !isLongitude(lng)) return null;

          const distanzaKm = toKmDistance(userPosition.lat, userPosition.lng, lat, lng);
          if (distanzaKm > 5) return null;

          return {
            id: locale.id,
            nome: locale.nome?.trim() || "Locale premium",
            immagine: locale.image_url || locale.image || null,
            indirizzo: locale.indirizzo?.trim() || "Indirizzo non disponibile",
            rating: computeRating(locale),
            distanzaKm,
          } satisfies NearbyLocale;
        })
        .filter((locale): locale is NearbyLocale => locale !== null)
        .sort((a, b) => a.distanzaKm - b.distanzaKm);

      if (!active) return;
      setLocali(nearby);
      setLoadingLocali(false);
    }

    loadNearby();

    return () => {
      active = false;
    };
  }, [userPosition]);

  const loading = useMemo(() => loadingGeo || loadingLocali, [loadingGeo, loadingLocali]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
        color: "white",
        padding: "120px 20px 40px",
        overflowX: "hidden",
      }}
    >
      <style>{`
        .locali-vicini-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .locali-vicini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .locale-card {
          background: linear-gradient(155deg, rgba(11,20,51,0.96), rgba(7,14,37,0.98));
          border: 1px solid rgba(98,122,255,0.24);
          border-radius: 22px;
          box-shadow: 0 0 30px rgba(31,78,197,0.12), inset 0 1px 0 rgba(255,255,255,0.05);
          display: grid;
          grid-template-columns: 124px 1fr;
          gap: 14px;
          padding: 10px;
          color: #eef6ff;
          cursor: pointer;
          text-align: left;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .locale-card:hover {
          transform: translateY(-2px);
          border-color: rgba(74, 233, 255, 0.42);
          box-shadow: 0 0 28px rgba(42, 222, 255, 0.18);
        }

        .locale-card-image {
          width: 124px;
          height: 96px;
          border-radius: 14px;
          object-fit: cover;
          background: rgba(255, 255, 255, 0.06);
        }

        .locale-card-title {
          margin: 0;
          font-size: clamp(20px, 2.2vw, 26px);
          line-height: 1.1;
          color: #fff;
          font-weight: 800;
        }

        .locale-card-row {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(226, 236, 255, 0.82);
          font-size: clamp(13px, 1.35vw, 15px);
        }

        .locale-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(74, 233, 255, 0.45);
          background: rgba(8, 33, 58, 0.84);
          color: #84fff4;
          font-size: 12px;
          font-weight: 700;
          margin-top: 10px;
        }

        @media (max-width: 860px) {
          .locali-vicini-grid {
            grid-template-columns: 1fr;
          }

          .locale-card {
            grid-template-columns: 104px 1fr;
            gap: 10px;
          }

          .locale-card-image {
            width: 104px;
            height: 86px;
          }
        }

        @media (max-width: 520px) {
          .locali-vicini-page {
            padding: 100px 14px 34px !important;
          }
        }
      `}</style>

      <div className="locali-vicini-shell locali-vicini-page">
        <h1
          style={{
            fontSize: "clamp(34px, 5vw, 46px)",
            fontWeight: 900,
            marginBottom: 24,
          }}
        >
          Locali Vicini
        </h1>

        <button
          onClick={() => navigate("/lounge")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 22,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,180,255,0.5)",
            background: "rgba(0,180,255,0.12)",
            color: "#dff6ff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 0 14px rgba(0,180,255,0.2)",
          }}
        >
          ← Torna alla Lounge
        </button>

        {loading && (
          <p style={{ marginBottom: 16, opacity: 0.85 }}>
            Rilevamento posizione e ricerca locali entro 5 km...
          </p>
        )}

        {!loading && geoError && (
          <div
            style={{
              background: "linear-gradient(155deg, rgba(11,20,51,0.96), rgba(7,14,37,0.98))",
              border: "1px solid rgba(98,122,255,0.24)",
              borderRadius: 24,
              padding: 24,
              marginBottom: 18,
              boxShadow: "0 0 28px rgba(31,78,197,0.12)",
              color: "#fecaca",
              fontWeight: 600,
            }}
          >
            {geoError}
          </div>
        )}

        {!loading && !geoError && fetchError && (
          <div
            style={{
              background: "linear-gradient(155deg, rgba(11,20,51,0.96), rgba(7,14,37,0.98))",
              border: "1px solid rgba(98,122,255,0.24)",
              borderRadius: 24,
              padding: 24,
              marginBottom: 18,
              boxShadow: "0 0 28px rgba(31,78,197,0.12)",
              color: "#fecaca",
              fontWeight: 600,
            }}
          >
            {fetchError}
          </div>
        )}

        {!loading && !geoError && locali.length > 0 && (
          <div className="locali-vicini-grid">
            {locali.map((locale) => (
              <button
                key={locale.id}
                className="locale-card"
                onClick={() => navigate(`/venue/${locale.id}`)}
              >
                <img
                  src={locale.immagine || "/placeholder.webp"}
                  alt={locale.nome}
                  className="locale-card-image"
                />

                <div>
                  <h2 className="locale-card-title">{locale.nome}</h2>
                  <div className="locale-card-row">
                    <MapPin size={15} strokeWidth={2} />
                    <span>{locale.indirizzo}</span>
                  </div>
                  <div className="locale-card-row">
                    <span>{locale.distanzaKm.toFixed(2)} km</span>
                    <span>•</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Star size={14} strokeWidth={2} color="#f9d56e" />
                      {locale.rating !== null ? locale.rating.toFixed(1) : "n.d."}
                    </span>
                  </div>
                  <span className="locale-badge">Entro 5 km</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !geoError && locali.length === 0 && (
          <div
            style={{
              background: "linear-gradient(155deg, rgba(11,20,51,0.96), rgba(7,14,37,0.98))",
              border: "1px solid rgba(98,122,255,0.24)",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 0 28px rgba(31,78,197,0.12)",
              color: "#d9ecff",
              fontSize: "clamp(17px, 2.1vw, 22px)",
              fontWeight: 700,
            }}
          >
            Nessun locale premium trovato entro 5 km
          </div>
        )}
      </div>
    </div>
  );
}