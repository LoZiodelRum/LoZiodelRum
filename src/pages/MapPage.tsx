

import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import orangeMarkerImg from "../assets/orange-marker-no-border.png";

const markerIcon = new L.Icon({
  iconUrl: orangeMarkerImg,
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: "custom-orange-marker"
});

type Locale = {
  id: string;
  nome: string;
  citta: string;
  indirizzo?: string | null;
  image_url?: string | null;
  latitudine: number | string | null;
  longitudine: number | string | null;
};

export default function MapPage() {
  const [locali, setLocali] = useState<Locale[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocali();
  }, []);

  async function fetchLocali() {
    const { data } = await supabase
      .from("Locali")
      .select("id, nome, citta, indirizzo, image_url, latitudine, longitudine");
    setLocali(data || []);
  }

  function getCoords(l: Locale): [number, number] | null {
    if (l.latitudine === null || l.latitudine === undefined || l.latitudine === "") return null;
    if (l.longitudine === null || l.longitudine === undefined || l.longitudine === "") return null;

    const latRaw = String(l.latitudine).replace(",", ".").trim();
    const lngRaw = String(l.longitudine).replace(",", ".").trim();

    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (isNaN(lat) || isNaN(lng)) return null;

    return [lat, lng];
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "transparent" }}>
      <Navbar />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, height: "calc(100vh - 70px)", width: "100vw", zIndex: 1 }}>
        <MapContainer
          center={[41.9028, 12.4964]}
          zoom={6}
          zoomControl={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%", border: "none", borderRadius: 0, margin: 0, padding: 0 }}
        >
          <ZoomControl position="bottomleft" />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locali.map((l) => {
            const coords = getCoords(l);
            if (!coords) return null;
            return (
              <Marker key={l.id} position={coords} icon={markerIcon}>
                <Popup minWidth={280} maxWidth={340}>
                  <div
                    onClick={() => navigate(`/venue/${l.id}`)}
                    style={{
                      cursor: "pointer",
                      width: "min(70vw, 18rem)",
                      background: "transparent",
                      boxShadow: "none",
                      border: "none",
                      padding: 0,
                    }}
                  >
                    {l.image_url && (
                      <img
                        src={l.image_url}
                        style={{
                          width: "100%",
                          height: "clamp(5.5rem, 16vw, 7.5rem)",
                          objectFit: "cover",
                          borderRadius: 16,
                          marginBottom: 10,
                          display: "block"
                        }}
                      />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <h3 style={{ margin: 0, color: "#f5a623", fontSize: 20, fontWeight: 700 }}>{l.nome}</h3>
                      {l.indirizzo && (
                        <span style={{ color: "#222", fontSize: 15, fontWeight: 500, marginLeft: 8 }}>{l.indirizzo}</span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: "#555", fontSize: 15 }}>{l.citta}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}