import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { MapPin, Wine, List, Map as MapIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import VenueCard from "@/components/venue/VenueCard";
import "leaflet/dist/leaflet.css";
export default function MapPage() {
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

      {/* Map - Leaflet con locali da Supabase */}
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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

      <style>{`
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