// Stili hero e meta per ArticleDetail
export const hero = {
  minHeight: 340,
  background: "#222",
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: 24,
  margin: "0 0 0 0",
  position: "relative" as const,
  display: "flex",
  alignItems: "flex-end",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
};

export const overlay = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  background: "linear-gradient(180deg,rgba(0,0,0,0.0) 0%,rgba(0,0,0,0.7) 100%)",
  borderRadius: 24,
  zIndex: 1,
};

export const heroBox = {
  position: "relative" as const,
  zIndex: 2,
  background: "rgba(0,0,0,0.72)",
  borderRadius: 20,
  padding: "32px 36px 24px 36px",
  margin: "0 0 24px 0",
  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "flex-start",
};

export const badge = {
  display: "inline-block",
  background: "#f5a623",
  color: "#222",
  borderRadius: 8,
  padding: "2px 12px",
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 12,
};

export const title = {
  fontSize: "2.2rem",
  fontWeight: 800,
  margin: "0 0 10px 0",
  color: "#fff",
  lineHeight: 1.1,
};

export const subtitle = {
  fontSize: 18,
  color: "#eee",
  margin: "0 0 18px 0",
  fontWeight: 400,
};

export const meta = {
  color: "#bbb",
  fontSize: 14,
  marginTop: 8,
};

export const articleWrapper = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  marginTop: 40,
  marginBottom: 40,
};
