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
  colore?: string | null;
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

    console.log("ERRORE VINI SUPABASE:", error);
    console.log("NUMERO VINI SUPABASE:", data?.length);
    console.log("PRIMI VINI SUPABASE:", data?.slice(0, 5));

    if (error) {
      console.error("Errore caricamento vini:", error);
      setVini([]);
      setLoading(false);
      return;
    }

    if (data && data.length) {
      const mapped: VinoCard[] = data.map((vino: any) => {
        const imageUrl = typeof vino.immagine === "string" ? vino.immagine.trim() : "";

        return {
          id: String(vino.id),
          nome: vino.nome || "Vino",
          immagine: imageUrl || null,
          categoria: String(vino.categoria || vino.tipologia || vino.tipo || "Altro").trim(),
          colore: vino.colore ? String(vino.colore).trim() : null,
          alcol: vino.alcol || vino.gradazione || vino.gradazione_alcolica || "",
          descrizione: vino.descrizione || vino.note || vino.note_degustative || "",
        };
      });

      console.log(
        "CHECK IMMAGINI VINI:",
        mapped.map((vino) => ({
          nome: vino.nome,
          categoria: vino.categoria,
          colore: vino.colore,
          immagine: vino.immagine,
        }))
      );

      setVini(mapped);
      setLoading(false);
      return;
    }

    setVini([]);
    setLoading(false);
  }

  function textForCategory(vino: VinoCard) {
    return `${vino.categoria || ""} ${vino.colore || ""} ${vino.nome || ""}`.toLowerCase();
  }

  function isRosso(vino: VinoCard) {
    const text = textForCategory(vino);
    return (
      text.includes("rosso") ||
      text.includes("rossi") ||
      text.includes("rubino") ||
      text.includes("granato") ||
      text.includes("porpora")
    );
  }

  function isBianco(vino: VinoCard) {
    const text = textForCategory(vino);
    return (
      text.includes("bianco") ||
      text.includes("bianchi") ||
      text.includes("giallo") ||
      text.includes("dorato") ||
      text.includes("paglierino") ||
      text.includes("ambrato")
    );
  }

  function isRosato(vino: VinoCard) {
    const text = textForCategory(vino);
    return (
      text.includes("rosato") ||
      text.includes("rosati") ||
      text.includes("rosa") ||
      text.includes("cerasuolo")
    );
  }

  function isBollicina(vino: VinoCard) {
    const text = textForCategory(vino);
    return (
      text.includes("bollic") ||
      text.includes("spumante") ||
      text.includes("champagne") ||
      text.includes("prosecco") ||
      text.includes("franciacorta")
    );
  }

  const rossiAll = useMemo(() => vini.filter((vino) => isRosso(vino)), [vini]);
  const bianchiAll = useMemo(() => vini.filter((vino) => isBianco(vino) && !isRosso(vino)), [vini]);
  const rosatiAll = useMemo(() => vini.filter((vino) => isRosato(vino)), [vini]);
  const bollicineAll = useMemo(() => vini.filter((vino) => isBollicina(vino)), [vini]);
  const altriAll = useMemo(
    () =>
      vini.filter(
        (vino) =>
          !isRosso(vino) &&
          !isBianco(vino) &&
          !isRosato(vino) &&
          !isBollicina(vino)
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
    return (
      <>
        <Navbar />
        <div className="page fade-in" style={{ background: "#0b0b0b", color: "#f5a623" }}>
          Caricamento vini...
        </div>
      </>
    );
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

    if (ratio >= 1.45) return 1;
    if (ratio >= 1.2) return 1;
    if (ratio >= 1.0) return 1;
    if (ratio >= 0.8) return 1;
    return 1;
  }

  function getPreviewImageStyle(item: VinoCard): React.CSSProperties | undefined {
    if (item.placeholder) return undefined;

    return {
      objectFit: "cover",
      objectPosition: "center center",
      transform: `scale(${getBottleScale(item)})`,
      transformOrigin: "center center",
      background: "#111",
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
          colore: null,
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
          {cards.map((item) => {
            const imageUrl = typeof item.immagine === "string" ? item.immagine.trim() : "";

            return (
              <article
                key={item.id}
                className="drink-card-uniform vini-card-real"
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
                <div className="wine-card-image-box">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.nome || "Vino"}
                      className="wine-card-img"
                      loading="lazy"
                      onLoad={(event) => handlePreviewImageLoad(item.id, event)}
                      onError={(event) => {
                        console.error("IMMAGINE VINO NON CARICATA:", item.nome, imageUrl);
                        event.currentTarget.style.display = "none";
                        const parent = event.currentTarget.parentElement;
                        if (parent) parent.classList.add("wine-image-error");
                      }}
                      style={getPreviewImageStyle(item)}
                    />
                  ) : (
                    <div className="wine-card-placeholder">Immagine in arrivo</div>
                  )}
                </div>

                <div className="drink-card-caption">
                  <h3>{normalizeWineName(item.nome)}</h3>
                </div>
              </article>
            );
          })}
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
          .vini-preview-page {
            min-height: 100vh;
            overflow-x: hidden;
            padding-bottom: 48px;
          }

          .vini-preview-page .drink-section-white {
            background: transparent;
          }

          .vini-preview-page .drink-section-title {
            color: #f5a623 !important;
          }

          .vini-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            align-items: stretch !important;
          }

          .vini-preview-page .drink-card-uniform.vini-card-real {
            aspect-ratio: auto !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            background: #111 !important;
            border: 1px solid rgba(255, 255, 255, 0.35) !important;
            border-radius: 12px !important;
            cursor: pointer;
          }

          .wine-card-image-box {
            width: 100% !important;
            height: 360px !important;
            min-height: 360px !important;
            max-height: 360px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            background: #111 !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 12px 12px 0 0 !important;
            position: relative !important;
          }

          .wine-card-img {
            width: 100% !important;
            height: 100% !important;
            min-height: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
            display: block !important;
            background: #111 !important;
            border-radius: 12px 12px 0 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .wine-card-placeholder {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #111 !important;
            color: #f5a623 !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            text-align: center !important;
          }

          .wine-image-error::after {
            content: "Immagine in arrivo";
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111;
            color: #f5a623;
            font-weight: 700;
            font-size: 16px;
          }

          .vini-preview-page .drink-card-caption {
            width: 100% !important;
            min-height: 54px !important;
            height: 54px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            color: #111 !important;
            padding: 0 12px !important;
            margin: 0 !important;
            border-radius: 0 0 12px 12px !important;
          }

          .vini-preview-page .drink-card-caption h3 {
            font-size: 15px;
            line-height: 1.15;
            margin: 0 !important;
            color: #111 !important;
            text-align: center !important;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
          }

          @media (max-width: 1024px) {
            .vini-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 768px) {
            .vini-grid {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }

            .vini-preview-page .drink-card-uniform.vini-card-real {
              aspect-ratio: auto !important;
              height: auto !important;
            }

            .wine-card-image-box {
              height: 260px !important;
              min-height: 260px !important;
              max-height: 260px !important;
            }

            .vini-preview-page .drink-card-caption {
              min-height: 44px !important;
              height: 44px !important;
              padding: 0 8px !important;
            }

            .vini-preview-page .drink-card-uniform img {
              height: 100% !important;
            }
          }
        `}</style>

        {categoria && categoryConfig[categoria] ? (
          renderSection(categoryConfig[categoria].title, categoryConfig[categoria].items, categoria, false)
        ) : (
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