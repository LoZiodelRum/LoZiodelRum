import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

type Venue = {
  id: string;
  nome: string;
  citta?: string | null;
  indirizzo?: string | null;
  descrizione?: string | null;
  nome_en?: string | null;
  nome_bg?: string | null;
  descrizione_en?: string | null;
  descrizione_bg?: string | null;
  image_url?: string | null;
  image?: string | null;
};



export default function Venues() {
  const { i18n } = useTranslation();
  const [venues, setVenues] = useState<Venue[]>([]);

  const venuesTitle = getTranslatedField(
    {
      label_it: "Tutti i locali",
      label_en: "All venues",
      label_bg: "Всички заведения",
    },
    "label",
    i18n.language,
    "Tutti i locali"
  );
  const resultsLabel = getTranslatedField(
    {
      label_it: "risultati",
      label_en: "results",
      label_bg: "резултати",
    },
    "label",
    i18n.language,
    "risultati"
  );
  const missingLocationLabel = getTranslatedField(
    {
      label_it: "Localita non disponibile",
      label_en: "Location not available",
      label_bg: "Местоположението не е налично",
    },
    "label",
    i18n.language,
    "Localita non disponibile"
  );

  useEffect(() => {
    void fetchVenues();
  }, []);

  async function fetchVenues() {
    const { data, error } = await supabase
      .from("Locali")
      .select("id, nome, nome_en, nome_bg, citta, indirizzo, descrizione, descrizione_en, descrizione_bg, image_url, image")
      .or("status.eq.approved,approvato.eq.true")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Errore caricamento locali:", error);
      setVenues([]);
      return;
    }

    setVenues(data || []);
  }

  return (
    <>
      <Navbar />
      <div className="page fade-in venues-page" style={{ maxWidth: 1100, marginLeft: "auto", marginRight: "auto", marginTop: 86 }}>
        <style>{`
        .venues-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .venue-card {
          min-height: 180px;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 1023px) {
          .venues-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .venues-page {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .venues-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            padding-left: 2px;
            padding-right: 2px;
          }

          .venue-card {
            width: 100%;
          }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, color: "#f5a623" }}>{venuesTitle}</h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
          {venues.length} {resultsLabel}
        </p>
      </div>

      <div
        className="venues-grid"
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          padding: "0 40px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {venues.map((venue) => {
          const translatedName = getTranslatedField(venue as any, "nome", i18n.language, "-");
          const translatedDescription = getTranslatedField(venue as any, "descrizione", i18n.language, "");
          const image = venue.image_url || venue.image || "https://via.placeholder.com/900x600?text=Locale";
          const subtitle = [venue.citta, venue.indirizzo].filter(Boolean).join(" - ");

          return (
            <Link
              key={venue.id}
              to={`/venue/${venue.id}`}
              className="venue-card"
              style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 12,
                  color: "#fff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "flex-end",
                  maxWidth: 420,
                }}
            >
              <img
                src={image}
                alt={translatedName}
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
                  background: "linear-gradient(to top, rgba(2,6,23,0.45), rgba(2,6,23,0.02))",
                }}
              />
              <div style={{ position: "relative", zIndex: 1, padding: 14, width: "100%" }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{translatedName}</h2>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: 13 }}>
                  {subtitle || missingLocationLabel}
                </p>
                {translatedDescription && (
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
                    {translatedDescription}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </>
  );
}
