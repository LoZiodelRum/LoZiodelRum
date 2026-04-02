import "../App.css";
export default function InAttesa() {
  return (
    <div className="page page-full-bleed fade-in" style={container}>
      <div style={box}>
        <h1 style={title}>Account in attesa</h1>

        <p style={text}>
          Il tuo account è in fase di approvazione.
        </p>

        <p style={text}>
          Appena verrà approvato potrai accedere alla piattaforma.
        </p>
      </div>
    </div>
  );
}

/* STILI */

const container = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0B0B0B",
};

const box = {
  background: "#1A1A1A",
  padding: "clamp(1.25rem, 4vw, 2.5rem)",
  borderRadius: 20,
  textAlign: "center" as const,
};

const title = {
  color: "#C47A2C",
  marginBottom: 20,
};

const text = {
  color: "white",
  marginBottom: 10,
};