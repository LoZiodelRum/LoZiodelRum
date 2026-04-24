
import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

type Venue = {
  id: string;
  nome: string;
  citta?: string | null;
  indirizzo?: string | null;
  descrizione?: string | null;
  image_url?: string | null;
  image?: string | null;
  lat?: number | null;
  lng?: number | null;
};

const defaultPosition: [number, number] = [41.9028, 12.4964]; // Roma centro Italia

export default function MapPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    setLoading(true);
    const { data, error } = await supabase
      .from("Locali")
      .select("id, nome, citta, indirizzo, descrizione, image_url, image, lat, lng")
      .eq("status", "approved");
    if (error) {
      setVenues([]);
      setLoading(false);
      return;
    }
    setVenues(data || []);
    setLoading(false);
  }

  // Custom marker icon (fix for default icon not showing)
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  return (
    <div className="page fade-in" style={{ width: "100vw", maxWidth: "100vw", padding: 0, margin: 0, background: "#111" }}>
      <Navbar />
      <h1 style={{ color: "#f5a623", margin: "18px 0 0 32px", zIndex: 1001, position: "relative" }}>Mappa Locali</h1>
      <div style={{ width: "100vw", height: "calc(100vh - 160px)", position: "relative", zIndex: 1 }}>
        {loading ? (
          <div style={{ color: "#fff", textAlign: "center", paddingTop: 80 }}>Caricamento mappa...</div>
        ) : (
          <MapContainer center={defaultPosition} zoom={6} style={{ width: "100%", height: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {venues.filter(v => v.lat && v.lng).map((venue) => (
              <Marker key={venue.id} position={[venue.lat!, venue.lng!]} icon={markerIcon}>
                <Popup minWidth={260} maxWidth={320}>
                  <div style={{ minWidth: 240, maxWidth: 300, padding: 0 }}>
                    <Link to={`/venue/${venue.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={venue.image_url || venue.image || "https://via.placeholder.com/200x140?text=Locale"}
                          alt={venue.nome}
                          style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: "#f5a623", marginBottom: 2 }}>{venue.nome}</div>
                          <div style={{ color: "#fff", fontSize: 14 }}>{venue.citta || ""}</div>
                          {venue.indirizzo && <div style={{ color: "#ccc", fontSize: 12 }}>{venue.indirizzo}</div>}
                        </div>
                      </div>
                      {venue.descrizione && (
                        <div style={{ color: "#e2e8f0", fontSize: 13, marginTop: 8, lineHeight: 1.3, maxHeight: 38, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {venue.descrizione}
                        </div>
                      )}
                      <div style={{ color: "#38bdf8", fontSize: 13, marginTop: 8, textAlign: "right" }}>Scopri di più →</div>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}