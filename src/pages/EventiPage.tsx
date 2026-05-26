export default function EventiPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
        color: "white",
        padding: "120px 24px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            marginBottom: 20,
          }}
        >
          Eventi DrinkWise
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 24,
            padding: 30,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Nessun evento disponibile al momento
        </div>
      </div>
    </div>
  );
}