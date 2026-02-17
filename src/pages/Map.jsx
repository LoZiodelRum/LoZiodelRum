/**
 * Mappa locali – Supabase (tabella Locali). Nessun localStorage.
 * getVenues() carica da Supabase. Inserimenti da mobile → cloud → visibili su Mac.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { MapPin, Star, Wine, X, List, Map as MapIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import VenueCard from "@/components/venue/VenueCard";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Pin arancione con icona bicchiere/lampada (come nell'immagine)
const pinIcon = new L.DivIcon({
  className: "custom-pin",
  html: `<div style="
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 2px solid white;
  "><div style="transform: rotate(45deg); color: #1c1917;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 2h8l4 10H4l4-10zm2 2l-2 6h8l-2-6h-4zM4 14h16v2H4v-2zm5 4h6v4H9v-4z"/>
    </svg>
  </div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export default function MapPage() {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [mapCenter, setMapCenter] = useState([54.5260, 15.2551]); // Europe center

  const { getVenues } = useAppData();
  const venues = getVenues();

  // Filter venues with coordinates
  const mappableVenues = venues.filter(v => v.latitude && v.longitude);
  
  // Filter by search
  const filteredVenues = mappableVenues.filter(v => 
    !searchQuery || 
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update map center when venues load
  useEffect(() => {
    if (filteredVenues.length > 0) {
      const avgLat = filteredVenues.reduce((sum, v) => sum + v.latitude, 0) / filteredVenues.length;
      const avgLng = filteredVenues.reduce((sum, v) => sum + v.longitude, 0) / filteredVenues.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [filteredVenues.length]);

  return (
    <div className="h-[calc(100vh-3.5rem)] min-h-[320px] lg:h-[calc(100vh-4rem)] relative w-full overflow-hidden">
      {/* Back + Search Bar */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-[1000] flex gap-2 items-center">
        <Link
          to={createPageUrl("Home")}
          className="flex-shrink-0 p-2.5 h-12 w-12 flex items-center justify-center bg-stone-950/90 backdrop-blur-sm border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-stone-100 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="relative flex-1 max-w-md">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            placeholder="Cerca città o locale..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-stone-950/90 backdrop-blur-sm border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-xl"
          />
        </div>
        <Button
          onClick={() => setShowList(!showList)}
          className="h-12 px-4 bg-stone-950/90 backdrop-blur-sm border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-stone-100 rounded-xl"
        >
          {showList ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </Button>
      </div>

      {/* Map - Leaflet con locali da Supabase (tabella Locali) */}
      <MapContainer
        center={mapCenter}
        zoom={4}
        className="h-full w-full"
        style={{ background: '#1c1917' }}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
/>
        {filteredVenues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={pinIcon}
            eventHandlers={{
              click: () => setSelectedVenue(venue),
            }}
          >
            <Popup className="venue-popup">
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
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* List Sheet */}
      <Sheet open={showList} onOpenChange={setShowList}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-lg bg-stone-950 border-stone-800 overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-stone-100">
              Locali ({filteredVenues.length})
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {filteredVenues.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} />
            ))}
            {filteredVenues.length === 0 && (
              <div className="text-center py-12">
                <Wine className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                <p className="text-stone-500">Nessun locale trovato</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Selected Venue Detail */}
      {selectedVenue && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 bg-stone-950/95 backdrop-blur-sm rounded-2xl border border-stone-800 overflow-hidden">
          <button
            onClick={() => setSelectedVenue(null)}
            className="absolute top-3 right-3 p-1 hover:bg-stone-800 rounded-lg z-10"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
          <img
            src={selectedVenue.cover_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400"}
            alt={selectedVenue.name}
            className="w-full h-32 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{selectedVenue.name}</h3>
            <p className="text-sm text-stone-400 flex items-center gap-1 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              {selectedVenue.city}, {selectedVenue.country}
            </p>
            <div className="flex items-center justify-between">
              {selectedVenue.overall_rating && (
                <div className="flex items-center gap-1.5 bg-amber-500/20 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-amber-400">
                    {selectedVenue.overall_rating.toFixed(1)}
                  </span>
                </div>
              )}
              <Link to={createPageUrl(`VenueDetail?id=${selectedVenue.id}`)}>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                  Scopri
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          display: none;
        }
        .custom-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-top .leaflet-control-zoom {
          display: none;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div> 
  );
}
