import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  async function loadUser() {
    const { data, error } = await supabase
      .from("profili")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Errore user:", error);
      return;
    }

    setUser(data);
  }

  if (!user) return <div className="page fade-in">Caricamento...</div>;

  return (
    <div className="page fade-in">
      <div style={card}>

        {/* HEADER */}
        <div style={header}>
          <img
            src={user.avatar_url || "https://via.placeholder.com/120"}
            style={avatar}
          />

          <div>
            <h1 style={name}>
              {user.nome || ""} {user.cognome || ""}
            </h1>
            <p style={username}>@{user.username || "user"}</p>
            <p style={role}>{user.ruolo || "utente"}</p>
          </div>
        </div>

        {/* BIO */}
        {user.bio_breve && (
          <p style={bio}>{user.bio_breve}</p>
        )}

        {/* INFO BASE */}
        <div style={section}>
          <h3 style={sectionTitle}>Info</h3>

          {user.email && <p style={row}>Email: {user.email}</p>}
          {user.telefono && <p style={row}>Telefono: {user.telefono}</p>}
          {user.city && <p style={row}>Città: {user.city}</p>}
        </div>

        {/* BARTENDER */}
        {user.ruolo === "bartender" && (
          <div style={section}>
            <h3 style={sectionTitle}>Profilo Bartender</h3>

            {user.esperienze_principali && (
              <p style={row}>Esperienze: {user.esperienze_principali}</p>
            )}

            {user.specialita && (
              <p style={row}>Specialità: {user.specialita}</p>
            )}

            {user.postazione_attuale && (
              <p style={row}>Postazione: {user.postazione_attuale}</p>
            )}
          </div>
        )}

        {/* PROPRIETARIO */}
        {user.ruolo === "proprietario" && ( // ✅ FIX QUI
          <div style={section}>
            <h3 style={sectionTitle}>Locale</h3>

            {user.citta_operativa && (
              <p style={row}>Città operativa: {user.citta_operativa}</p>
            )}

            {user.social_links && (
              <p style={row}>Social: {user.social_links}</p>
            )}
          </div>
        )}

        {/* GAMIFICATION */}
        <div style={section}>
          <h3 style={sectionTitle}>Attività</h3>

          <p style={row}>Level: {user.level || 0}</p>
          <p style={row}>Points: {user.points || 0}</p>
        </div>

      </div>
    </div>
  );
}

/* STILI */

const card = {
  maxWidth: "min(100%, 56rem)",
  margin: "0 auto",
  background: "#1A1A1A",
  padding: 30,
  borderRadius: 20,
  color: "white",
};

const header = {
  display: "flex",
  gap: 20,
  marginBottom: 20,
};

const avatar: React.CSSProperties = {
  width: "clamp(4.5rem, 16vw, 6.25rem)",
  height: "clamp(4.5rem, 16vw, 6.25rem)",
  borderRadius: "50%",
  objectFit: "cover",
};

const name = {
  fontSize: "clamp(1.5rem, 4.5vw, 1.75rem)",
  margin: 0,
};

const username = {
  opacity: 0.6,
};

const role = {
  marginTop: 5,
  color: "#C47A2C",
};

const bio = {
  marginTop: 20,
  marginBottom: 20,
  lineHeight: 1.5,
};

const section = {
  marginTop: 30,
};

const sectionTitle = {
  marginBottom: 10,
  color: "#C47A2C",
};

const row = {
  padding: "6px 0",
  borderBottom: "1px solid #333",
};