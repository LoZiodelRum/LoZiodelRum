import "../App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";

export default function Crea() {
  const { isAuthenticated, loading } = useUser();
  const navigate = useNavigate();
  const [cocktail, setCocktail] = useState<any[]>([]);
  const [distillati, setDistillati] = useState<any[]>([]);
  const [vini, setVini] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    drink: "",
    distillato: "",
    vino: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchLists = async () => {
      const [cocktailRes, distillatiRes, viniRes] = await Promise.all([
        supabase.from("cocktail").select("id,nome").order("nome", { ascending: true }),
        supabase.from("distillati").select("id,nome").order("nome", { ascending: true }),
        supabase.from("vini").select("id,nome").order("nome", { ascending: true }),
      ]);

      if (!cocktailRes.error) setCocktail(cocktailRes.data || []);
      if (!distillatiRes.error) setDistillati(distillatiRes.data || []);
      if (!viniRes.error) setVini(viniRes.data || []);
    };

    void fetchLists();
  }, []);

  const labelStyle = {
    color: "#f5a623",
    fontWeight: 600,
    marginBottom: 8,
    display: "block",
  } as const;

  const selectStyle = {
    width: "100%",
    background: "#0B1220",
    border: "1px solid #4b5563",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
  } as const;

  const addBoxStyle = {
    marginTop: 12,
    border: "1px dashed #f5a623",
    borderRadius: 12,
    padding: 14,
    textAlign: "center",
    color: "#f5a623",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const;

  if (loading) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Crea</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Crea</h1>
        <SignupInviteBox description="Registrati o accedi per creare contenuti e usare gli strumenti della sezione Crea." />
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ padding: 40 }}>
      <h1>Crea</h1>

      <div style={{ maxWidth: 760, marginTop: 20, display: "grid", gap: 16 }}>
        <div>
          <label style={labelStyle}>Drink</label>
          <select name="drink" value={formData.drink} onChange={handleChange} style={selectStyle}>
            <option value="">Scegli</option>
            {cocktail.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
          <div
            onClick={() => navigate("/crea")}
            style={addBoxStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5a623";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f5a623";
            }}
          >
            + Aggiungi Drink
          </div>
        </div>

        <div>
          <label style={labelStyle}>Distillati</label>
          <select name="distillato" value={formData.distillato} onChange={handleChange} style={selectStyle}>
            <option value="">Scegli</option>
            {distillati.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
          <div
            onClick={() => navigate("/crea")}
            style={addBoxStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5a623";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f5a623";
            }}
          >
            + Aggiungi Distillato
          </div>
        </div>

        <div>
          <label style={labelStyle}>Vini</label>

          <select
            name="vino"
            value={formData.vino}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="">Scegli</option>
            {vini.map((vino) => (
              <option key={vino.id} value={vino.id}>
                {vino.nome}
              </option>
            ))}
          </select>

          <div
            onClick={() => navigate("/crea-vino")}
            style={addBoxStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5a623";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f5a623";
            }}
          >
            + Aggiungi Vino
          </div>
        </div>

        <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => navigate("/crea/vino")}>Registra Vino Rosso (AIS)</button>
        </div>
      </div>
    </div>
  );
}