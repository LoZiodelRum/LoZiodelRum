import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import { X } from "lucide-react";
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

type Venue = {
  id: string;
  nome: string;
  nome_en?: string;
  nome_bg?: string;
  citta: string;
  indirizzo?: string;
  latitudine: number;
  longitudine: number;
  image_url?: string;
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

export default function MapPage() {
  const { i18n } = useTranslation();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    void fetchVenues();
  }, []);

  async function fetchVenues() {
    const { data } = await supabase
      .from("Locali")
      .select("id, nome, nome_en, nome_bg, citta, indirizzo, descrizione, descrizione_en, descrizione_bg, latitudine, longitudine, image_url");

    console.log("LOCALI TOTALI DB:", data);
    console.log("NUMERO LOCALI:", data?.length);

    if (!data) return;

    const valid = data
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
      .filter((locale): locale is Venue => locale !== null);

    setVenues(valid);
  }

  return (
    <>
      <Navbar />
      <div style={{ height: "100vh", position: "relative" }}>
        <MapContainer
          center={[42.5, 12.5]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {venues.map((venue) => {
            console.log("MARKER:", venue.nome, venue.latitudine, venue.longitudine);
            return (
              <Marker
                key={venue.id}
                position={[venue.latitudine, venue.longitudine]}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedVenue(venue),
                }}
              />
            );
          })}

          <ZoomControl position="bottomleft" />

          {selectedVenue && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 90,
                transform: "translateX(-50%)",
                width: 220,
                background: "#000",
                color: "#fff",
                padding: 10,
                borderRadius: 10,
                zIndex: 1200,
                boxShadow: "0 2px 12px #000a",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              onClick={() => {
                window.location.href = `/venue/${selectedVenue.id}`;
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVenue(null);
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "#f5a623",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  width: 28,
                  height: 28,
                  fontSize: 16,
                  cursor: "pointer",
                }}
                title="Chiudi"
              >
                <X size={18} />
              </button>
              <img
                src={selectedVenue.image_url || "/fallback.jpg"}
                alt={getTranslatedField(selectedVenue as any, "nome", i18n.language, "-")}
                style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
              />
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>
                {getTranslatedField(selectedVenue as any, "nome", i18n.language, "-")}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, textAlign: "center" }}>
                {selectedVenue.indirizzo}, {selectedVenue.citta}
              </div>
            </div>
          )}
        </MapContainer>
      </div>
    </>
  );
}
