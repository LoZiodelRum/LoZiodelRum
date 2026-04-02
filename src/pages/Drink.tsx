import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type Cocktail = {
  id: string;
  nome: string;
  immagine: string | null;
};

type Distillato = {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  immagine: string | null;
};

export default function Drink() {
  const [cocktail, setCocktail] = useState<Cocktail[]>([]);
  const [rum, setRum] = useState<Distillato[]>([]);
  const [whisky, setWhisky] = useState<Distillato[]>([]);
  const [altri, setAltri] = useState<Distillato[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data: cocktailData } = await supabase.from("cocktail").select("*");
    const { data: distillatiData } = await supabase.from("distillati").select("*");

    function getImage(obj: any) {
      return obj.immagine || obj.immagine_url || obj.image || obj.img || null;
    }

    if (cocktailData) {
      const sorted = cocktailData.sort((a: any, b: any) =>
        a.nome.localeCompare(b.nome)
      );

      setCocktail(
        sorted.slice(0, 6).map((c: any) => ({
          id: c.id,
          nome: c.nome,
          immagine: getImage(c),
        }))
      );
    }

    if (distillatiData) {
      const normalize = (c: string) => c?.toLowerCase().trim();

      const mapped = distillatiData
        .map((d: any) => ({
          id: d.id,
          nome: d.nome,
          marca: d.marca,
          categoria: normalize(d.categoria),
          immagine: getImage(d),
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      setRum(mapped.filter(d => d.categoria.includes("rum")).slice(0, 6));

      setWhisky(
        mapped.filter(
          d =>
            d.categoria.includes("whisky") ||
            d.categoria.includes("whiskey")
        ).slice(0, 6)
      );

      setAltri(
        mapped
          .filter(
            d =>
              !d.categoria.includes("rum") &&
              !d.categoria.includes("whisky") &&
              !d.categoria.includes("whiskey")
          )
          .slice(0, 6)
      );
    }

    setLoading(false);
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Caricamento...</div>;
  }

  function renderSection(title: string, list: any[], tipo: string) {
    return (
      <div style={{ marginTop: 60 }}>

        {/* HEADER */}
        <div style={header}>
          <h2 style={sectionTitle}>{title}</h2>

          <button
            style={button}
            onClick={() => navigate(`/categoria/${tipo}`)}
          >
            Vedi tutti
          </button>
        </div>

        {!list.length ? (
          <p style={empty}>Nessun dato</p>
        ) : (
          <div style={grid}>
            {list.map((item) => (
              <div
                key={item.id}
                style={card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }}
                onClick={() => navigate(`/drink/${item.id}`)}
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
        )}
      </div>
    );
  }

  return (
    <div style={container}>
      {renderSection("Cocktail", cocktail, "cocktail")}
      {renderSection("Rum", rum, "rum")}
      {renderSection("Whisky", whisky, "whisky")}
      {renderSection("Altri distillati", altri, "altri")}
    </div>
  );
}

/* STILI */

const container = {
  padding: "40px 0",
  background: "#F5F5F0",
  minHeight: "100vh",
};

const header = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  maxWidth: 700,
  margin: "0 auto 20px auto",
};

const sectionTitle = {
  fontSize: 20,
  fontWeight: 600,
  color: "#4b2e1f",
};

const button = {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

const empty = {
  textAlign: "center" as const,
  color: "#999",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 200px)",
  justifyContent: "center",
  columnGap: 60,
  rowGap: 30,
};

const card = {
  width: 200,
  height: 200,
  borderRadius: 16,
  overflow: "hidden",
  position: "relative" as const,
  background: "#111",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)", // 🔥 rilievo
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
  background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
};

const cardTitle = {
  color: "#fff",
  fontSize: 13,
  margin: 0,
};

const brand = {
  color: "#bbb",
  fontSize: 10,
  marginTop: 2,
};