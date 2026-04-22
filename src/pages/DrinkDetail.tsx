import "../App.css";


// TODO: Implementazione read-only della pagina DrinkDetail. Rimuovere ogni logica admin/modifica.
export default function DrinkDetail() {
  return <div className="page fade-in">Scheda drink non disponibile</div>;
}

/* STILI ORIGINALI */

const layout = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 60,
  maxWidth: "min(100%, 68rem)",
  margin: "10px auto 0",
};

const left = { flex: 1 };
const right = { flex: "1 1 320px" };

const title = {
  fontSize: "clamp(1.8rem, 5vw, 2.25rem)",
  marginBottom: 20,
  color: "#4b2e1f",
};

const mobileCocktailTitle = {
  display: "none",
  fontSize: "clamp(1.6rem, 6vw, 2rem)",
  margin: "8px 0 14px",
  color: "#4b2e1f",
};

const description = { marginBottom: 20, color: "#333" };

const sectionTitle = {
  marginTop: 25,
  marginBottom: 8,
  fontSize: 18,
  color: "#4b2e1f",
};

const text = { color: "#444" };

const image = {
  width: "100%",
  borderRadius: 16,
  marginBottom: 20,
};

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  overflow: "hidden",
};

const boxTitle = { marginBottom: 10, color: "#4b2e1f" };

const row = {
  padding: "6px 0",
  borderBottom: "1px solid #eee",
  color: "#4b2e1f",
};

const editorBox = {
  background: "#fff",
  padding: 20,
  marginBottom: 30,
  borderRadius: 16,
  overflow: "hidden",
};

const field = {
  marginBottom: 10,
  display: "flex",
  flexDirection: "column" as const,
};

const inputStyle = {
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const textareaStyle = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const buttons = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const btnGreen = {
  background: "green",
  color: "#fff",
  padding: "8px 16px",
};

const btnRed = {
  background: "red",
  color: "#fff",
  padding: "8px 16px",
};