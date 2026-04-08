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

    function normalize(value: any) {
      return String(value || "").toLowerCase().trim();
    }

    function distillatoCategoryText(d: any) {
      const categoria = [
        d.categoria,
        d.tipologia,
        d.tipo,
        d.tipo_distillato,
        d.categoria_distillato,
        d.category,
        d.base_alcolica,
      ]
        .map(normalize)
        .find((value) => value.length > 0) || "";

      const nomeMarca = `${normalize(d.nome)} ${normalize(d.marca)}`.trim();
      return `${categoria} ${nomeMarca}`.trim();
    }

    if (cocktailData) {
      const sorted = cocktailData.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
      setCocktail(sorted.slice(0, 6).map((c: any) => ({ id: c.id, nome: c.nome, immagine: getImage(c) })));
    }

    if (distillatiData) {
      const mapped = distillatiData
        .map((d: any) => ({
          id: d.id,
          nome: d.nome,
          marca: d.marca,
          categoria: distillatoCategoryText(d),
          immagine: getImage(d),
        }))
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
      <section className="drink-section-white">
        <div className="drink-section-header">
          <h2 className="drink-section-title">{title}</h2>
          <button className="btn-primary btn-small" onClick={() => navigate(`/categoria/${tipo}`)}>
            Vedi tutti
          </button>
        </div>

        {!list.length ? (
          <p style={{ textAlign: "center", color: "#999" }}>Nessun dato</p>
        ) : (
          <div className="drink-grid-uniform">
            {list.map((item) => (
              <article key={item.id} className="drink-card-uniform" onClick={() => navigate(`/drink/${item.id}`)}>
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
        )}
      </section>
    );
  }

  return (
    <div className="fade-in drink-page-white">
      {renderSection("Cocktail", cocktail, "cocktail")}
      {renderSection("Rum", rum, "rum")}
      {renderSection("Whisky", whisky, "whisky")}
      {renderSection("Altri distillati", altri, "altri")}
    </div>
  );
}
