
import "../App.css";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Drink = {
  id: string;
  nome: string;
  descrizione?: string;
  immagine?: string;
  marca?: string;
  categoria?: string;
  gradazione?: string;
  ingredienti?: string;
  ricetta?: string;
  [key: string]: any;
};

export default function DrinkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchDrink() {
      setLoading(true);
      // Cerca prima nei cocktail
      const { data, error } = await supabase.from("cocktail").select("*").eq("id", id).single();
      if (!data || error) {
        // Se non trovato, cerca nei distillati
        const { data: distillato, error: err2 } = await supabase.from("distillati").select("*").eq("id", id).single();
        if (!distillato || err2) {
          setNotFound(true);
          setLoading(false);
          return;
        } else {
          setDrink(distillato);
        }
      } else {
        setDrink(data);
      }
      setLoading(false);
    }
    fetchDrink();
  }, [id]);

  if (loading) return <div className="page fade-in">Caricamento...</div>;
  if (notFound || !drink) return <div className="page fade-in">Drink non trovato</div>;

  return (
    <>
      <Navbar />
      <div className="page fade-in" style={{ maxWidth: 800, margin: "0 auto", padding: 20, paddingTop: 86 }}>
      <button className="btn-primary" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        ← Torna indietro
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          {drink.immagine ? (
            <img src={drink.immagine} alt={drink.nome} style={{ width: "100%", borderRadius: 16, marginBottom: 20 }} />
          ) : (
            <div className="no-img-placeholder" style={{ marginBottom: 20 }}>NO IMG</div>
          )}
        </div>
        <div style={{ flex: 2, minWidth: 260 }}>
          <h1 style={{ fontSize: "2rem", color: "#4b2e1f", marginBottom: 10 }}>{drink.nome}</h1>
          {drink.marca && <div style={{ color: "#666", marginBottom: 10 }}><b>Marca:</b> {drink.marca}</div>}
          {drink.categoria && <div style={{ color: "#666", marginBottom: 10 }}><b>Categoria:</b> {drink.categoria}</div>}
          {drink.gradazione && <div style={{ color: "#666", marginBottom: 10 }}><b>Gradazione:</b> {drink.gradazione}</div>}
          {drink.descrizione && <div style={{ marginBottom: 16 }}>{drink.descrizione}</div>}
          {drink.ingredienti && (
            <div style={{ marginBottom: 16 }}>
              <b>Ingredienti:</b>
              <div>{drink.ingredienti}</div>
            </div>
          )}
          {drink.ricetta && (
            <div style={{ marginBottom: 16 }}>
              <b>Ricetta:</b>
              <div>{drink.ricetta}</div>
            </div>
          )}
          {/* Mostra tutti gli altri campi utili */}
          {Object.entries(drink)
            .filter(
              ([k, v]) =>
                !["id", "nome", "immagine", "marca", "categoria", "gradazione", "descrizione", "ingredienti", "ricetta", "created_at", "updated_at"].includes(k) &&
                v && String(v).trim().length > 0
            )
            .map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <b>{k.charAt(0).toUpperCase() + k.slice(1)}:</b> {String(v)}
              </div>
            ))}
        </div>
      </div>
      </div>
    </>
  );
}

/* STILI ORIGINALI */

const layout = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 60,
  maxWidth: "min(100%, 68rem)",
  margin: "10px auto 0",
};

const left = { flex: 1 };
const right = { flex: "1 1 320px" };

const title = {
  fontSize: "clamp(1.8rem, 5vw, 2.25rem)",
  marginBottom: 20,
  color: "#4b2e1f",
};

const mobileCocktailTitle = {
  display: "none",
  fontSize: "clamp(1.6rem, 6vw, 2rem)",
  margin: "8px 0 14px",
  color: "#4b2e1f",
};

const description = { marginBottom: 20, color: "#333" };

const sectionTitle = {
  marginTop: 25,
  marginBottom: 8,
  fontSize: 18,
  color: "#4b2e1f",
};

const text = { color: "#444" };

const image = {
  width: "100%",
  borderRadius: 16,
  marginBottom: 20,
};

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  overflow: "hidden",
};

const boxTitle = { marginBottom: 10, color: "#4b2e1f" };

const row = {
  padding: "6px 0",
  borderBottom: "1px solid #eee",
  color: "#4b2e1f",
};

const editorBox = {
  background: "#fff",
  padding: 20,
  marginBottom: 30,
  borderRadius: 16,
  overflow: "hidden",
};

const field = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const inputStyle = {
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const textareaStyle = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const buttons = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const btnGreen = {
  background: "green",
  color: "#fff",
  padding: "8px 16px",
};

const btnRed = {
  background: "red",
  color: "#fff",
  padding: "8px 16px",
};