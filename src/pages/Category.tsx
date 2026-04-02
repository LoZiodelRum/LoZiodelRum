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
    <div className="page fade-in" style={container}>
      <h1 style={title}>{getTitle(tipo)}</h1>

      <div className="grid-wrapper" style={grid}>
        {items.map((item) => (
          <div
            key={item.id}
            style={card}
            onClick={() => navigate(`/drink/${item.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow =
                "0 14px 30px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(0,0,0,0.15)";
            }}
          >
            {item.immagine ? (
              <img src={item.immagine} style={img} />
            ) : (
              <div style={noImage}>NO IMG</div>
            )}

            <div style={overlay}>
              <h3 style={cardTitle}>{item.nome}</h3>
              {item.marca && <p style={brand}>{item.marca}</p>}
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

/* ---------- STILI ---------- */

const container = {
  padding: 24,
  background: "#F5F5F0",
  minHeight: "100%",
};

const title = {
  fontSize: 28,
  marginBottom: 30,
  color: "#4b2e1f",
};

const grid = {
  gap: 20,
};

const card = {
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: 16,
  overflow: "hidden",
  position: "relative" as const,
  background: "#111",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  transition: "all 0.25s ease",
};

const img = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

const noImage = {
  width: "100%",
  height: "100%",
  background: "#ddd",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#666",
};

const overlay = {
  position: "absolute" as const,
  bottom: 0,
  width: "100%",
  padding: 10,
  background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
};

const cardTitle = {
  color: "#fff",
  fontSize: 14,
  margin: 0,
};

const brand = {
  color: "#bbb",
  fontSize: 11,
  marginTop: 2,
};