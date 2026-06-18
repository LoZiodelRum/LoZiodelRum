import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import { AttributionControl, MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";
import { useLocationContext } from "../context/LocationContext";

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
  className: "dw-user-position-marker",
  html: '<div class="dw-user-position-dot"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

type VenueRow = {
  id: string;
  nome: string;
  nome_en?: string | null;
  nome_de?: string | null;
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
  badgeKey: "exclusive" | "premium" | "network";
  badgeVariant: "exclusive" | "premium" | "network";
  computedRating: number | null;
};

type UserPosition = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: UserPosition = {
  lat: 40.8518,
  lng: 14.2681,
};

const CACHED_VENUES_STORAGE_KEY = "drinkwise_cached_venues";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

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

function getBadgeKeyByPriority(priority: number): NearbyVenue["badgeKey"] {
  if (priority === 1) return "exclusive";
  if (priority === 2) return "premium";
  return "network";
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

function resolveVenueImage(venue: VenueRow) {
  const anyVenue = venue as any;
  return (
    venue.image_url ||
    venue.image ||
    anyVenue.immagine ||
    anyVenue.foto ||
    anyVenue.cover ||
    anyVenue.cover_url ||
    anyVenue.logo ||
    anyVenue.media_url ||
    null
  );
}

function normalizeVenueRows(rows: any[]): VenueRow[] {
  return rows
    .map((v: any) => {
      const rawLat = parseCoordinate(
        v.latitudine ?? v.latitude ?? v.lat ?? v.Latitudine ?? v.Latitude
      );
      const rawLng = parseCoordinate(
        v.longitudine ?? v.longitude ?? v.lng ?? v.Longitudine ?? v.Longitude
      );

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
}

function readCachedVenues() {
  if (!canUseStorage()) return [] as VenueRow[];

  try {
    const raw = window.localStorage.getItem(CACHED_VENUES_STORAGE_KEY);
    if (!raw) return [] as VenueRow[];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [] as VenueRow[];
    return normalizeVenueRows(parsed);
  } catch {
    return [] as VenueRow[];
  }
}

function writeCachedVenues(venues: VenueRow[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(CACHED_VENUES_STORAGE_KEY, JSON.stringify(venues));
  } catch {
    // Ignore storage write failures.
  }
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    map.setView([lat, lng], zoom);
    setInitialized(true);
  }, [lat, lng, zoom, map, initialized]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("map");
  const {
    userPosition,
    hasRealPosition,
    hasSavedPosition,
    locationStatus,
    locationError,
    refreshLocation,
  } = useLocationContext();
  const cachedVenues = useMemo(() => readCachedVenues(), []);

  const [venues, setVenues] = useState<VenueRow[]>(cachedVenues);
  const [loadingVenues, setLoadingVenues] = useState(cachedVenues.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const radiusKm = 10;
  const savedPosition = useMemo(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem("drinkwise_last_position");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown; timestamp?: unknown };
      const lat = Number(parsed.lat);
      const lng = Number(parsed.lng);
      const timestamp = Number(parsed.timestamp);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      return {
        lat,
        lng,
        timestamp: Number.isFinite(timestamp) ? timestamp : 0,
      };
    } catch {
      return null;
    }
  }, [hasSavedPosition]);
  const effectiveUserPosition = useMemo(() => {
    if (userPosition && Number.isFinite(userPosition.timestamp) && userPosition.timestamp > 0) {
      return userPosition;
    }

    if (savedPosition && Number.isFinite(savedPosition.timestamp) && savedPosition.timestamp > 0) {
      return savedPosition;
    }

    return null;
  }, [savedPosition, userPosition]);
  const shouldShowUserMarker =
    Boolean(effectiveUserPosition) &&
    typeof effectiveUserPosition?.lat === "number" &&
    typeof effectiveUserPosition?.lng === "number";

  useEffect(() => {
    void fetchVenues();
  }, []);

  async function fetchVenues() {
    if (!venues.length) {
      setLoadingVenues(true);
    }
    setFetchError(null);

    const { data, error } = await supabase
      .from("Locali")
      .select("*")
      .or("status.eq.approved,approvato.eq.true")
      .order("nome", { ascending: true });

    console.log("MAPPA - dati Supabase grezzi:", data);
    console.log("MAPPA - errore Supabase:", error);

    if (error) {
      setFetchError(t("map.loadError"));
      setLoadingVenues(false);
      setVenues([]);
      return;
    }

    const valid = normalizeVenueRows((data || []) as any[]);

    setVenues(valid);
    writeCachedVenues(valid);
    setLoadingVenues(false);
  }

  const getVenueLat = (venue: any) => {
    const value =
      venue.latitudine ??
      venue.latitude ??
      venue.lat ??
      venue.Latitudine ??
      venue.Latitude;

    const num = Number(String(value).replace(",", "."));
    return Number.isFinite(num) ? num : null;
  };

  const getVenueLng = (venue: any) => {
    const value =
      venue.longitudine ??
      venue.longitude ??
      venue.lng ??
      venue.Longitudine ??
      venue.Longitude;

    const num = Number(String(value).replace(",", "."));
    return Number.isFinite(num) ? num : null;
  };

  const venuesWithCoords = useMemo(
    () =>
      venues
        .map((venue: any) => ({
          ...venue,
          markerLat: getVenueLat(venue),
          markerLng: getVenueLng(venue),
        }))
        .filter(
          (venue: any) =>
            venue.markerLat !== null &&
            venue.markerLng !== null
        ),
    [venues]
  );

  const nearbyVenues = useMemo(() => {
    if (!effectiveUserPosition) return [] as NearbyVenue[];

    return venuesWithCoords
      .map((venue: any) => {
        const priority = getVenuePriority(venue);
        const distanceKm = getDistanceKm(
          effectiveUserPosition.lat,
          effectiveUserPosition.lng,
          venue.markerLat,
          venue.markerLng
        );

        return {
          ...venue,
          distanceKm,
          priority,
          badgeKey: getBadgeKeyByPriority(priority),
          badgeVariant: getBadgeVariant(priority),
          computedRating: computeRating(venue),
        } satisfies NearbyVenue;
      })
      .filter((venue: any) => venue.distanceKm <= radiusKm)
      .filter((venue): venue is NearbyVenue => venue !== null)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.distanceKm - b.distanceKm;
      });
  }, [effectiveUserPosition, radiusKm, venuesWithCoords]);

  useEffect(() => {
    console.log("MAPPA - locali in state:", venues.length);
  }, [venues.length]);

  useEffect(() => {
    console.log("MAPPA - locali con coordinate:", venuesWithCoords.length);
  }, [venuesWithCoords.length]);

  useEffect(() => {
    console.log("MAPPA - locali entro 10 km:", nearbyVenues.length);
  }, [nearbyVenues.length]);

  const showSkeletons = loadingVenues && venues.length === 0;
  const statusMessage =
    locationStatus === "checking"
      ? t("map.refreshingLocation")
      : locationStatus === "requesting"
        ? t("map.requestingLocation")
        : locationStatus === "denied" && !effectiveUserPosition
          ? t("map.enableLocationMessage")
          : null;

  return (
    <>
      <Navbar />
      <div className="map-page-root" style={{ minHeight: "100vh", padding: "15px 12px 138px", color: "#edf4ff", overflowX: "hidden" }}>
        <style>{`
          .map-page-shell {
            width: min(1040px, 100%);
            margin: 0 auto;
          }

          .map-main-box {
            background: #070d1a;
            border: 1px solid rgba(116, 157, 255, 0.22);
            box-shadow: 0 0 28px rgba(55, 98, 190, 0.18);
            border-radius: 26px;
            overflow: hidden;
            padding: 14px;
          }

          .map-title-row {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 12px;
            margin-bottom: 10px;
          }

          .map-position-cta {
            margin-left: auto;
            border: 1px solid rgba(45, 212, 255, 0.55);
            background: rgba(45, 212, 255, 0.12);
            color: #c6f5ff;
            border-radius: 999px;
            padding: 7px 10px;
            font-size: 12px;
            font-weight: 700;
            line-height: 1;
            cursor: pointer;
            white-space: nowrap;
          }

          .map-position-cta:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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
            font-size: clamp(13px, 2vw, 16px);
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
            height: clamp(340px, 49vh, 404px);
            width: 100%;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .map-viewport .leaflet-container {
            background: #061327;
          }

          .leaflet-control-attribution {
            font-size: 9px !important;
            line-height: 1.2 !important;
            padding: 2px 5px !important;
            background: rgba(255, 255, 255, 0.55) !important;
            color: rgba(0, 0, 0, 0.55) !important;
            border-radius: 8px 0 0 0 !important;
          }

          .leaflet-control-attribution a {
            color: rgba(0, 0, 0, 0.65) !important;
            text-decoration: none !important;
          }

          .dw-map-popup {
            width: 260px;
            display: flex;
            gap: 12px;
            align-items: center;
            background: #ffffff;
            color: #111827;
          }

          .dw-map-popup-image-wrap {
            width: 74px;
            height: 74px;
            border-radius: 16px;
            overflow: hidden;
            flex-shrink: 0;
            background: #0b1220;
          }

          .dw-map-popup-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .dw-map-popup-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a2236, #070d1a);
            color: #f5a623;
            font-size: 12px;
            font-weight: 800;
          }

          .dw-map-popup-content {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
          }

          .dw-map-popup-content strong {
            font-size: 15px;
            line-height: 1.15;
            color: #111827;
          }

          .dw-map-popup-content span {
            font-size: 13px;
            color: #6b7280;
          }

          .dw-map-popup-content button {
            width: fit-content;
            border: 1px solid rgba(245, 166, 35, 0.55);
            background: rgba(245, 166, 35, 0.08);
            color: #a16207;
            border-radius: 10px;
            padding: 7px 12px;
            font-weight: 800;
            cursor: pointer;
          }

          .dw-user-position-marker {
            background: transparent !important;
            border: none !important;
          }

          .dw-user-position-dot {
            width: 24px;
            height: 24px;
            border-radius: 999px;
            background: #2dd4ff;
            border: 4px solid #ffffff;
            box-shadow:
              0 0 0 8px rgba(45, 212, 255, 0.25),
              0 0 28px rgba(45, 212, 255, 0.85);
          }

          .map-nearby-section {
            margin-top: 14px;
          }

          .map-nearby-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 0 4px;
          }

          .map-nearby-title {
            margin: 0;
            font-size: clamp(24px, 4.8vw, 32px);
            color: #ffffff;
          }

          .map-skeleton-card {
            background: rgba(12, 18, 34, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 12px;
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr) 82px;
            gap: 11px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.22);
          }

          .map-skeleton-image,
          .map-skeleton-line,
          .map-skeleton-badge {
            border-radius: 12px;
            background: linear-gradient(90deg, rgba(146, 163, 186, 0.12), rgba(173, 190, 214, 0.22), rgba(146, 163, 186, 0.12));
            background-size: 220% 100%;
            animation: map-shimmer 1.25s linear infinite;
          }

          .map-skeleton-image {
            width: 92px;
            height: 70px;
          }

          .map-skeleton-lines {
            display: grid;
            align-content: center;
            gap: 8px;
          }

          .map-skeleton-line {
            height: 11px;
          }

          .map-skeleton-line.short {
            width: 58%;
          }

          .map-skeleton-badge {
            height: 24px;
            align-self: center;
          }

          @keyframes map-shimmer {
            0% {
              background-position: 220% 0;
            }
            100% {
              background-position: -220% 0;
            }
          }

          .map-venue-card {
            background: rgba(12, 18, 34, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 22px rgba(0, 0, 0, 0.28);
            border-radius: 20px;
            padding: 12px;
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr) auto;
            gap: 11px;
            color: #f6f9ff;
            text-align: left;
            cursor: pointer;
          }

          .map-venue-image {
            width: 92px;
            height: 70px;
            border-radius: 12px;
            object-fit: cover;
            background: rgba(255, 255, 255, 0.08);
          }

          .map-venue-name {
            margin: 0;
            font-size: clamp(16px, 4.6vw, 24px);
            line-height: 1.12;
            font-weight: 800;
          }

          .map-venue-meta,
          .map-venue-distance {
            margin: 5px 0 0;
            color: rgba(219, 229, 243, 0.84);
            font-size: clamp(12px, 2.6vw, 15px);
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
              padding: 0px 10px 146px !important;
            }

            .map-main-box {
              padding: 12px;
              border-radius: 24px;
            }

            .map-title-row {
              align-items: flex-start;
              gap: 8px;
            }

            .map-venue-card {
              grid-template-columns: 86px minmax(0, 1fr);
            }

            .map-skeleton-card {
              grid-template-columns: 86px minmax(0, 1fr);
            }

            .map-skeleton-image {
              width: 86px;
              height: 66px;
            }

            .map-skeleton-badge {
              display: none;
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
                <h1 className="map-title">{t("map.title")}</h1>
              </div>
              <button
                type="button"
                className="map-position-cta"
                onClick={refreshLocation}
                disabled={locationStatus === "checking" || locationStatus === "requesting"}
              >
                {t("map.useLocation")}
              </button>
            </div>

            {(locationError && locationStatus !== "denied") && (
              <div className="map-geo-alert">
                {locationError}
              </div>
            )}

            <div className="map-viewport">
              <MapContainer
                center={[effectiveUserPosition?.lat || DEFAULT_CENTER.lat, effectiveUserPosition?.lng || DEFAULT_CENTER.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl={false}
                preferCanvas={true}
                scrollWheelZoom={true}
              >
                <MapCenterUpdater
                  lat={effectiveUserPosition?.lat || DEFAULT_CENTER.lat}
                  lng={effectiveUserPosition?.lng || DEFAULT_CENTER.lng}
                  zoom={13}
                />

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OSM</a>'
                />

                <AttributionControl position="bottomright" prefix={false} />

                {shouldShowUserMarker && effectiveUserPosition && (
                  <Marker position={[effectiveUserPosition.lat, effectiveUserPosition.lng]} icon={userPositionIcon} zIndexOffset={1000}>
                    <Popup>{t("map.youAreHere")}</Popup>
                  </Marker>
                )}

                {venuesWithCoords.map((venue: any) => {
                  const popupImage = resolveVenueImage(venue);
                  const distanceKm = getDistanceKm(
                    (effectiveUserPosition || userPosition).lat,
                    (effectiveUserPosition || userPosition).lng,
                    venue.markerLat,
                    venue.markerLng
                  );

                  return (
                    <Marker
                      key={venue.id}
                      position={[venue.markerLat, venue.markerLng]}
                      icon={customIcon}
                    >
                      <Popup>
                        <div className="dw-map-popup">
                          <div className="dw-map-popup-image-wrap">
                            {popupImage ? (
                              <img
                                src={popupImage}
                                alt={getTranslatedField(venue as any, "nome", i18n.language, venue.nome || t("map.venueFallback"))}
                                className="dw-map-popup-image"
                                loading="lazy"
                              />
                            ) : (
                              <div className="dw-map-popup-placeholder">DrinkWise</div>
                            )}
                          </div>

                          <div className="dw-map-popup-content">
                            <strong>
                              {getTranslatedField(venue as any, "nome", i18n.language, venue.nome || t("map.venueFallback"))}
                            </strong>
                            <span>
                              {(venue.citta || t("map.cityFallback"))} · {formatDistance(distanceKm)}
                            </span>
                            <button onClick={() => navigate(`/venue/${venue.id}`)}>
                              {t("map.openVenue")}
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                <ZoomControl position="bottomright" />
              </MapContainer>
            </div>

            {fetchError && <div className="map-state-card">{fetchError}</div>}
          </div>

          <section className="map-nearby-section">
            <div className="map-nearby-header">
      <h2
  className="map-nearby-title"
  style={{
    fontSize: "24px",
    margin: 0,
  }}
>
  Locali vicini
</h2>
            </div>

            {statusMessage && <p className="map-status-label">{statusMessage}</p>}

            {showSkeletons && (
              <div className="map-state-card">
                <div style={{ marginBottom: 12 }}>{t("map.updatingNearby")}</div>
                <div className="map-venues-list">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="map-skeleton-card" aria-hidden="true">
                      <div className="map-skeleton-image" />
                      <div className="map-skeleton-lines">
                        <div className="map-skeleton-line" />
                        <div className="map-skeleton-line short" />
                        <div className="map-skeleton-line" />
                      </div>
                      <div className="map-skeleton-badge" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nearbyVenues.length > 0 && (
              <div className="map-venues-list">
                {nearbyVenues.map((venue) => {
                  const displayName = getTranslatedField(
                    venue as any,
                    "nome",
                    i18n.language,
                    venue.nome || t("map.venueFallback")
                  );
                  const venueType = venue.tipo_locale?.trim() || t("map.venueFallback");
                  const city = venue.citta?.trim() || t("map.cityFallback");
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
                      <img src={image} alt={displayName} className="map-venue-image" loading="lazy" />

                      <div>
                        <h3 className="map-venue-name">{displayName}</h3>
                        <p className="map-venue-meta">
                          {city} · {venueType}
                        </p>
                        <p className="map-venue-distance">
                          {t("map.distanceFromYou", { distance: formatDistance(venue.distanceKm) })}
                        </p>
                        {venue.computedRating !== null && (
                          <p className="map-venue-distance" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Star size={14} strokeWidth={2.2} color="#f5c264" />
                            {venue.computedRating.toFixed(1)}
                          </p>
                        )}
                      </div>

                      <div className="map-venue-right">
                        <span className={`map-venue-badge ${venue.badgeVariant}`}>{t(`map.badges.${venue.badgeKey}`)}</span>
                        <span className="map-open-cta">
                          {t("map.openVenue")}
                          <ChevronRight size={16} strokeWidth={2.2} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!showSkeletons && venuesWithCoords.length === 0 && (
              <div className="map-state-card">
                <div style={{ fontWeight: 800, marginBottom: 4 }}>
                  {t("map.noCoordinatesTitle")}
                </div>
                <div style={{ opacity: 0.88 }}>
                  {t("map.noCoordinatesDescription")}
                </div>
              </div>
            )}

            {!showSkeletons && venuesWithCoords.length > 0 && nearbyVenues.length === 0 && (
              <div className="map-state-card">
                {effectiveUserPosition ? (
                  <>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>
                      {t("map.noNearbyTitle", { radius: radiusKm })}
                    </div>
                    <div style={{ opacity: 0.88 }}>
                      {t("map.noNearbyDescription")}
                    </div>
                    <button className="map-state-action" onClick={() => navigate("/venues")}>
                      {t("map.exploreAll")}
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>
                      {t("map.enableLocationMessage")}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </section>
      </div>
    </>
  );
}
