import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type VinoCard = {
  id: string;
  nome: string;
  immagine: string | null;
  categoria: string;
  alcol: string;
  descrizione: string;
};

const mockVini = [
  {
    id: "1",
    name: "Barolo DOCG",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200",
    category: "Rosso",
    alcol: "14%",
    descrizione: "Strutturato, intenso",
  },
  {
    id: "2",
    name: "Brunello di Montalcino",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200",
    category: "Rosso",
    alcol: "14.5%",
    descrizione: "Profondo, elegante",
  },
  {
    id: "3",
    name: "Franciacorta Brut",
    image: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200",
    category: "Bollicine",
    alcol: "12.5%",
    descrizione: "Fine, cremoso",
  },
  {
    id: "4",
    name: "Prosecco Superiore",
    image: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=1200",
    category: "Bollicine",
    alcol: "11.5%",
    descrizione: "Fresco, floreale",
  },
  {
    id: "5",
    name: "Vermentino di Gallura",
    image: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=1200",
    category: "Bianco",
    alcol: "13%",
    descrizione: "Sapido, mediterraneo",
  },
  {
    id: "6",
    name: "Gewurztraminer",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1200",
    category: "Bianco",
    alcol: "13.5%",
    descrizione: "Aromatico, speziato",
  },
  {
    id: "7",
    name: "Chiaretto del Garda",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200",
    category: "Rosato",
    alcol: "12.5%",
    descrizione: "Delicato, fruttato",
  },
  {
    id: "8",
    name: "Cerasuolo d'Abruzzo",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=1200",
    category: "Rosato",
    alcol: "13%",
    descrizione: "Vivace, gastronomico",
  },
];

export default function Vini() {
  const [vini, setVini] = useState<VinoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase.from("vini").select("*");

    const normalizeImage = (obj: any) => obj.immagine || obj.immagine_url || obj.image || obj.img || null;

    if (!error && data && data.length) {
      const mapped = data
        .map((vino: any) => ({
          id: String(vino.id),
          nome: vino.nome || vino.name || "Vino",
          immagine: normalizeImage(vino),
          categoria: (vino.categoria || vino.category || "Altro").trim(),
          alcol: vino.alcol || vino.grado_alcolico || "",
          descrizione: vino.descrizione || vino.description || "",
        }))
        .sort((a: VinoCard, b: VinoCard) => a.nome.localeCompare(b.nome));

      setVini(mapped);
      setLoading(false);
      return;
    }

    const fallback = [...mockVini]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((vino) => ({
        id: vino.id,
        nome: vino.name,
        immagine: vino.image,
        categoria: vino.category,
        alcol: vino.alcol,
        descrizione: vino.descrizione,
      }));

    setVini(fallback);
    setLoading(false);
  }

  const rossi = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("rosso")).slice(0, 6), [vini]);
  const bianchi = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("bianco")).slice(0, 6), [vini]);
  const bollicine = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("bollic")).slice(0, 6), [vini]);
  const altri = useMemo(
    () => vini.filter((vino) => !vino.categoria.toLowerCase().includes("rosso") && !vino.categoria.toLowerCase().includes("bianco") && !vino.categoria.toLowerCase().includes("bollic")).slice(0, 6),
    [vini]
  );

  if (loading) {
    return <div className="page fade-in">Caricamento...</div>;
  }

  function renderSection(title: string, list: VinoCard[], tipo: string) {
    return (
      <section className="drink-section-white" id={tipo}>
        <div className="drink-section-header">
          <h2 className="drink-section-title">{title}</h2>
          <button className="btn-primary btn-small" onClick={() => navigate(`/vini#${tipo}`)}>
            Vedi tutti
          </button>
        </div>

        {!list.length ? (
          <p style={{ textAlign: "center", color: "#999" }}>Nessun dato</p>
        ) : (
          <div className="drink-grid-uniform" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {list.map((item) => (
              <article key={item.id} className="drink-card-uniform" onClick={() => navigate(`/vini/${item.id}`)}>
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
      {renderSection("Rossi", rossi, "rossi")}
      {renderSection("Bianchi", bianchi, "bianchi")}
      {renderSection("Bollicine", bollicine, "bollicine")}
      {renderSection("Altri vini", altri, "altri-vini")}
    </div>
  );
}