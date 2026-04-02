import "../App.css";
export default function InAttesa() {
  return (
    <div className="form-page fade-in">
      <div className="form-card" style={{ textAlign: "center" }}>
        <h1 style={{ color: "#C47A2C" }}>Account in attesa</h1>
        <p>Il tuo account è in fase di approvazione.</p>
        <p>Appena verrà approvato potrai accedere alla piattaforma.</p>
      </div>
    </div>
  );
}