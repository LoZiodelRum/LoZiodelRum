import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Target } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScannerQR() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ScannerQR caricato");

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 260,
      },
      false
    );

    console.log("Scanner creato");

    scanner.render(
      (decodedText) => {
        console.log("QR LETTO:", decodedText);
      },
      (error) => {
        // evita spam in console
      }
    );

    console.log("Render scanner");

    return () => {
      scanner
        .clear()
        .then(() => console.log("Scanner chiuso"))
        .catch(() => {});
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top,#071326 0%,#020817 45%,#01040d 100%)",
        color: "white",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              margin: 0,
            }}
          >
            Scan QR Code
          </h1>

          <button
            onClick={() => navigate(-1)}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.1)",
              background: "#050b16",
              color: "white",
              cursor: "pointer",
            }}
          >
            <X size={28} />
          </button>
        </div>

        {/* SCANNER */}

        <div
          style={{
            border: "4px solid #1de9f6",
            borderRadius: 32,
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(0,255,255,.15)",
            marginBottom: 32,
            background: "#000",
          }}
        >
          <div id="reader" />
        </div>

        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,.7)",
            fontSize: 22,
            marginBottom: 40,
          }}
        >
          Inquadra il QR code del locale
        </div>

        {/* BADGE */}

        <div
          style={{
            background: "#050b16",
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,.08)",
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              background: "rgba(0,255,255,.08)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Target size={34} color="#1de9f6" />
          </div>

          <div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              0 locali visitati
            </div>

            <div
              style={{
                color: "rgba(255,255,255,.55)",
                marginTop: 4,
              }}
            >
              50 al prossimo badge
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}