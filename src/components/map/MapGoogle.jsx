/**
 * Mappa Google Maps - marker di precisione, caricamento ottimizzato
 * Richiede VITE_GOOGLE_MAPS_API_KEY in .env
 */
import { useMemo, useState, useCallback } from "react";
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Star, Wine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 41.8719, lng: 12.5674 }; // Italia
const defaultZoom = 5;

export default function MapGoogle({ venues, onVenueSelect, selectedVenue }) {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").toString().trim();
  const [map, setMap] = useState(null);
  const [hoveredVenue, setHoveredVenue] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "loziodelrum-map",
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const markers = useMemo(() => {
    return venues.filter((v) => v.latitude != null && v.longitude != null);
  }, [venues]);

  const bounds = useMemo(() => {
    if (markers.length === 0) return null;
    const lats = markers.map((v) => v.latitude);
    const lngs = markers.map((v) => v.longitude);
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [markers]);

  const fitBounds = useCallback(() => {
    if (map && bounds && markers.length > 1) {
      map.fitBounds(
        {
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west,
        },
        { top: 80, right: 20, bottom: 80, left: 20 }
      );
    }
  }, [map, bounds, markers.length]);

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-950 text-stone-400">
        <p>Errore caricamento mappa. Verifica la chiave API Google Maps.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-950">
        <div className="animate-pulse text-stone-500">Caricamento mappa...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={markers.length > 0 ? { lat: markers[0].latitude, lng: markers[0].longitude } : defaultCenter}
      zoom={markers.length > 1 ? 4 : defaultZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        backgroundColor: "#1c1917",
      }}
      mapContainerClassName="w-full h-full"
    >
      {markers.map((venue) => (
        <Marker
          key={venue.id}
          position={{ lat: venue.latitude, lng: venue.longitude }}
          onClick={() => onVenueSelect?.(venue)}
          onMouseOver={() => setHoveredVenue(venue)}
          onMouseOut={() => setHoveredVenue(null)}
        >
          {(hoveredVenue?.id === venue.id || selectedVenue?.id === venue.id) && (
            <InfoWindow onCloseClick={() => setHoveredVenue(null)}>
              <div className="bg-stone-900 text-stone-100 p-3 rounded-lg min-w-[200px]">
                <h3 className="font-semibold mb-1">{venue.name}</h3>
                <p className="text-sm text-stone-400 mb-2">{venue.city}</p>
                {venue.overall_rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{venue.overall_rating.toFixed(1)}</span>
                  </div>
                )}
                <Link to={createPageUrl(`VenueDetail?id=${venue.id}`)}>
                  <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950">
                    Vedi dettagli
                  </Button>
                </Link>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
