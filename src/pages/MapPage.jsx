import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabaseClient";

// Icona custom marker
const markerIcon = new L.Icon({
  iconUrl: "/marker.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const DEFAULT_POSITION = { lat: 45.4642, lng: 9.19 }; // Milano
const DEFAULT_ZOOM = 13;
const RAGGIO_KM = 10;

function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 6371; // km
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

function CenterMap({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, zoom);
  }, [position, zoom, map]);
  return null;
}

export default function MapPage() {
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locali, setLocali] = useState([]);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_POSITION);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const mapRef = useRef();

  // Geolocalizzazione
  useEffect(() => {
    async function getPosition() {
      setLoading(true);
      // 1. Prova geolocalizzazione browser
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setUserPos(coords);
            setMapCenter(coords);
            setLoading(false);
          },
          async () => {
            // 2. Fallback IP
            try {
              const res = await fetch("https://ipapi.co/json/");
              const data = await res.json();
              if (data.latitude && data.longitude) {
                const coords = { lat: data.latitude, lng: data.longitude };
                setUserPos(coords);
                setMapCenter(coords);
              } else {
                setUserPos(DEFAULT_POSITION);
                setMapCenter(DEFAULT_POSITION);
              }
            } catch {
              setUserPos(DEFAULT_POSITION);
              setMapCenter(DEFAULT_POSITION);
            }
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 7000 }
        );
      } else {
        // 3. Default Milano
        setUserPos(DEFAULT_POSITION);
        setMapCenter(DEFAULT_POSITION);
        setLoading(false);
      }
    }
    getPosition();
  }, []);

  // Fetch locali
  useEffect(() => {
    async function fetchLocali() {
      const { data, error } = await supabase
        .from("locali")
        .select("id, nome, indirizzo, latitudine, longitudine, rating");
      if (error) setError("Errore caricamento locali");
      else setLocali(data || []);
    }
    fetchLocali();
  }, []);

  // Filtra e ordina locali per distanza
  const localiVicini = React.useMemo(() => {
    if (!userPos || !locali.length) return [];
    return locali
      .map((l) => ({
        ...l,
        distanza: getDistance(
          userPos.lat,
          userPos.lng,
          l.latitudine,
          l.longitudine
        ),
      }))
      .filter((l) => l.distanza <= RAGGIO_KM)
      .sort((a, b) => a.distanza - b.distanza)
      .slice(0, 3);
  }, [userPos, locali]);

  // Click su card → centra mappa
  function handleCardClick(l) {
    setMapCenter({ lat: l.latitudine, lng: l.longitudine });
    setZoom(15);
    setSelectedId(l.id);
  }

  // Click marker → evidenzia card
  function handleMarkerClick(id, lat, lng) {
    setSelectedId(id);
    setMapCenter({ lat, lng });
    setZoom(15);
  }

  // Loader
  if (loading)
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff" }}>
        <span>Caricamento posizione...</span>
      </div>
    );

  // Errore
  if (error)
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff" }}>
        <span>{error}</span>
      </div>
    );

  // Layout responsive
  const isMobile = window.innerWidth < 900;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        background: "#111",
      }}
    >
      {/* BOX MAPPA */}
      <div
        style={{
          flex: 1,
          minHeight: isMobile ? "50vh" : "100vh",
          minWidth: isMobile ? "100vw" : "50vw",
          position: "relative",
        }}
      >
        {userPos && (
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{
              width: "100%",
              height: isMobile ? "50vh" : "100vh",
              zIndex: 1,
              borderBottomLeftRadius: isMobile ? 0 : 24,
              borderTopLeftRadius: isMobile ? 0 : 24,
            }}
            ref={mapRef}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            <Circle
              center={userPos}
              radius={RAGGIO_KM * 1000}
              pathOptions={{ color: "#f5a623", fillColor: "#f5a62322", fillOpacity: 0.2 }}
            />
            <Marker position={userPos} icon={markerIcon}>
              <Popup>Tu sei qui</Popup>
            </Marker>
            {localiVicini.map((l) => (
              <Marker
                key={l.id}
                position={{ lat: l.latitudine, lng: l.longitudine }}
                icon={markerIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(l.id, l.latitudine, l.longitudine),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 120 }}>
                    <b>{l.nome}</b>
                    <br />
                    <span style={{ fontSize: 13 }}>{l.indirizzo}</span>
                    <br />
                    <button
                      style={{
                        marginTop: 8,
                        background: "#f5a623",
                        color: "#111",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 14px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      onClick={() => handleCardClick(l)}
                    >
                      Vedi scheda
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            <CenterMap position={mapCenter} zoom={zoom} />
          </MapContainer>
        )}
      </div>

      {/* BOX LISTA */}
      <div
        style={{
          flex: 1,
          minHeight: isMobile ? "50vh" : "100vh",
          minWidth: isMobile ? "100vw" : "50vw",
          background: "#181818",
          borderTopLeftRadius: isMobile ? 24 : 0,
          borderBottomLeftRadius: isMobile ? 0 : 24,
          boxShadow: "0 0 32px #000a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile ? "24px 0 0 0" : "48px 0 0 0",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>Locali nelle vicinanze</h2>
            <span style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer" }}>Vedi tutti</span>
          </div>
          {localiVicini.length === 0 && (
            <div style={{ color: "#fff", opacity: 0.7, marginTop: 32 }}>Nessun locale trovato entro 10km.</div>
          )}
          {localiVicini.map((l) => (
            <div
              key={l.id}
              onClick={() => handleCardClick(l)}
              style={{
                background: selectedId === l.id ? "#222" : "#23201a",
                borderRadius: 18,
                boxShadow: selectedId === l.id ? "0 0 0 2px #f5a623" : "0 2px 16px #0006",
                padding: "18px 20px",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                border: selectedId === l.id ? "2px solid #f5a623" : "none",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "#2d2d2d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 18,
                  overflow: "hidden",
                }}
              >
                {/* Placeholder icona */}
                <img
                  src="/marker.png"
                  alt={l.nome}
                  style={{ width: 36, height: 36, objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{l.nome}</div>
                <div style={{ color: "#ccc", fontSize: 14, marginBottom: 2 }}>{l.indirizzo}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 15 }}>
                    ★ {l.rating?.toFixed(1) ?? "-"}
                  </span>
                  <span style={{ color: "#fff", fontSize: 13, opacity: 0.8 }}>
                    <b>•</b> APERTO
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 60 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                  {l.distanza < 1
                    ? `${Math.round(l.distanza * 1000)}m`
                    : `${l.distanza.toFixed(1)}km`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
