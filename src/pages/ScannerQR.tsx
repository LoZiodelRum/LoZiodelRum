import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Target } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function ScannerQR() {
  const [scanResult, setScanResult] = useState<{
  success: boolean;
  message: string;
} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode("reader");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1,
          },
          async (decodedText) => {
  try {
    console.log("QR LETTO:", decodedText);

    const { data: locale } = await supabase
      .from("Locali")
      .select("id,nome,venue_qr_id")
      .eq("venue_qr_id", decodedText)
      .single();

    if (!locale) {
      setScanResult({
        success: false,
        message: "QR non valido",
      });
      return;
    }

    setScanResult({
      success: true,
      message: `Check-in effettuato presso ${locale.nome}`,
    });
  } catch (error) {
    console.error(error);

    setScanResult({
      success: false,
      message: "QR non valido",
    });
  }
},
          () => {}
        );

        console.log("Fotocamera posteriore avviata");
      } catch (err) {
        console.error("Errore scanner:", err);
      }
    };

    startScanner();

    return () => {
      try {
        scanner?.clear();
      } catch {
        // ignora
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top,#071326 0%,#020817 45%,#01040d 100%)",
        color: "white",
        paddingTop: "10px",
paddingLeft: "16px",
paddingRight: "16px",
paddingBottom: "16px",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
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
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
            }}
          >
            Scan QR Code
          </h1>

          <button
            onClick={() => navigate(-1)}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.1)",
              background: "#050b16",
              color: "white",
              cursor: "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div
          style={{
            border: "4px solid #1de9f6",
            borderRadius: 32,
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(0,255,255,.15)",
            marginBottom: 20,
            background: "#000",
            height: 250,
          }}
        >
          <div
            id="reader"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,.7)",
            fontSize: 16,
            marginBottom: 20,
          }}
        >
          Inquadra il QR code del locale
        </div>
{scanResult && (
  <div
    style={{
      background: scanResult.success
        ? "#00d84a"
        : "#ff3b30",
      color: "#fff",
      padding: "14px",
      borderRadius: "14px",
      textAlign: "center",
      fontWeight: 700,
      marginBottom: 20,
    }}
  >
    {scanResult.message}
  </div>
)}
        <div
          style={{
            background: "#050b16",
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,.08)",
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 24,
              background: "rgba(0,255,255,.08)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Target size={24} color="#1de9f6" />
          </div>

          <div>
            <div
              style={{
                fontSize: 24,
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