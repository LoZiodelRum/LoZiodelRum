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
  const { tipo } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [tipo]);

  async function load() {
    setLoading(true);

    function getImage(obj: any) {
      return obj.immagine || obj.immagine_url || obj.image || obj.img || null;
    }

    // RESET
    setItems([]);

    // 🍸 COCKTAIL
    if (tipo === "cocktail") {
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
    else if (tipo === "rum" || tipo === "whisky" || tipo === "altri") {
      const { data, error } = await supabase.from("distillati").select("*");

      if (error) console.error(error);

      if (data) {
        const normalize = (c: string) => c?.toLowerCase().trim();

        let filtered = data;

        if (tipo === "rum") {
          filtered = data.filter((d: any) =>
            normalize(d.categoria).includes("rum")
          );
        }

        if (tipo === "whisky") {
          filtered = data.filter(
            (d: any) =>
              normalize(d.categoria).includes("whisky") ||
              normalize(d.categoria).includes("whiskey")
          );
        }

        if (tipo === "altri") {
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
    <div className="page fade-in page-light">
      <h1 className="page-title" style={{ color: "#4b2e1f" }}>{getTitle(tipo)}</h1>

      <div className="cocktail-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="drink-card"
            onClick={() => navigate(`/drink/${item.id}`)}
          >
            {item.immagine ? (
              <img src={item.immagine} alt={item.nome} />
            ) : (
              <div className="no-img-placeholder">NO IMG</div>
            )}
            <div className="drink-card-overlay">
              <h3>{item.nome}</h3>
              {item.marca && <p>{item.marca}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- HELPERS ---------- */

function getTitle(tipo: any) {
  if (tipo === "cocktail") return "Cocktail";
  if (tipo === "rum") return "Rum";
  if (tipo === "whisky") return "Whisky";
  if (tipo === "altri") return "Altri distillati";
  return "Cocktail";
}