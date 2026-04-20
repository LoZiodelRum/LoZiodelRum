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

// Placeholder per altri box
const TopUsersBox = () => (
  <section className="community-box" style={{height: 120, background: "#181818", borderRadius: 8, marginBottom: 16, padding: 16, color: "#fff"}}>
    <h2 style={{margin:0, fontSize:18, color:'#FFCC48'}}>Top Utenti</h2>
    <div style={{marginTop:8, color:'#aaa'}}>Classifica utenti attivi</div>
  </section>
);
const EventsBox = () => (
  <section className="community-box" style={{height: 120, background: "#181818", borderRadius: 8, marginBottom: 16, padding: 16, color: "#fff"}}>
    <h2 style={{margin:0, fontSize:18, color:'#FFCC48'}}>Eventi</h2>
    <div style={{marginTop:8, color:'#aaa'}}>Prossimi eventi della community</div>
  </section>
);
const LatestPostsBox = () => (
  <section className="community-box" style={{height: 120, background: "#181818", borderRadius: 8, marginBottom: 16, padding: 16, color: "#fff"}}>
    <h2 style={{margin:0, fontSize:18, color:'#FFCC48'}}>Ultimi Post</h2>
    <div style={{marginTop:8, color:'#aaa'}}>Ultimi post/articoli pubblicati</div>
  </section>
);
const RankingBox = () => (
  <section className="community-box" style={{height: 120, background: "#181818", borderRadius: 8, marginBottom: 16, padding: 16, color: "#fff"}}>
    <h2 style={{margin:0, fontSize:18, color:'#FFCC48'}}>Ranking & Trofei</h2>
    <div style={{marginTop:8, color:'#aaa'}}>Trofei e ranking della community</div>
  </section>
);

export default function Community() {
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
      <div style={{width: 420, minWidth: 320, maxWidth: 480, padding: 24, borderRight: "2px solid #222"}}>
        <SignupInviteBox />
        <TopUsersBox />
        <EventsBox />
      </div>
      {/* Colonna centrale (simile a grid) */}
      <div style={{flex: 1, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start"}}>
        <BarettoPreview />
        <LatestPostsBox />
        <RankingBox />
      </div>
    </div>
  );
}