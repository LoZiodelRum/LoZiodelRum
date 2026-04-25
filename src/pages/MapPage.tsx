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

      {/* SEARCH */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        gap: 10
      }}>
        <input
          placeholder="Cerca città o locale..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#111",
            color: "#fff"
          }}
        />

        <button
          onClick={() => setSearchQuery("")}
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#222",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Reset
        </button>
      </div>

      {/* MAPPA */}
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {filteredVenues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitudine, venue.longitudine]}
            icon={customIcon}
            eventHandlers={{
              click: () => setSelectedVenue(venue),
            }}
          >
            <Popup>
              <div>
                <strong>{venue.nome}</strong>
                <div>
                  {venue.indirizzo}, {venue.citta}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* CONTATORE */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "#000",
        padding: "10px",
        borderRadius: "8px",
        color: "#fff",
        zIndex: 1000
      }}>
        {filteredVenues.length} locali
      </div>

      {/* CARD DETTAGLIO (popup custom centrato sopra il marker selezionato) */}
      {selectedVenue && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: 90, // poco sopra il marker
          transform: "translateX(-50%)",
          width: 320,
          background: "#000",
          color: "#fff",
          padding: 15,
          borderRadius: 12,
          zIndex: 1000,
          boxShadow: "0 4px 24px #000a"
        }}>
          <button onClick={() => setSelectedVenue(null)} style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#f5a623",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            width: 32,
            height: 32,
            fontSize: 20,
            cursor: "pointer"
          }}>
            <X />
          </button>

          <img
            src={selectedVenue.image_url || "/fallback.jpg"}
            style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }}
          />

          <h3 style={{ margin: "16px 0 4px 0" }}>{selectedVenue.nome}</h3>

          <p style={{ margin: 0, fontSize: 15 }}>
            {selectedVenue.indirizzo}, {selectedVenue.citta}
          </p>

          <Link to={`/locale/${selectedVenue.id}`}>
            <button style={{
              marginTop: 16,
              background: "#f5a623",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}>Apri scheda</button>
          </Link>
        </div>
      )}
    </div>
  );
}