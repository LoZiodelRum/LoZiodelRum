import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import { X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔧 FIX fondamentale Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// ✅ MARKER PERSONALIZZATO
const customIcon = L.icon({
  iconUrl: "/marker.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.9028, 12.4964]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

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

  return (
    <>
      <Navbar />
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
              click: () => setSelectedVenue(venue)
            }}
          />
        ))}

        {/* ✅ Zoom control corretto */}
        <ZoomControl position="bottomleft" />
        {/* Anteprima compatta sopra il marker selezionato */}
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
              alignItems: "center"
            }}
            onClick={() => window.location.href = `/venue/${selectedVenue.id}`}
          >
            <button
              onClick={e => { e.stopPropagation(); setSelectedVenue(null); }}
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
                cursor: "pointer"
              }}
              title="Chiudi"
            >
              <X size={18} />
            </button>
            <img
              src={selectedVenue.image_url || "/fallback.jpg"}
              alt={selectedVenue.nome}
              style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
            />
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{selectedVenue.nome}</div>
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