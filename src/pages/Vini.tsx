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



export default function Vini() {
  const [vini, setVini] = useState<VinoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { categoria } = useParams();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("vini")
      .select("*")
      .order("nome", { ascending: true });
    console.log("NUMERO VINI SUPABASE:", data?.length);
    console.log("PRIMI VINI SUPABASE:", data?.slice(0, 5));


    if (!error && data && data.length) {
      const mapped = data.map((vino: any) => {
        const imageUrl = typeof vino.immagine === "string" ? vino.immagine.trim() : "";
        return {
          id: String(vino.id),
          nome: vino.nome || "Vino",
          immagine: imageUrl,
          categoria: (vino.categoria || "Altro").trim(),
          alcol: vino.alcol || "",
          descrizione: vino.descrizione || "",
        };
      });
      setVini(mapped);
      setLoading(false);
      return;
    }


    setVini([]);
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

  function handlePreviewImageLoad(id: string, event: React.SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    setImageRatios((prev) => (prev[id] === ratio ? prev : { ...prev, [id]: ratio }));
  }

  function getBottleScale(item: VinoCard) {
    const ratio = imageRatios[item.id] ?? 1;

    if (ratio >= 1.45) return 2.05;
    if (ratio >= 1.2) return 1.75;
    if (ratio >= 1.0) return 1.45;
    if (ratio >= 0.8) return 1.18;
    return 1.03;
  }

  function getPreviewImageStyle(item: VinoCard): React.CSSProperties | undefined {
    if (item.placeholder) return undefined;

    return {
      objectFit: "contain",
      objectPosition: "center bottom",
      transform: `scale(${getBottleScale(item)})`,
      transformOrigin: "center bottom",
      background: "#ffffff",
    };
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
              {(() => {
                const imageUrl = typeof item.immagine === "string" ? item.immagine.trim() : "";
                if (imageUrl) {
                  return (
                    <img
                      src={imageUrl}
                      alt={item.nome || "Vino"}
                      className="wine-card-img"
                      style={{
                        width: "100%",
                        height: "360px",
                        objectFit: "cover",
                        display: "block",
                        background: "#111",
                        borderRadius: "12px 12px 0 0",
                        margin: 0,
                      }}
                    />
                  );
                }
                return (
                  <div style={{
                    width: "100%",
                    height: "360px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#111",
                    color: "#f5a623",
                    borderRadius: "12px 12px 0 0",
                    fontWeight: 600,
                    fontSize: 15,
                  }}>Immagine in arrivo</div>
                );
              })()}
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

          .vini-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .vini-preview-page .drink-card-uniform {
            aspect-ratio: 1 / 1.46 !important;
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

          .wine-card-img {
            width: 100% !important;
            height: 360px !important;
            object-fit: cover !important;
            display: block !important;
            background: #111 !important;
            border-radius: 12px 12px 0 0 !important;
            margin: 0 !important;
          }

          @media (max-width: 768px) {
            .vini-preview-page .drink-card-uniform {
              aspect-ratio: 1 / 1.52 !important;
            }

            .vini-preview-page .drink-card-caption {
              min-height: 34px !important;
              height: 34px !important;
              padding: 0 8px !important;
            }

            .vini-preview-page .drink-card-uniform img {
              height: calc(100% - 34px) !important;
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