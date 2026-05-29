import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Navigation, Star } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default icon paths in Vite environment.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const customIcon = L.icon({
  iconUrl: "/marker.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

const userPositionIcon = L.divIcon({
  className: "dw-user-marker",
  html: '<span class="dw-user-marker-dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

type VenueRow = {
  id: string;
  nome: string;
  nome_en?: string | null;
  nome_bg?: string | null;
  citta?: string | null;
  indirizzo?: string | null;
  tipo_locale?: string | null;
  pacchetto?: string | null;
  livello?: string | null;
  rating?: number | string | null;
  qualita_drink?: number | string | null;
  competenza_staff?: number | string | null;
  atmosfera?: number | string | null;
  qualita_prezzo?: number | string | null;
  latitudine: number;
  longitudine: number;
  image_url?: string | null;
  image?: string | null;
};

type NearbyVenue = VenueRow & {
  distanceKm: number;
  priority: number;
  badgeLabel: "Exclusive" | "Premium" | "Network";
  badgeVariant: "exclusive" | "premium" | "network";
  computedRating: number | null;
};

type UserPosition = {
  lat: number;
  lng: number;
};

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function isLatitude(value: number) {
  return value >= -90 && value <= 90;
}

function isLongitude(value: number) {
  return value >= -180 && value <= 180;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

function getVenuePriority(venue: VenueRow) {
  const level = String(venue.pacchetto || venue.livello || "").toLowerCase();
  if (level.includes("exclusive")) return 1;
  if (level.includes("premium")) return 2;
  return 3;
}

function getBadgeByPriority(priority: number): NearbyVenue["badgeLabel"] {
  if (priority === 1) return "Exclusive";
  if (priority === 2) return "Premium";
  return "Network";
}

function getBadgeVariant(priority: number): NearbyVenue["badgeVariant"] {
  if (priority === 1) return "exclusive";
  if (priority === 2) return "premium";
  return "network";
}

function computeRating(venue: VenueRow) {
  const direct = parseCoordinate(venue.rating);
  if (direct !== null) return Math.min(5, Math.max(0, direct));

  const values = [
    parseCoordinate(venue.qualita_drink),
    parseCoordinate(venue.competenza_staff),
    parseCoordinate(venue.atmosfera),
    parseCoordinate(venue.qualita_prezzo),
  ].filter((value): value is number => value !== null);

  if (!values.length) return null;
  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
  return Math.min(5, Math.max(0, avg));
}

function MapCenterUpdater({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [usingFallbackPosition, setUsingFallbackPosition] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fallbackPosition: UserPosition = { lat: 40.8518, lng: 14.2681 };
  const radiusKm = 10;

  useEffect(() => {
    void fetchVenues();
  }, []);

  const requestUserPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoMessage(
        "Posizione non disponibile. Puoi comunque esplorare i locali del network."
      );
      setUserPosition(fallbackPosition);
      setUsingFallbackPosition(true);
      setLoadingGeo(false);
      return;
    }

    setLoadingGeo(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUsingFallbackPosition(false);
        setLoadingGeo(false);
      },
      () => {
        setGeoMessage(
          "Attiva la posizione per vedere i locali DrinkWise vicino a te."
        );
        setUserPosition(fallbackPosition);
        setUsingFallbackPosition(true);
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
    requestUserPosition();
  }, [requestUserPosition]);

  async function fetchVenues() {
    setLoadingVenues(true);
    setFetchError(null);

    const preferredQuery = await supabase
      .from("Locali")
      .select(
        "id, nome, nome_en, nome_bg, citta, indirizzo, tipo_locale, pacchetto, livello, rating, qualita_drink, competenza_staff, atmosfera, qualita_prezzo, latitudine, longitudine, image_url, image"
      )
      .or("status.eq.approved,approvato.eq.true");

    const fallbackQuery =
      preferredQuery.error &&
      String(preferredQuery.error.message || "").toLowerCase().includes("column")
        ? await supabase
            .from("Locali")
            .select(
              "id, nome, nome_en, nome_bg, citta, indirizzo, latitudine, longitudine, image_url, image"
            )
            .or("status.eq.approved,approvato.eq.true")
        : null;

    const sourceError =
      preferredQuery.error && !fallbackQuery
        ? preferredQuery.error
        : fallbackQuery?.error;
    const sourceData = (preferredQuery.data || fallbackQuery?.data || []) as any[];

    if (sourceError) {
      setFetchError("Errore nel caricamento della mappa. Riprova tra poco.");
      setVenues([]);
      setLoadingVenues(false);
      return;
    }

    const valid = sourceData
      .map((v: any) => {
        const rawLat = parseCoordinate(v.latitudine);
        const rawLng = parseCoordinate(v.longitudine);

        if (rawLat === null || rawLng === null) return null;

        let lat = rawLat;
        let lng = rawLng;

        // Handle common data-entry mistake where lat/lng are swapped.
        if (!isLatitude(lat) && isLatitude(lng) && isLongitude(lat)) {
          lat = rawLng;
          lng = rawLat;
        }

        if (!isLatitude(lat) || !isLongitude(lng)) return null;

        return {
          ...v,
          latitudine: lat,
          longitudine: lng,
        };
      })
      .filter((locale): locale is VenueRow => locale !== null);

    setVenues(valid);
    setLoadingVenues(false);
  }

  const nearbyVenues = useMemo(() => {
    if (!userPosition) return [] as NearbyVenue[];

    return venues
      .map((venue) => {
        const distanceKm = getDistanceKm(
          userPosition.lat,
          userPosition.lng,
          venue.latitudine,
          venue.longitudine
        );

        if (distanceKm > radiusKm) return null;

        const priority = getVenuePriority(venue);

        return {
          ...venue,
          distanceKm,
          priority,
          badgeLabel: getBadgeByPriority(priority),
          badgeVariant: getBadgeVariant(priority),
          computedRating: computeRating(venue),
        } satisfies NearbyVenue;
      })
      .filter((venue): venue is NearbyVenue => venue !== null)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.distanceKm - b.distanceKm;
      });
  }, [radiusKm, userPosition, venues]);

  const loading = loadingGeo || loadingVenues;

  return (
    <>
      <Navbar />
      <div className="map-page-root" style={{ minHeight: "100vh", padding: "86px 14px 130px", color: "#edf4ff", overflowX: "hidden" }}>
        <style>{`
          .map-page-shell {
            width: min(1040px, 100%);
            margin: 0 auto;
          }

          .map-main-box {
            background: #070d1a;
            border: 1px solid rgba(245, 166, 35, 0.35);
            box-shadow: 0 0 30px rgba(245, 166, 35, 0.12);
            border-radius: 28px;
            overflow: hidden;
            padding: 16px;
          }

          .map-title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
          }

          .map-title {
            margin: 0;
            font-size: clamp(26px, 4.6vw, 34px);
            line-height: 1.1;
            color: #ffffff;
          }

          .map-subtitle {
            margin: 4px 0 0;
            color: rgba(221, 231, 247, 0.88);
            font-size: clamp(14px, 2.2vw, 18px);
          }

          .map-recenter-btn {
            border: 1px solid rgba(245, 166, 35, 0.55);
            background: rgba(245, 166, 35, 0.15);
            color: #f5a623;
            border-radius: 999px;
            padding: 8px 12px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-weight: 700;
            white-space: nowrap;
          }

          .map-geo-alert {
            margin: 10px 0 14px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(15, 20, 36, 0.9);
            color: #e5edf9;
            padding: 10px 12px;
            font-size: 13px;
          }

          .map-viewport {
            height: clamp(360px, 52vh, 420px);
            width: 100%;
            border-radius: 22px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .map-viewport .leaflet-container {
            background: #061327;
          }

          .dw-user-marker {
            background: transparent;
          }

          .dw-user-marker-dot {
            display: block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #b8f3ff, #32d8ff);
            border: 2px solid rgba(255, 255, 255, 0.92);
            box-shadow: 0 0 18px rgba(50, 216, 255, 0.55);
          }

          .map-nearby-section {
            margin-top: 16px;
          }

          .map-nearby-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 0 4px;
          }

          .map-nearby-title {
            margin: 0;
            font-size: clamp(24px, 4.8vw, 32px);
            color: #ffffff;
          }

          .map-range-chip {
            border-radius: 999px;
            border: 1px solid rgba(245, 166, 35, 0.44);
            color: #f5a623;
            background: rgba(245, 166, 35, 0.12);
            font-size: 12px;
            font-weight: 700;
            padding: 6px 10px;
          }

          .map-venues-list {
            display: grid;
            gap: 10px;
          }

          .map-venue-card {
            background: rgba(12, 18, 34, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 22px rgba(0, 0, 0, 0.28);
            border-radius: 22px;
            padding: 14px;
            display: grid;
            grid-template-columns: 96px minmax(0, 1fr) auto;
            gap: 12px;
            color: #f6f9ff;
            text-align: left;
            cursor: pointer;
          }

          .map-venue-image {
            width: 96px;
            height: 76px;
            border-radius: 14px;
            object-fit: cover;
            background: rgba(255, 255, 255, 0.08);
          }

          .map-venue-name {
            margin: 0;
            font-size: clamp(20px, 4.8vw, 30px);
            line-height: 1.08;
            font-weight: 800;
          }

          .map-venue-meta,
          .map-venue-distance {
            margin: 5px 0 0;
            color: rgba(219, 229, 243, 0.84);
            font-size: clamp(13px, 2.8vw, 18px);
          }

          .map-venue-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: space-between;
            gap: 8px;
            min-width: 84px;
          }

          .map-venue-badge {
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid transparent;
          }

          .map-venue-badge.exclusive {
            background: rgba(245, 166, 35, 0.18);
            border-color: rgba(245, 166, 35, 0.65);
            color: #f5a623;
          }

          .map-venue-badge.premium {
            background: rgba(64, 224, 208, 0.14);
            border-color: rgba(64, 224, 208, 0.55);
            color: #40e0d0;
          }

          .map-venue-badge.network {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.14);
            color: #d8deea;
          }

          .map-open-cta {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 700;
            color: #8fd2ff;
          }

          .map-state-card {
            margin-top: 10px;
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(11, 17, 31, 0.9);
            color: #d9e6f8;
            padding: 14px;
          }

          .map-state-action {
            margin-top: 10px;
            border: 1px solid rgba(245, 166, 35, 0.55);
            background: rgba(245, 166, 35, 0.16);
            color: #ffd185;
            border-radius: 12px;
            padding: 8px 12px;
            font-weight: 700;
            cursor: pointer;
          }

          @media (max-width: 760px) {
            .map-page-root {
              padding: 84px 10px 138px !important;
            }

            .map-main-box {
              padding: 12px;
              border-radius: 24px;
            }

            .map-title-row {
              align-items: flex-start;
              gap: 8px;
            }

            .map-recenter-btn {
              font-size: 12px;
              padding: 7px 10px;
            }

            .map-venue-card {
              grid-template-columns: 92px minmax(0, 1fr);
            }

            .map-venue-right {
              grid-column: 2;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              min-width: 0;
            }
          }
        `}</style>

        <section className="map-page-shell">
          <div className="map-main-box">
            <div className="map-title-row">
              <div>
                <h1 className="map-title">Mappa DrinkWise</h1>
                <p className="map-subtitle">Locali nel raggio di 10 km</p>
              </div>

              <button className="map-recenter-btn" onClick={requestUserPosition}>
                <Navigation size={16} strokeWidth={2.3} />
                Usa la mia posizione
              </button>
            </div>

            {geoMessage && (
              <div className="map-geo-alert">
                {geoMessage}
                {usingFallbackPosition && " Fallback attivo su Napoli."}
              </div>
            )}

            <div className="map-viewport">
              {userPosition ? (
                <MapContainer
                  center={[userPosition.lat, userPosition.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <MapCenterUpdater lat={userPosition.lat} lng={userPosition.lng} zoom={13} />

                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                  />

                  <Marker position={[userPosition.lat, userPosition.lng]} icon={userPositionIcon}>
                    <Popup>Sei qui</Popup>
                  </Marker>

                  {nearbyVenues.map((venue) => (
                    <Marker
                      key={venue.id}
                      position={[venue.latitudine, venue.longitudine]}
                      icon={customIcon}
                    >
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          <div style={{ fontWeight: 800, marginBottom: 4 }}>
                            {getTranslatedField(venue as any, "nome", i18n.language, venue.nome || "Locale")}
                          </div>
                          <div style={{ fontSize: 13, opacity: 0.82, marginBottom: 8 }}>
                            {venue.citta || "Citta non disponibile"} · {formatDistance(venue.distanceKm)}
                          </div>
                          <button
                            onClick={() => navigate(`/venue/${venue.id}`)}
                            style={{
                              border: "1px solid rgba(245, 166, 35, 0.52)",
                              background: "rgba(245, 166, 35, 0.12)",
                              color: "#b66f00",
                              borderRadius: 10,
                              padding: "6px 10px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Apri scheda
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  <ZoomControl position="bottomright" />
                </MapContainer>
              ) : (
                <div className="map-state-card" style={{ margin: 12 }}>
                  Sto cercando i locali DrinkWise vicino a te...
                </div>
              )}
            </div>

            {fetchError && <div className="map-state-card">{fetchError}</div>}
          </div>

          <section className="map-nearby-section">
            <div className="map-nearby-header">
              <h2 className="map-nearby-title">Locali vicino a te</h2>
              <span className="map-range-chip">10 km</span>
            </div>

            {loading && (
              <div className="map-state-card">
                Sto cercando i locali DrinkWise vicino a te...
              </div>
            )}

            {!loading && nearbyVenues.length > 0 && (
              <div className="map-venues-list">
                {nearbyVenues.map((venue) => {
                  const displayName = getTranslatedField(
                    venue as any,
                    "nome",
                    i18n.language,
                    venue.nome || "Locale DrinkWise"
                  );
                  const venueType = venue.tipo_locale?.trim() || "Locale";
                  const city = venue.citta?.trim() || "Citta non disponibile";
                  const image =
                    venue.image_url ||
                    venue.image ||
                    "https://via.placeholder.com/320x200?text=DrinkWise";

                  return (
                    <button
                      key={venue.id}
                      className="map-venue-card"
                      onClick={() => navigate(`/venue/${venue.id}`)}
                    >
                      <img src={image} alt={displayName} className="map-venue-image" />

                      <div>
                        <h3 className="map-venue-name">{displayName}</h3>
                        <p className="map-venue-meta">
                          {city} · {venueType}
                        </p>
                        <p className="map-venue-distance">{formatDistance(venue.distanceKm)} da te</p>
                        {venue.computedRating !== null && (
                          <p className="map-venue-distance" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Star size={14} strokeWidth={2.2} color="#f5c264" />
                            {venue.computedRating.toFixed(1)}
                          </p>
                        )}
                      </div>

                      <div className="map-venue-right">
                        <span className={`map-venue-badge ${venue.badgeVariant}`}>{venue.badgeLabel}</span>
                        <span className="map-open-cta">
                          Apri scheda
                          <ChevronRight size={16} strokeWidth={2.2} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && nearbyVenues.length === 0 && (
              <div className="map-state-card">
                <div style={{ fontWeight: 800, marginBottom: 4 }}>
                  Nessun locale DrinkWise entro 10 km
                </div>
                <div style={{ opacity: 0.88 }}>
                  Stiamo espandendo il network nella tua zona.
                </div>
                <button className="map-state-action" onClick={() => navigate("/venues")}>
                  Esplora tutti i locali
                </button>
              </div>
            )}
          </section>
        </section>
      </div>
    </>
  );
}
