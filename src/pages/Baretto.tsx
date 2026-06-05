export default function Baretto() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060b14",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1>🍺 Il Baretto</h1>

      <p style={{ maxWidth: "500px", opacity: 0.8 }}>
        La nuova Chat Room DrinkWise è attualmente in costruzione.
      </p>

      <p style={{ opacity: 0.6 }}>
        Prossimamente potrai entrare nelle stanze tematiche,
        partecipare alle conversazioni e incontrare la community.
      </p>
    </div>
  );
}