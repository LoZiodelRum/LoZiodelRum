import "../App.css";
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
      const sorted = cocktailData.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
      setCocktail(sorted.slice(0, 6).map((c: any) => ({ id: c.id, nome: c.nome, immagine: getImage(c) })));
    }

    if (distillatiData) {
      const normalize = (c: string) => c?.toLowerCase().trim();
      const mapped = distillatiData
        .map((d: any) => ({ id: d.id, nome: d.nome, marca: d.marca, categoria: normalize(d.categoria), immagine: getImage(d) }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      setRum(mapped.filter(d => d.categoria.includes("rum")).slice(0, 6));
      setWhisky(mapped.filter(d => d.categoria.includes("whisky") || d.categoria.includes("whiskey")).slice(0, 6));
      setAltri(mapped.filter(d => !d.categoria.includes("rum") && !d.categoria.includes("whisky") && !d.categoria.includes("whiskey")).slice(0, 6));
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="page fade-in">Caricamento...</div>;
  }

  function renderSection(title: string, list: any[], tipo: string) {
    return (
      <div className="content-wrapper">
        <div className="section-header">
          <h2 className="section-title" style={{ color: "#4b2e1f" }}>{title}</h2>
          <button className="btn-primary btn-small" onClick={() => navigate(`/categoria/${tipo}`)}>
            Vedi tutti
          </button>
        </div>

        {!list.length ? (
          <p style={{ textAlign: "center", color: "#999" }}>Nessun dato</p>
        ) : (
          <div className="cocktail-grid">
            {list.map((item) => (
              <div key={item.id} className="drink-card" onClick={() => navigate(`/drink/${item.id}`)}>
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
        )}
      </div>
    );
  }

  return (
    <div className="page fade-in">
      {renderSection("Cocktail", cocktail, "cocktail")}
      {renderSection("Rum", rum, "rum")}
      {renderSection("Whisky", whisky, "whisky")}
      {renderSection("Altri distillati", altri, "altri")}
    </div>
  );
}
