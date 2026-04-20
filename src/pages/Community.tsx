import "../App.css";
import { motion } from "framer-motion";
import {
  Award,
  Beaker,
  BookOpen,
  CalendarDays,
  Circle,
  Flame,
  MessageSquareText,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";
import BarettoPreview from "../components/BarettoPreview";

const BOX_WIDTH = 400;
const BOX_STYLE = {
  width: BOX_WIDTH,
  minWidth: BOX_WIDTH,
  maxWidth: BOX_WIDTH,
  background: "#181818",
  borderRadius: 18,
  marginBottom: 32,
  padding: 28,
  color: "#fff",
  border: "2px solid #FFCC48",
  boxSizing: "border-box" as const,
  boxShadow: "0 2px 16px #0004" as const,
};

const TopUsersBox = () => (
  <section style={BOX_STYLE}>
    <h2 style={{ margin: 0, fontSize: 24, color: "#FFCC48", fontWeight: 700 }}>
      Top Utenti
    </h2>
    <div style={{ marginTop: 12, color: "#aaa", fontSize: 18 }}>
      Classifica utenti attivi
    </div>
  </section>
);
const EventsBox = () => (
  <section style={BOX_STYLE}>
    <h2 style={{ margin: 0, fontSize: 24, color: "#FFCC48", fontWeight: 700 }}>
      Eventi
    </h2>
    <div style={{ marginTop: 12, color: "#aaa", fontSize: 18 }}>
      Prossimi eventi della community
    </div>
  </section>
);
const LatestPostsBox = () => (
  <section style={BOX_STYLE}>
    <h2 style={{ margin: 0, fontSize: 24, color: "#FFCC48", fontWeight: 700 }}>
      Ultimi Post
    </h2>
    <div style={{ marginTop: 12, color: "#aaa", fontSize: 18 }}>
      Ultimi post/articoli pubblicati
    </div>
  </section>
);
const RankingBox = () => (
  <section style={BOX_STYLE}>
    <h2 style={{ margin: 0, fontSize: 24, color: "#FFCC48", fontWeight: 700 }}>
      Ranking & Trofei
    </h2>
    <div style={{ marginTop: 12, color: "#aaa", fontSize: 18 }}>
      Trofei e ranking della community
    </div>
  </section>
);

const IlBarettoBox = ({ online = 0 }: { online: number }) => (
  <section
    style={{ ...BOX_STYLE, cursor: "pointer" }}
    onClick={() => window.location.href = "/baretto"}
  >
    <h2 style={{ margin: 0, fontSize: 24, color: "#FFCC48", fontWeight: 700 }}>
      Il Baretto
    </h2>
    <div style={{ marginTop: 12, color: "#bbb", fontSize: 32, fontWeight: 700 }}>
      {online} utenti online
    </div>
  </section>
);

export default function Community() {
  const [utentiOnline] = useState(5); // Sostituire con dato reale se disponibile

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      height: "100vh",
      background: "#101010",
      color: "#fff",
      fontFamily: "inherit"
    }}>
      {/* Colonna sinistra */}
      <div style={{ width: 420, minWidth: 320, maxWidth: 480, padding: 24, borderRight: "2px solid #222" }}>
        <SignupInviteBox />
        <TopUsersBox />
        <EventsBox />
      </div>
      {/* Colonna centrale (simile a grid) */}
      <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
        <IlBarettoBox online={utentiOnline} />
        <LatestPostsBox />
        <RankingBox />
      </div>
    </div>
  );
}