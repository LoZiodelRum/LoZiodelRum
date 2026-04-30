import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../lib/supabaseClient";

const customIcon = L.icon({
  iconUrl: "/marker.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

const DEFAULT_CENTER = [41.9, 12.5];

export default function MapPage() {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    async function fetchVenues() {
      const { data, error } = await supabase
        .from("Locali")
        .select("id, nome, latitudine, longitudine");
      if (error) return;
      setVenues(
        (data || []).map((v) => ({
          ...v,
          latitudine: Number(String(v.latitudine).replace(",", ".")),
          longitudine: Number(String(v.longitudine).replace(",", ".")),
        }))
      );
    }
    fetchVenues();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={6}
        style={{ height: "100vh", width: "100vw" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitudine, venue.longitudine]}
            icon={customIcon}
          >
            <Popup>
              <b>{venue.nome}</b>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}