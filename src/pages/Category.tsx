import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

type Item = {
  id: string;
  nome: string;
  immagine: string | null;
  marca?: string;
};

export default function Category() {
  const { categoria, tipo } = useParams();
  const selectedType = categoria || tipo;
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [selectedType]);

  async function load() {
    setLoading(true);

    function getImage(obj: any) {
      return obj.immagine || obj.immagine_url || obj.image || obj.img || null;
    }

    // RESET
    setItems([]);

    // 🍸 COCKTAIL
    if (selectedType === "cocktail") {
      const { data, error } = await supabase.from("cocktail").select("*");

      if (error) console.error(error);

      if (data) {
        const sorted = [...data].sort((a: any, b: any) =>
          a.nome.localeCompare(b.nome)
        );

        setItems(
          sorted.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            immagine: getImage(c),
          }))
        );
      }
    }

    // 🥃 DISTILLATI
    else if (selectedType === "rum" || selectedType === "whisky" || selectedType === "altri") {
      const { data, error } = await supabase.from("distillati").select("*");

      if (error) console.error(error);

      if (data) {
        const normalize = (c: string) => c?.toLowerCase().trim();

        let filtered = data;

        if (selectedType === "rum") {
          filtered = data.filter((d: any) =>
            normalize(d.categoria).includes("rum")
          );
        }

        if (selectedType === "whisky") {
          filtered = data.filter(
            (d: any) =>
              normalize(d.categoria).includes("whisky") ||
              normalize(d.categoria).includes("whiskey")
          );
        }

        if (selectedType === "altri") {
          filtered = data.filter(
            (d: any) =>
              !normalize(d.categoria).includes("rum") &&
              !normalize(d.categoria).includes("whisky") &&
              !normalize(d.categoria).includes("whiskey")
          );
        }

        const sorted = [...filtered].sort((a: any, b: any) =>
          a.nome.localeCompare(b.nome)
        );

        setItems(
          sorted.map((d: any) => ({
            id: d.id,
            nome: d.nome,
            marca: d.marca,
            immagine: getImage(d),
          }))
        );
      }
    }

    // 🔁 FALLBACK → cocktail
    else {
      const { data } = await supabase.from("cocktail").select("*");

      if (data) {
        const sorted = [...data].sort((a: any, b: any) =>
          a.nome.localeCompare(b.nome)
        );

        setItems(
          sorted.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            immagine: getImage(c),
          }))
        );
      }
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="page fade-in">Caricamento...</div>;
  }

  return (
    <div className="fade-in drink-page-white">
      <section className="drink-section-white">
        {selectedType === "cocktail" ? (
          <h1 className="drink-page-heading" style={{ marginBottom: 14 }}>Coktail</h1>
        ) : (
          <div className="drink-top-bar">
            <button className="drink-back-btn" onClick={() => navigate(-1)} aria-label="Torna indietro">
              ←
            </button>
            <h1 className="drink-page-heading">{getTitle(selectedType)}</h1>
          </div>
        )}

        <div className="drink-grid-uniform">
          {items.map((item) => (
            <article
              key={item.id}
              className="drink-card-uniform"
              onClick={() => navigate(`/drink/${item.id}`)}
            >
              {item.immagine ? (
                <img src={item.immagine} alt={item.nome} />
              ) : (
                <div className="no-img-placeholder">NO IMG</div>
              )}
              <div className="drink-card-caption">
                <h3>{item.nome}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- HELPERS ---------- */

function getTitle(tipo: any) {
  if (tipo === "cocktail") return "Coktail";
  if (tipo === "rum") return "Rum";
  if (tipo === "whisky") return "Whisky";
  if (tipo === "altri") return "Altri distillati";
  return "Coktail";
}