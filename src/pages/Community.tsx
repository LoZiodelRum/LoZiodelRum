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
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";
import BarettoPreview from "../components/BarettoPreview";

export default function Community() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useUser();
  const [selectedAroma, setSelectedAroma] = useState("Vaniglia");

  const events = [
    { title: "Masterclass Jamaica Funk", date: "12 Apr", seats: "8 posti" },
    { title: "Rum Agricole Intensive", date: "18 Apr", seats: "3 posti" },
    { title: "Verticale Demerara", date: "25 Apr", seats: "12 posti" },
  ];

  const aromas = ["Vaniglia", "Tropicale", "Spezie", "Affumicato", "Cacao", "Agrumato", "Mela", "Erbaceo"];

  const labRecipes = [
    "Smoked Daiquiri",
    "Cacao Old Fashioned",
    "Island Negroni",
    "Pineapple Garibaldi",
  ];

  const topUsers = [
    { name: "Francesca", pts: 1240 },
    { name: "Riccardo", pts: 1110 },
    { name: "Elena", pts: 980 },
  ];

  const passportProgress = 72;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Esploratore";

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.06, duration: 0.35, ease: "easeOut" as const },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  };

  if (loading) {
    return (
      <div className="page fade-in" style={{ padding: 40, background: "#0c0a09", minHeight: "100vh" }}>
        <h1>Community</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page fade-in" style={{ padding: 40, background: "#0c0a09", minHeight: "100vh" }}>
        <h1 style={{ color: "#f5a623" }}>Community DrinkWise</h1>
        <SignupInviteBox description="Registrati o accedi per pubblicare contenuti, commentare e partecipare alla community." />
      </div>
    );
  }

  return (
    <div className="page page-full-bleed fade-in community-page" style={{ padding: 0, background: "#0c0a09", minHeight: "100vh" }}>
      <style>{`
        .community-shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px;
        }
        .community-title {
          margin: 0 0 18px;
          color: #f5a623;
          font-size: clamp(1.5rem, 3.2vw, 2.3rem);
          letter-spacing: 0.01em;
        }
        .community-bento {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 14px;
        }
        .community-card {
          background: rgba(28, 25, 23, 0.4);
          border: 1px solid rgba(68, 64, 60, 0.5);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 16px;
          color: #e7e5e4;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }
        .community-card:hover {
          transform: translateY(-4px);
          border-color: rgba(245, 166, 35, 0.45);
          box-shadow: 0 12px 26px rgba(245, 166, 35, 0.16);
        }
        .community-card h3 {
          margin: 0 0 12px;
          color: #fafaf9;
          font-size: 1.02rem;
        }
        .community-meta {
          color: #a8a29e;
          font-size: 0.9rem;
        }
        .span-4 { grid-column: span 4; }
        .span-5 { grid-column: span 5; }
        .span-6 { grid-column: span 6; }
        .span-7 { grid-column: span 7; }
        .span-8 { grid-column: span 8; }
        .word-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .word-chip {
          border: 1px solid rgba(120, 113, 108, 0.6);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.85rem;
          color: #d6d3d1;
          background: rgba(28, 25, 23, 0.6);
          cursor: pointer;
        }
        .word-chip.active {
          background: rgba(245, 166, 35, 0.18);
          border-color: rgba(245, 166, 35, 0.7);
          color: #fcd34d;
        }
        .h-scroll {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(220px, 1fr);
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .rank-avatar {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, #fcd34d, #92400e);
          box-shadow: 0 0 22px rgba(245, 166, 35, 0.35);
        }
        @media (max-width: 1024px) {
          .community-shell { padding: 20px; }
          .span-8, .span-7, .span-6, .span-5, .span-4 { grid-column: span 12; }
        }
      `}</style>

      <div className="community-shell">
        <h1 className="community-title">Community Hub</h1>

        <motion.div className="community-bento" variants={containerVariants} initial="hidden" animate="show">
          {/* BLOCCO 1 - Header Utente */}
          <motion.section className="community-card span-7" variants={cardVariants}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Award size={18} color="#f5a623" /> Header Utente</h3>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#fafaf9" }}>{displayName}</div>
                <div className="community-meta">Grado: Mastro Distillatore</div>
              </div>
              <div style={{ minWidth: 220, flex: 1 }}>
                <div className="community-meta" style={{ marginBottom: 6 }}>Passaporto Rum {passportProgress}%</div>
                <div style={{ height: 10, borderRadius: 999, background: "#292524", overflow: "hidden" }}>
                  <div style={{ width: `${passportProgress}%`, height: "100%", background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                </div>
              </div>
            </div>
          </motion.section>

          {/* BLOCCO 2 - Il Baretto (Chat) */}
          <motion.section
            className="community-card span-5"
            variants={cardVariants}
            onClick={() => navigate("/community/baretto")}
            style={{ cursor: "pointer" }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><MessageSquareText size={18} color="#f5a623" /> Il Baretto</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <BarettoPreview />
            </div>
          </motion.section>

          {/* BLOCCO 3 - Calendario Masterclass */}
          <motion.section className="community-card span-6" variants={cardVariants}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><CalendarDays size={18} color="#f5a623" /> Calendario Masterclass</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {events.map((e) => (
                <div key={e.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, background: "rgba(12,10,9,0.55)" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div className="community-meta">{e.date} · {e.seats}</div>
                  </div>
                  <button style={{ background: "#f59e0b", color: "#1c1917", border: "none", borderRadius: 10, padding: "8px 10px", fontWeight: 700, cursor: "pointer" }}>
                    Prenota Posto
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* BLOCCO 4 - Sfida Blind Tasting */}
          <motion.section className="community-card span-6" variants={cardVariants}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={18} color="#f5a623" /> Sfida Blind Tasting</h3>
            <div className="word-cloud">
              {aromas.map((aroma) => (
                <button
                  key={aroma}
                  className={`word-chip${selectedAroma === aroma ? " active" : ""}`}
                  onClick={() => setSelectedAroma(aroma)}
                >
                  {aroma}
                </button>
              ))}
            </div>
            <div className="community-meta" style={{ marginTop: 10 }}>
              Sentore selezionato: <strong style={{ color: "#fcd34d" }}>{selectedAroma}</strong>
            </div>
          </motion.section>

          {/* BLOCCO 7 - Mixology Lab */}
          <motion.section className="community-card span-4" variants={cardVariants}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Beaker size={18} color="#f5a623" /> Mixology Lab</h3>
            <div className="h-scroll">
              {labRecipes.map((r) => (
                <div key={r} style={{ background: "rgba(12,10,9,0.55)", border: "1px solid rgba(120,113,108,0.35)", borderRadius: 12, padding: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Flame size={14} color="#f59e0b" />
                    <strong style={{ fontSize: 13 }}>{r}</strong>
                  </div>
                  <div className="community-meta" style={{ fontSize: 12 }}>Ricetta votata dalla community</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* BLOCCO 8 - Leaderboard */}
          <motion.section className="community-card span-6" variants={cardVariants}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Trophy size={18} color="#f5a623" /> Leaderboard</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {topUsers.map((u, idx) => (
                <div key={u.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(12,10,9,0.55)", borderRadius: 12, padding: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="rank-avatar" />
                    <div>
                      <div style={{ fontWeight: 700 }}>#{idx + 1} {u.name}</div>
                      <div className="community-meta">{u.pts} punti</div>
                    </div>
                  </div>
                  <Users size={16} color="#f5a623" />
                </div>
              ))}
            </div>
          </motion.section>

          {/* BLOCCO 9 - Wiki Tecnica */}
          <motion.section className="community-card span-6" variants={cardVariants}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><BookOpen size={18} color="#f5a623" /> Wiki Tecnica</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
              {["Dunder", "Esters", "Angel's Share", "Column Still", "Congeners", "Aging"].map((t) => (
                <button key={t} className="word-chip" style={{ textAlign: "center" }}>{t}</button>
              ))}
            </div>
            <div className="community-meta" style={{ marginTop: 10 }}>Accesso rapido al dizionario tecnico della community.</div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}