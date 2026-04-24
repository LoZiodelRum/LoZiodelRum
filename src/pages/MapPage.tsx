import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../lib/supabaseClient";

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
    <div className="page fade-in" style={{ width: "100vw", maxWidth: "100vw", padding: 0, margin: 0 }}>
      <Navbar />
      <h1 style={{ color: "#f5a623", margin: "18px 0 0 18px", zIndex: 1001, position: "relative" }}>Mappa Locali</h1>
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
                <Popup>
                  <div style={{ minWidth: 120 }}>
                    <b>{venue.nome}</b>
                    <br />
                    {venue.citta || ""}
                    <br />
                    {venue.indirizzo || ""}
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