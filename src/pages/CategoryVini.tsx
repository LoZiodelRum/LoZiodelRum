import "../App.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CategoryVini() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [vini, setVini] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("vini")
        .select("*")
        .ilike("categoria", `%${categoria || ""}%`);
      setVini(data || []);
      setLoading(false);
    }
    load();
  }, [categoria]);

  if (loading) return <div className="page fade-in">Caricamento...</div>;

  return (
    <div className="fade-in drink-page-white">
      <section className="drink-section-white">
        <div className="drink-top-bar">
          <button className="drink-back-btn" onClick={() => navigate(-1)} aria-label="Torna indietro">
            ←
          </button>
          <h1 className="drink-page-heading">{categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : "Vini"}</h1>
        </div>
        <div className="drink-grid-uniform vini-grid">
          {vini.length === 0 ? (
            <p style={{ color: "#cbd5e1", marginTop: 8 }}>Nessun vino disponibile in questa categoria.</p>
          ) : (
            vini.map((item) => (
              <article
                key={item.id}
                className="drink-card-uniform"
                onClick={() => navigate(`/vini/${item.id}`)}
                style={{ cursor: "pointer" }}
              >
                {item.immagine ? (
                  <img src={item.immagine} alt={item.nome} />
                ) : (
                  <div className="no-img-placeholder">NO IMG</div>
                )}
                <div className="drink-card-caption">
                  <h3 translate="no">{item.nome}</h3>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
