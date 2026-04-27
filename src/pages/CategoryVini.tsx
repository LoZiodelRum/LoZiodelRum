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
      // Mappa i parametri url ai valori reali del db
      let dbCategoria = categoria;
      if (categoria) {
        if (categoria.toLowerCase() === "rossi") dbCategoria = "Rosso";
        else if (categoria.toLowerCase() === "bianchi") dbCategoria = "Bianco";
        else if (categoria.toLowerCase() === "rosati") dbCategoria = "Rosato";
        else if (categoria.toLowerCase() === "bollicine") dbCategoria = "Bollicine";
        else if (categoria.toLowerCase() === "altri-vini") dbCategoria = null; // gestito sotto
      }
      let data = [];
      if (dbCategoria) {
        const res = await supabase
          .from("vini")
          .select("*")
          .ilike("categoria", `%${dbCategoria}%`);
        data = res.data || [];
      } else if (categoria && categoria.toLowerCase() === "altri-vini") {
        // Escludi tutte le categorie principali
        const res = await supabase
          .from("vini")
          .select("*")
          .not("categoria", "ilike", "%Rosso%")
          .not("categoria", "ilike", "%Bianco%")
          .not("categoria", "ilike", "%Rosato%")
          .not("categoria", "ilike", "%Bollicine%")
        data = res.data || [];
      }
      setVini(data);
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
        <div className="drink-section-header" style={{ justifyContent: 'flex-end', marginBottom: 18 }}>
          <h2 className="drink-section-title" style={{ marginRight: 'auto' }}>Vini</h2>
          <button className="btn-primary btn-small" style={{ marginLeft: 'auto' }} onClick={() => navigate('/vini')}>
            Vedi tutti
          </button>
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
