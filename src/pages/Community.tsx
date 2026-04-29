import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: "#05080c",
      minHeight: "100vh",
      color: "#fff",
      padding: 20
    }}>

      {/* HEADER */}
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>
        Il Baretto Community
      </h1>

      <p style={{ color: "#aaa", marginBottom: 30 }}>
        Il club digitale dove esperti e appassionati si incontrano
      </p>

      {/* BARETTO + CTA */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        marginBottom: 40
      }}>

        {/* BARETTO */}
        <div style={{
          background: "linear-gradient(135deg,#3a2a00,#5a3e00)",
          borderRadius: 20,
          padding: 20
        }}>

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
            style={{
              marginTop: 20,
              width: "100%",
              background: "#f5a623",
              border: "none",
              padding: 14,
              borderRadius: 12,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Accedi alla chat
          </button>
        </div>

        {/* CTA DESTRA */}
        <div style={{
          background: "linear-gradient(135deg,#3a2a00,#5a3e00)",
          borderRadius: 30,
          padding: 30,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
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
            style={{
              background: "#000",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: 30,
              border: "none",
              cursor: "pointer",
              alignSelf: "center",
              fontWeight: "bold"
            }}
          >
            Crea il tuo cocktail
          </button>
        </div>
      </div>

      {/* CREA POST */}
      <div style={{
        background: "#111",
        borderRadius: 20,
        padding: 15,
        marginBottom: 30
      }}>
        <div style={{
          background: "#1a1f25",
          padding: 12,
          borderRadius: 30,
          marginBottom: 10,
          color: "#888"
        }}>
          A cosa stai pensando?
        </div>

        <button style={{
          background: "#f5a623",
          border: "none",
          padding: "10px 20px",
          borderRadius: 20,
          fontWeight: "bold",
          cursor: "pointer"
        }}>
          Pubblica
        </button>
      </div>

      {/* COMMUNITY GRID */}
      <h2 style={{ marginBottom: 10 }}>
        Dalla Community
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 15
      }}>

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
  );
}