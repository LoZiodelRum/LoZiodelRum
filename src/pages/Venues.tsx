import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Venue = {
  id: string;
  nome: string;
  citta?: string | null;
  indirizzo?: string | null;
  descrizione?: string | null;
  image_url?: string | null;
  image?: string | null;
};

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    void fetchVenues();
  }, []);

  async function fetchVenues() {
    const { data, error } = await supabase
      .from("Locali")
      .select("id, nome, citta, indirizzo, descrizione, image_url, image")
      .eq("status", "approved")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Errore caricamento locali:", error);
      setVenues([]);
      return;
    }

    setVenues(data || []);
  }

  return (
    <div className="page fade-in" style={{ maxWidth: 1280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, color: "#f5a623" }}>Tutti i locali</h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>{venues.length} risultati</p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {venues.map((venue) => {
          const image = venue.image_url || venue.image || "https://via.placeholder.com/900x600?text=Locale";
          const subtitle = [venue.citta, venue.indirizzo].filter(Boolean).join(" - ");

          return (
            <Link
              key={venue.id}
              to={`/venue/${venue.id}`}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 12,
                minHeight: 220,
                color: "#fff",
                textDecoration: "none",
                display: "flex",
                alignItems: "flex-end",
                border: "1px solid rgba(148,163,184,0.22)",
              }}
            >
              <img
                src={image}
                alt={venue.nome}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(2,6,23,0.9), rgba(2,6,23,0.3))",
                }}
              />
              <div style={{ position: "relative", zIndex: 1, padding: 14, width: "100%" }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{venue.nome}</h2>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: 13 }}>{subtitle || "Localita non disponibile"}</p>
                {venue.descrizione && (
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#e2e8f0",
                      fontSize: 12,
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {venue.descrizione}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
