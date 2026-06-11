import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function BarettoCreate() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoria, setCategoria] = useState("Cocktail");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nome.trim()) {
      alert("Inserisci il nome del tavolo");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("chat_rooms").insert({
      nome,
      descrizione,
      categoria,
      pubblico: true,
      deleted: false,
      creato_da: user?.id || null,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Errore durante la creazione");
      return;
    }

    navigate("/baretto");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#050d18 0%,#071325 100%)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
        }}
      >
        <button
          onClick={() => navigate("/baretto")}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "22px",
            marginBottom: "20px",
          }}
        >
          ←
        </button>

        <h1
          style={{
            textAlign: "center",
            fontSize: "42px",
            marginBottom: "30px",
            color: "#ffffff",
          }}
        >
          Nuovo Tavolo
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              border: "2px solid #D4A54A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "60px",
              color: "#D4A54A",
              boxShadow: "0 0 30px rgba(212,165,74,0.25)",
            }}
          >
            🥂
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#D4A54A",
              }}
            >
              Nome Tavolo
            </label>

            <input
              placeholder="Es. Amanti del Gin"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{
                width: "100%",
                height: "60px",
                borderRadius: "14px",
                border: "1px solid #2a3444",
                background: "#0f1724",
                color: "#fff",
                padding: "0 16px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#D4A54A",
              }}
            >
              Descrizione
            </label>

            <textarea
              placeholder="Cosa si parlerà in questo tavolo?"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                borderRadius: "14px",
                border: "1px solid #2a3444",
                background: "#0f1724",
                color: "#fff",
                padding: "16px",
                fontSize: "16px",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#D4A54A",
              }}
            >
              Categoria
            </label>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{
                width: "100%",
                height: "60px",
                borderRadius: "14px",
                border: "1px solid #2a3444",
                background: "#0f1724",
                color: "#fff",
                padding: "0 16px",
                fontSize: "16px",
              }}
            >
              <option>Cocktail</option>
              <option>Rum</option>
              <option>Whisky</option>
              <option>Vino</option>
              <option>Locali</option>
              <option>Eventi</option>
            </select>
          </div>

          <div
            style={{
              border: "1px solid #D4A54A",
              borderRadius: "18px",
              padding: "24px",
              background: "rgba(212,165,74,0.05)",
            }}
          >
            <div
              style={{
                color: "#D4A54A",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              🛡️ RISPETTA LE REGOLE
            </div>

            <div
              style={{
                lineHeight: 1.8,
                opacity: 0.9,
              }}
            >
              Il Tavolo deve trattare argomenti inerenti al
              mondo DrinkWise.
              <br />
              <br />
              Mantieni sempre un linguaggio rispettoso.
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              height: "64px",
              border: "none",
              borderRadius: "16px",
              background: "#D4A54A",
              color: "#000",
              fontWeight: 700,
              fontSize: "18px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {loading ? "CREAZIONE..." : "CREA TAVOLO"}
          </button>
        </div>
      </div>
    </div>
  );
}