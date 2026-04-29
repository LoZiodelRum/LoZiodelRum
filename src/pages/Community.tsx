
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="community-root">

      {/* HEADER */}
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>
        Il Baretto Community
      </h1>

      <p style={{ color: "#aaa", marginBottom: 30 }}>
        Il club digitale dove esperti e appassionati si incontrano
      </p>

      {/* BARETTO + CTA */}
      <div className="community-topgrid">

        {/* BARETTO */}
        <div className="community-baretto-box">

          <div style={{ color: "#f5c76b", marginBottom: 10 }}>
            IN EVIDENZA
          </div>

          <h2 style={{ marginBottom: 10 }}>
            Il Baretto Community
          </h2>

          <p style={{ color: "#ddd", marginBottom: 20 }}>
            Il club digitale dove esperti e appassionati scambiano consigli e storie da bancone.
          </p>

          {/* CHAT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            <div style={{ background: "#2a2a2a", padding: 12, borderRadius: 12 }}>
              <b>BARTENDER_ZIO</b><br/>
              Ragazzi, qualcuno ha provato il nuovo rum agricolo di Haiti?
            </div>

            <div style={{ background: "#2a2a2a", padding: 12, borderRadius: 12 }}>
              <b>MIXOLOGYQUEEN</b><br/>
              Sì! Note floreali pazzesche 🔥
            </div>

            <div style={{ background: "#2a2a2a", padding: 12, borderRadius: 12 }}>
              <b>SANTI_COCKTAIL</b><br/>
              Quasi quasi lo inserisco in lista…
            </div>

          </div>

          <button
            onClick={() => navigate("/baretto")}
            className="community-btn community-btn-yellow"
          >
            Accedi alla chat
          </button>
        </div>

        {/* CTA DESTRA */}
        <div className="community-cta-box community-dark-bg">
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 10,
            textAlign: "center"
          }}>
            Non bere a caso.<br/>Bevi consapevole.
          </h2>

          <p style={{
            fontSize: 14,
            textAlign: "center",
            marginBottom: 20
          }}>
            Entra nel mondo DrinkWise e trasforma ogni brindisi in un'esperienza.
          </p>

          <button
            onClick={() => navigate("/crea")}
            className="community-btn community-btn-black"
          >
            Crea il tuo cocktail
          </button>
        </div>
      </div>

      {/* CREA POST */}
      <div className="community-post-box">
        <div className="community-post-placeholder">
          A cosa stai pensando?
        </div>

        <button className="community-btn community-btn-yellow">Pubblica</button>
      </div>

      {/* COMMUNITY GRID */}
      <h2 style={{ marginBottom: 10 }}>
        Dalla Community
      </h2>

      <div className="community-grid">

        <div style={{ background: "#111", borderRadius: 20, overflow: "hidden" }}>
          <img src="https://images.unsplash.com/photo-1582571352035-9c9b1e8d9b1c" style={{ width: "100%" }} />
          <div style={{ padding: 12 }}>Old Fashioned affumicato</div>
        </div>

        <div style={{ background: "#111", borderRadius: 20, overflow: "hidden" }}>
          <img src="https://images.unsplash.com/photo-1564758564027-6a3e8a8c3c1c" style={{ width: "100%" }} />
          <div style={{ padding: 12 }}>Gin Tonic botanico</div>
        </div>

      </div>

    </div>
    </>
  );
}