import Navbar from "../components/Navbar";
import "../App.css";

export default function MapPage() {
  return (
    <>
      <Navbar />
      <div className="page fade-in">
        {/* ...contenuto... */}
      </div>
    </>
  );
}
    <div
      className="fade-in map-fullscreen"
      style={{
        position: "fixed",
        top: 70,
        left: 0,
        right: 0,
        bottom: 0,
        height: "auto",
        width: "auto",
        padding: 0,
        margin: 0,
        border: "none",
        borderRadius: 0,
        overflow: "hidden",
      }}
    >
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
            <Marker key={l.id} position={coords} icon={customIcon}>
              <Popup>
                <div
                  onClick={() => navigate(`/venue/${l.id}`)}
                  style={{
                    cursor: "pointer",
                    width: "min(70vw, 14rem)",
                  }}
                >
                  {l.image_url && (
                    <img
                      src={l.image_url}
                      style={{
                        width: "100%",
                        height: "clamp(5.5rem, 16vw, 7.5rem)",
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