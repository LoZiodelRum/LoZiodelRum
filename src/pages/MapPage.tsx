import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, X, List, Map as MapIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔧 FIX fondamentale Leaflet (senza questo i marker si rompono)
delete (L.Icon.Default.prototype as any)._getIconUrl;

// ✅ MARKER PERSONALIZZATO
const customIcon = L.icon({
  iconUrl: "/marker.png",
  iconSize: [48, 48], // proporzione perfetta per PNG 1024x1024
  iconAnchor: [24, 48], // centro base
  popupAnchor: [0, -48] // popup centrato sopra
});

type Venue = {
  id: string;
  nome: string;
  citta: string;
  indirizzo?: string;
  latitudine: number;
  longitudine: number;
  image_url?: string;
};

export default function MapPage() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.9028, 12.4964]);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    const { data } = await supabase
      .from("Locali")
      .select("id, nome, citta, indirizzo, latitudine, longitudine, image_url");

    if (!data) return;

    const valid = data
      .map((v: any) => {
        const lat = Number(String(v.latitudine).replace(",", "."));
        const lng = Number(String(v.longitudine).replace(",", "."));

        if (isNaN(lat) || isNaN(lng)) return null;

        return {
          ...v,
          latitudine: lat,
          longitudine: lng
        };
      })
      .filter(Boolean) as Venue[];

    setVenues(valid);

    if (valid.length > 0) {
      setMapCenter([valid[0].latitudine, valid[0].longitudine]);
    }
  }

  const filteredVenues = venues.filter(v =>
    !searchQuery ||
    v.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.citta?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitudine, venue.longitudine]}
            icon={customIcon}
            eventHandlers={{
              click: () => window.location.href = `/locale/${venue.id}`
            }}
          >
            {/* Anteprima sopra il marker */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -120,
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
                alignItems: "center"
              }}
              onClick={() => window.location.href = `/locale/${venue.id}`}
            >
              <img
                src={venue.image_url || "/fallback.jpg"}
                alt={venue.nome}
                style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
              />
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{venue.nome}</div>
              <div style={{ fontSize: 13, opacity: 0.8, textAlign: "center" }}>
                {venue.indirizzo}, {venue.citta}
              </div>
            </div>
          </Marker>
        ))}
        {/* Zoom control in basso a sinistra */}
        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}