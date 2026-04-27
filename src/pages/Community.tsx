import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();

  const COLORS = {
    bg: "#05080c",
    gradient: "linear-gradient(135deg, #0b0f14, #182232)",

    card: "#0f1722",
    border: "#263241",

    gold: "#f5c76b",
    goldSoft: "#e0b15f",

    text: "#ffffff",
    textSoft: "#94a3b8",

    bubbleLeft: "#1e2a38",
    bubbleRight: "#f5c76b",
  };

  const styles: any = {
    container: {
      minHeight: "100vh",
      background: COLORS.bg,
      padding: "40px 20px",
    },

    hero: {
      maxWidth: "1100px",
      margin: "0 auto",
      marginBottom: "50px",
    },

    heroTitle: {
      fontSize: "42px",
      fontWeight: "700",
      color: COLORS.text,
      marginBottom: "10px",
    },

    heroSub: {
      color: COLORS.textSoft,
      fontSize: "16px",
    },

    heroButtons: {
      display: "flex",
      gap: "12px",
      marginTop: "25px",
      flexWrap: "wrap",
    },

    layout: {
      maxWidth: "1100px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "30px",
    },

    left: {
      display: "flex",
      flexDirection: "column",
      gap: "30px",
    },

    right: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },

    baretto: {
      background: COLORS.gradient,
      borderRadius: "18px",
      padding: "22px",
      border: `1px solid ${COLORS.border}`,
      boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
    },

    barettoHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "18px",
    },

    chatPreview: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },

    msgLeft: {
      background: COLORS.bubbleLeft,
      color: COLORS.text,
      padding: "10px 14px",
      borderRadius: "10px",
      maxWidth: "55%",
      fontSize: "13px",
    },

    msgRight: {
      background: COLORS.bubbleRight,
      color: "#000",
      padding: "10px 14px",
      borderRadius: "10px",
      maxWidth: "55%",
      fontSize: "13px",
      marginLeft: "auto",
      fontWeight: "500",
    },

    barettoButtons: {
      marginTop: "18px",
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },

    card: {
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "14px",
      padding: "18px",
      cursor: "pointer",
      transition: "0.2s",
    },

    mapBox: {
      height: "300px",
      borderRadius: "18px",
      overflow: "hidden",
      border: `1px solid ${COLORS.border}`,
      background: "#0b1220",
    },

    cta: {
      background: COLORS.gradient,
      borderRadius: "20px",
      padding: "50px",
      textAlign: "center",
      border: `1px solid ${COLORS.border}`,
      cursor: "pointer",
      transition: "0.2s",
    },
  };

  return (
    <div style={styles.container}>
      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          La Community del Bere Consapevole
        </h1>

        <p style={styles.heroSub}>
          “Un rum non si beve: si ascolta.”
        </p>

        <div style={styles.heroButtons}>
          <button
            className="btn-gold"
            onClick={() => navigate("/crea")}
          >
            Scrivi un Post
          </button>

          <button
            className="btn-outline"
            onClick={() => navigate("/mappa")}
          >
            Esplora Locali
          </button>
        </div>
      </div>

      {/* GRID */}
      <div style={styles.layout}>
        {/* LEFT */}
        <div style={styles.left}>
          {/* BARETTO */}
          <div style={styles.baretto}>
            <div style={styles.barettoHeader}>
              <div>
                <h3 style={{ color: COLORS.text }}>
                  Il Baretto
                </h3>
                <p style={{ color: COLORS.textSoft }}>
                  Conversazioni in tempo reale
                </p>
              </div>

              <span style={{ color: COLORS.gold }}>
                124 utenti online
              </span>
            </div>

            <div style={styles.chatPreview}>
              <div style={styles.msgLeft}>
                Qualcuno ha provato la nuova riserva agricola?
              </div>

              <div style={styles.msgRight}>
                Sì, note di canna freschissime incredibili 🥃
              </div>

              <div style={styles.msgLeft}>
                Sto organizzando una serata rum, chi si unisce?
              </div>
            </div>

            <div style={styles.barettoButtons}>
              <button
                className="btn-gold"
                onClick={() => navigate("/baretto/rum")}
              >
                Entra nel Baretto 🔥
              </button>

              <button
                className="btn-outline"
                onClick={() => navigate("/community/stanze")}
              >
                Apri tutte le stanze
              </button>
            </div>
          </div>

          {/* FEED */}
          <div>
            <h2 style={{ color: COLORS.text }}>
              Feed della Community
            </h2>

            <p style={{ color: COLORS.textSoft }}>
              Nessun contenuto disponibile.
            </p>
          </div>

          {/* MAPPA */}
          <div>
            <h2 style={{ color: COLORS.text }}>
              Mappa Locali
            </h2>

            <div style={styles.mapBox}>
              {/* QUI INSERISCI LA TUA MAPPA */}
            </div>
          </div>

          {/* CTA */}
          <div
            style={styles.cta}
            onClick={() => navigate("/crea")}
            onMouseEnter={(e: any) =>
              (e.currentTarget.style.transform = "scale(1.02)")
            }
            onMouseLeave={(e: any) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <h2 style={{ color: COLORS.text }}>
              Crea il tuo cocktail
            </h2>

            <p style={{ color: COLORS.textSoft }}>
              Sfida la community e fatti votare
            </p>

            <button className="btn-gold">
              Crea il tuo drink
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <div
            style={styles.card}
            onClick={() => navigate("/drink")}
            onMouseEnter={(e: any) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e: any) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h3 style={{ color: COLORS.text }}>
              Consigli dello Zio
            </h3>

            <p style={{ color: COLORS.textSoft }}>
              Barbancourt 8
            </p>

            <p style={{ color: COLORS.textSoft }}>
              Smith & Cross
            </p>
          </div>

          <div
            style={styles.card}
            onClick={() => navigate("/eventi")}
            onMouseEnter={(e: any) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e: any) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h3 style={{ color: COLORS.text }}>
              Eventi & Annunci
            </h3>

            <p style={{ color: COLORS.textSoft }}>
              Degustazione Rum – Napoli
            </p>

            <p style={{ color: COLORS.textSoft }}>
              Cocktail Night – Milano
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}