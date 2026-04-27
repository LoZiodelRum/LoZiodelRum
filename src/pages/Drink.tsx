import Navbar from "../components/Navbar";
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
    const { data: distillatiData, error: distillatiError } = await supabase.from("distillati").select("*");

    let distillatiRows: any[] = Array.isArray(distillatiData) ? distillatiData : [];

    if ((!distillatiRows.length && distillatiError) || !distillatiRows.length) {
      const { data: distillatoData } = await supabase.from("distillato").select("*");
      if (Array.isArray(distillatoData) && distillatoData.length) {
        distillatiRows = distillatoData;
      }
    }

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

    function isDistillatoLike(record: any) {
      const cat = normalize(record?.categoria);
      const hasDistillatoCategory = cat.includes("distillat");
      const hasDistillatoFields = [
        record?.distilleria,
        record?.invecchiamento,
        record?.tipo_botte,
        record?.esame_visivo,
        record?.esame_olfattivo,
        record?.esame_gustativo,
        record?.note_aromatiche,
        record?.sottocategoria,
      ].some((value) => normalize(value).length > 0);
      return hasDistillatoCategory || hasDistillatoFields;
    }

    if (cocktailData) {
      const sorted = cocktailData.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
      setCocktail(sorted.slice(0, 6).map((c: any) => ({ id: c.id, nome: c.nome, immagine: getImage(c) })));
    }

    const mappedDistillati = distillatiRows
      .map((d: any) => ({
        id: d.id,
        nome: d.nome || d.name || "Distillato",
        marca: d.marca || "",
        categoria: distillatoCategoryText(d),
        immagine: getImage(d),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const cocktailDistillatiFallback: Distillato[] = (cocktailData || [])
      .filter((record: any) => isDistillatoLike(record))
      .map((c: any) => ({
        id: c.id,
        nome: c.nome || c.name || "Distillato",
        marca: c.marca || c.distilleria || "",
        categoria: distillatoCategoryText(c),
        immagine: getImage(c),
      }))
      .sort((a: Distillato, b: Distillato) => a.nome.localeCompare(b.nome));

    const sourceDistillati = mappedDistillati.length ? mappedDistillati : cocktailDistillatiFallback;

    if (sourceDistillati.length) {
      const mapped = sourceDistillati
        .map((d: any) => ({
          id: d.id,
          nome: d.nome,
          marca: d.marca || "",
          categoria: d.categoria,
          immagine: d.immagine,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      const containsAny = (text: string, words: string[]) => words.some((word) => text.includes(word));
      const rumWords = ["rum", "rhum", "ron", "cachaca"];
      const whiskyWords = ["whisky", "whiskey", "scotch", "bourbon", "rye", "single malt"];

      const rumCandidates = mapped.filter((d) => containsAny(d.categoria, rumWords));
      const whiskyCandidates = mapped.filter((d) => containsAny(d.categoria, whiskyWords));
      const altriCandidates = mapped.filter((d) => !containsAny(d.categoria, rumWords) && !containsAny(d.categoria, whiskyWords));

      setRum(rumCandidates.slice(0, 6));
      setWhisky(whiskyCandidates.slice(0, 6));
      setAltri(altriCandidates.slice(0, 6));
    } else {
      setRum([]);
      setWhisky([]);
      setAltri([]);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="page fade-in">Caricamento...</div>;
  }

  function renderSection(title: string, list: any[], tipo: string) {
    return (
      <section className="drink-section-white">
        <div className="drink-section-header" style={{ justifyContent: 'flex-end' }}>
          <h2 className="drink-section-title" style={{ marginRight: 'auto' }}>{title}</h2>
          <button className="btn-primary btn-small" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/categoria/${tipo}`)}>
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
                  <h3 translate="no">{item.nome}</h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <Navbar />
      <div className="fade-in drink-page-white" style={{ marginTop: 32 }}>
        {renderSection("Cocktail", cocktail, "cocktail")}
        {renderSection("Rum", rum, "rum")}
        {renderSection("Whisky", whisky, "whisky")}
        {renderSection("Altri distillati", altri, "altri")}
      </div>
    </>
  );
}
