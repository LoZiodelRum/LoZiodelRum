import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

type VinoCard = {
  id: string;
  nome: string;
  immagine?: string | null;
  categoria: string;
  alcol: string;
  descrizione: string;
  placeholder?: boolean;
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
  const { categoria } = useParams();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase.from("vini").select("*");


    if (!error && data && data.length) {
      const mapped = data
        .map((vino: any) => ({
          id: String(vino.id),
          nome: vino.nome || vino.name || "Vino",
          immagine: vino.immagine ?? null,
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

  const rossiAll = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("rosso")), [vini]);
  const bianchiAll = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("bianco")), [vini]);
  const rosatiAll = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("rosat")), [vini]);
  const bollicineAll = useMemo(() => vini.filter((vino) => vino.categoria.toLowerCase().includes("bollic")), [vini]);
  const altriAll = useMemo(
    () => vini.filter((vino) =>
      !vino.categoria.toLowerCase().includes("rosso") &&
      !vino.categoria.toLowerCase().includes("bianco") &&
      !vino.categoria.toLowerCase().includes("rosat") &&
      !vino.categoria.toLowerCase().includes("bollic")
    ),
    [vini]
  );

  const rossi = useMemo(() => rossiAll.slice(0, 6), [rossiAll]);
  const bianchi = useMemo(() => bianchiAll.slice(0, 6), [bianchiAll]);
  const rosati = useMemo(() => rosatiAll.slice(0, 6), [rosatiAll]);
  const bollicine = useMemo(() => bollicineAll.slice(0, 6), [bollicineAll]);
  const altri = useMemo(() => altriAll.slice(0, 6), [altriAll]);

  const categoryConfig: Record<string, { title: string; items: VinoCard[] }> = {
    rossi: { title: "Rossi", items: rossiAll },
    bianchi: { title: "Bianchi", items: bianchiAll },
    rosati: { title: "Rosati", items: rosatiAll },
    bollicine: { title: "Bollicine", items: bollicineAll },
    "altri-vini": { title: "Altri vini", items: altriAll },
  };

  if (loading) {
    return <div className="page fade-in">Caricamento...</div>;
  }

  function normalizeWineName(name: string) {
    return (name || "").replace(/\s+/g, " ").trim();
  }

  function renderSection(title: string, list: VinoCard[], tipo: string, fillPlaceholders = true) {
    const cards = [...list];
    if (fillPlaceholders) {
      while (cards.length < 6) {
        cards.push({
          id: `placeholder-${tipo}-${cards.length}`,
          nome: "In arrivo",
          immagine: null,
          categoria: "",
          alcol: "",
          descrizione: "",
          placeholder: true,
        });
      }
    }

    const isCategoryPage = Boolean(categoria);

    if (!cards.length && isCategoryPage) {
      return (
        <section className="drink-section-white" id={tipo}>
          <div className="drink-section-header">
            <h2 className="drink-section-title">{title}</h2>
          </div>
          <p style={{ color: "#cbd5e1", marginTop: 8 }}>Nessun vino disponibile in questa categoria.</p>
        </section>
      );
    }

    if (!cards.length) return null;

    return (
      <section className="drink-section-white" id={tipo}>
        <div className="drink-section-header">
          <h2 className="drink-section-title">{title}</h2>
          {!isCategoryPage && (
            <button className="btn-primary btn-small" onClick={() => navigate(`/vini/categoria/${tipo}`)}>
              Vedi tutti
            </button>
          )}
        </div>

        <div className="drink-grid-uniform vini-grid">
          {cards.map((item) => (
            <article
              key={item.id}
              className="drink-card-uniform"
              role={item.placeholder ? undefined : "button"}
              tabIndex={item.placeholder ? -1 : 0}
              onClick={() => {
                if (!item.placeholder) navigate(`/vini/${item.id}`);
              }}
              onKeyDown={(e) => {
                if (!item.placeholder && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  navigate(`/vini/${item.id}`);
                }
              }}
              style={item.placeholder ? { opacity: 0.65, cursor: "default" } : undefined}
            >
              {item.immagine ? (
                <img
                  src={item.immagine}
                  alt={item.nome}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="no-img-placeholder">Immagine in arrivo</div>
              )}
              <div className="drink-card-caption">
                <h3>{normalizeWineName(item.nome)}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="fade-in drink-page-white vini-preview-page"
        style={{
          background: "#0b0b0b",
        }}
      >
        <style>{`
          .vini-preview-page .drink-section-white {
            background: transparent;
          }

          .vini-preview-page .drink-section-title {
            color: #f5a623 !important;
          }

          @media (min-width: 1024px) {
            .vini-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }

          .vini-preview-page .drink-card-caption h3 {
            font-size: 15px;
            line-height: 1.15;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
          }

          @media (max-width: 768px) {
            .vini-preview-page .drink-card-caption {
              min-height: 34px !important;
              height: 34px !important;
              padding: 0 8px !important;
            }
          }
        `}</style>
        {categoria && categoryConfig[categoria]
          ? renderSection(categoryConfig[categoria].title, categoryConfig[categoria].items, categoria, false)
          : (
            <>
              {renderSection("Rossi", rossi, "rossi")}
              {renderSection("Bianchi", bianchi, "bianchi")}
              {renderSection("Rosati", rosati, "rosati")}
              {renderSection("Bollicine", bollicine, "bollicine")}
              {renderSection("Altri vini", altri, "altri-vini")}
            </>
          )}
      </div>
    </>
  );
}