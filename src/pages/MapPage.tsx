
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../lib/supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = L.icon({
  iconUrl: "/marker.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

type Venue = {
  id: string;
  nome: string;
  latitudine: number;
  longitudine: number;
};

export default function MapPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.9028, 12.4964]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVenues() {
      setLoading(true);
      setError(false);
      const { data, error } = await supabase
        .from("Locali")
        .select("id, nome, latitudine, longitudine");
      if (error || !data) {
        setError(true);
        setLoading(false);
        return;
      }
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
      setLoading(false);
    }
    fetchVenues();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitudine, venue.longitudine]}
            icon={customIcon}
          >
            <Popup>{venue.nome}</Popup>
          </Marker>
        ))}
      </MapContainer>
      {loading && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff", fontSize: 20, zIndex: 1000
        }}>
          Caricamento mappa…
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#fff", fontSize: 20, zIndex: 1000
        }}>
          Errore caricamento locali
        </div>
      )}
    </div>
  );
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
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {venues.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.latitudine, venue.longitudine]}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  setSelectedVenue(venue);
                  // Centra la mappa sul marker selezionato, ma più in basso per lasciare spazio all'anteprima
                  if (mapRef.current) {
                    const map = mapRef.current;
                    const markerLatLng = L.latLng(venue.latitudine, venue.longitudine);
                    // Calcola offset in pixel (navbar + anteprima)
                    const offsetY = 110; // 70px navbar + 40px extra
                    const targetPoint = map.project(markerLatLng, map.getZoom()).subtract([0, offsetY]);
                    const targetLatLng = map.unproject(targetPoint, map.getZoom());
                    map.setView(targetLatLng, map.getZoom(), { animate: true });
                  }
                }
              }}
            />
          ))}

          <ZoomControl position="bottomleft" />
        </MapContainer>

        {selectedVenue && mapRef.current && (
          <VenuePreview
            venue={selectedVenue}
            map={mapRef.current}
            onClose={() => setSelectedVenue(null)}
          />
        )}
      </div>
    </>
  );
}