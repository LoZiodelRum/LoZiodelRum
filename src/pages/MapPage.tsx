import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔥 IMPORT DIRETTO FILE
import markerIcon from "../assets/marker.png";

// 🔥 ICONA SENZA DISTORSIONE
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [60, 60], // 🔥 QUADRATO = NON SCHIACCIA
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
});

type Locale = {
  id: string;
  nome: string;
  citta: string;
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
      .select("*")
      .eq("status", "approved");

    setLocali(data || []);
  }

  function getCoords(l: Locale): [number, number] | null {
    if (!l.latitudine || !l.longitudine) return null;

    const lat = Number(l.latitudine);
    const lng = Number(l.longitudine);

    if (isNaN(lat) || isNaN(lng)) return null;

    return [lat, lng];
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[41.9028, 12.4964]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {locali.map((l) => {
          const coords = getCoords(l);
          if (!coords) return null;

          return (
            <Marker key={l.id} position={coords} icon={customIcon}>
              <Popup>
                <div
                  onClick={() => navigate(`/locale/${l.id}`)}
                  style={{
                    cursor: "pointer",
                    width: 220,
                  }}
                >
                  {l.image_url && (
                    <img
                      src={l.image_url}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    />
                  )}

                  <h3 style={{ margin: 0, color: "#000" }}>{l.nome}</h3>
                  <p style={{ margin: 0, color: "#555" }}>{l.citta}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}