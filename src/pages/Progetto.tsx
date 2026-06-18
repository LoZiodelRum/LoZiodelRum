import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, QrCode, Users, Trophy, Calendar } from "lucide-react";

export default function Progetto() {
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minHeight: "240px",
};
  return (
    <div
      style={{
        background: "#0b0b0b",
        color: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {/* HERO */}

      <section
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 20px",
          background:
            "linear-gradient(180deg,#0b0b0b 0%,#111827 45%,#0b0b0b 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
          }}
        >
          <div
            style={{
              color: "#f5a623",
              fontWeight: 700,
              letterSpacing: "2px",
              marginBottom: "20px",
            }}
          >
            IL NETWORK DEL BERE CONSAPEVOLE
          </div>

          <h1
            style={{
              fontSize: "clamp(42px,7vw,88px)",
              lineHeight: 1,
              marginBottom: "24px",
              fontWeight: 900,
            }}
          >
            DRINKWISE
          </h1>

          <p
            style={{
              maxWidth: "850px",
              margin: "0 auto",
              fontSize: "clamp(18px,2vw,26px)",
              lineHeight: 1.6,
              color: "#cbd5e1",
            }}
          >
            DrinkWise è il primo network dedicato al bere consapevole che
            collega utenti, locali, bartender, eventi e aziende in un unico
            ecosistema digitale.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "40px",
            }}
          >
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "#f5a623",
                color: "#000",
                border: "none",
                padding: "16px 28px",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Entra nel Network
            </button>

            <button
              onClick={() => navigate("/mappa")}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid #334155",
                padding: "16px 28px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              Esplora la Mappa
            </button>
          </div>
        </div>
      </section>

      {/* MISSIONE */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 20px",
        }}
      >
        <h2
          style={{
            fontSize: "48px",
            marginBottom: "30px",
          }}
        >
          La nostra missione
        </h2>

        <p
          style={{
            fontSize: "20px",
            lineHeight: 1.8,
            color: "#cbd5e1",
          }}
        >
          Vogliamo creare una comunità internazionale di appassionati,
          professionisti e locali che condividano una cultura del bere più
          consapevole, più informata e più responsabile.
        </p>
      </section>
      {/* COME FUNZIONA */}

<section
  style={{
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "40px 20px 120px",
  }}
>
  <h2
    style={{
      fontSize: "48px",
      marginBottom: "20px",
      textAlign: "center",
    }}
  >
    Come funziona DrinkWise
  </h2>

  <p
    style={{
      textAlign: "center",
      maxWidth: "900px",
      margin: "0 auto 60px",
      color: "#cbd5e1",
      fontSize: "18px",
      lineHeight: 1.8,
    }}
  >
    Un unico ecosistema che collega utenti, locali, bartender,
    eventi e aziende del settore beverage.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
      gap: "24px",
    }}
  >

    <div style={cardStyle}>
      <MapPin size={42} color="#f5a623" />
      <h3>Mappa Interattiva</h3>
      <p>
        Trova locali, cocktail bar, rum bar, wine bar
        e distillerie vicino a te.
      </p>
    </div>

    <div style={cardStyle}>
      <QrCode size={42} color="#f5a623" />
      <h3>QR Check-In</h3>
      <p>
        Accumula esperienza, badge e statistiche
        visitando i locali aderenti.
      </p>
    </div>

    <div style={cardStyle}>
      <Users size={42} color="#f5a623" />
      <h3>Community</h3>
      <p>
        Conosci altri appassionati,
        condividi recensioni ed esperienze.
      </p>
    </div>

    <div style={cardStyle}>
      <Calendar size={42} color="#f5a623" />
      <h3>Eventi</h3>
      <p>
        Masterclass, degustazioni,
        guest shift e festival.
      </p>
    </div>

    <div style={cardStyle}>
      <Trophy size={42} color="#f5a623" />
      <h3>Badge & Ranking</h3>
      <p>
        Scala le classifiche,
        ottieni ricompense e livelli.
      </p>
    </div>

    <div style={cardStyle}>
      <ArrowRight size={42} color="#f5a623" />
      <h3>Network</h3>
      <p>
        Un ponte tra utenti,
        locali, bartender e aziende.
      </p>
    </div>

  </div>
</section>
{/* PERCHE NASCE DRINKWISE */}

<section
  style={{
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "120px 20px",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: "50px",
      alignItems: "center",
    }}
  >
    <div>
      <div
        style={{
          color: "#f5a623",
          fontWeight: 700,
          marginBottom: "16px",
          letterSpacing: "1px",
        }}
      >
        LA VISIONE
      </div>

      <h2
        style={{
          fontSize: "56px",
          lineHeight: 1.05,
          marginBottom: "24px",
        }}
      >
        Perché nasce DrinkWise
      </h2>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "20px",
          lineHeight: 1.8,
        }}
      >
        Oggi il mondo beverage è frammentato.
        Locali, bartender, aziende e appassionati
        comunicano su piattaforme diverse senza
        un vero punto di riferimento comune.
      </p>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "20px",
          lineHeight: 1.8,
        }}
      >
        DrinkWise nasce per creare il primo network
        dedicato al bere consapevole, un ecosistema
        che collega persone, esperienze, eventi,
        locali e professionisti.
      </p>
    </div>

    <div
      style={{
        height: "500px",
        borderRadius: "28px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#f5a623 0%,#f59e0b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "120px",
        fontWeight: 900,
        color: "#081120",
      }}
    >
      DW
    </div>
  </div>
</section>
    </div>
  );
}