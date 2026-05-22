import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Community() {
  const navigate = useNavigate();

  const barettoMessages = [
    {
      user: "MIXOLOGY_NICK",
      role: "Host",
      text: "Avete provato il Japanese Imperial Cask? sente note di pesca.",
      tone: "gold",
    },
    {
      user: "ChefR",
      role: "Pro",
      text: "Si, in sour va meglio al 30/40%. Va usato in piccole dosi e sempre con acidita.",
      tone: "violet",
    },
    {
      user: "Lucas",
      role: "Guest",
      text: "Per me il Rum Sour resta imbattibile in questa fascia, prova lime fresco e miele.",
      tone: "blue",
    },
    {
      user: "Sara.M",
      role: "New",
      text: "Sicuro! Lo VOJO toda da assaggiare e poi posto il cocktail da settimana.",
      tone: "green",
    },
  ];

  const posts = [
    {
      id: "p1",
      user: "Marco.cocktail",
      badge: "Cocktail",
      title: "Rum Sour Agricolo",
      text: "Sperimentazione con sour rum e infusione tiepida su spezie dolci. Equilibrio tra struttura e freschezza.",
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
      likes: 128,
      comments: 14,
    },
    {
      id: "p2",
      user: "Chris.Forest",
      badge: "Baretto",
      title: "Pannaggio protagonista Cask 2025",
      text: "Profumi netti con legno caldo in primo piano, cuore amaro e spezia in coda. Un entry level che non perdona errori.",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      likes: 72,
      comments: 18,
    },
    {
      id: "p3",
      user: "Luca de Santis",
      badge: "Locale",
      title: "Serata al Rum Barlo - Milano",
      text: "Serata pazzesca. Carta ricca e bartender in forma. 100+ referenze, cask presentation e un Negroni al Rum sorprendente.",
      image:
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
      likes: 44,
      comments: 9,
    },
  ];

  const keywords = [
    "Molasses Rum, soft spice",
    "QSM-45YV - over 50YO",
    "Longrest cask trial in terracotta",
  ];

  const ranking = [
    { name: "MIXO.4", score: "98 sec" },
    { name: "Chris.F", score: "95 sec" },
    { name: "Lucas", score: "79 sec" },
    { name: "Sara.M", score: "71 sec" },
    { name: "Aurelio K.", score: "66 sec" },
  ];

  return (
    <>
      <Navbar />
      <div className="dw-community-page">
        <style>{`
          .dw-community-page {
            --bg: #070a11;
            --panel: #0f1523;
            --panel-soft: #101827;
            --line: #1f2a3f;
            --text: #ecf0f7;
            --muted: #8f9ab1;
            --gold: #f5a623;
            --gold-soft: rgba(245, 166, 35, 0.16);
            background: radial-gradient(circle at 90% -20%, #2a1c09 0%, rgba(7, 10, 17, 0) 42%), var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 16px;
          }

          .dw-community-shell {
            max-width: 1160px;
            margin: 0 auto;
            display: grid;
            gap: 12px;
          }

          .dw-hero {
            position: relative;
            overflow: hidden;
            border-radius: 14px;
            min-height: 264px;
            padding: 22px;
            display: grid;
            align-content: space-between;
            border: 1px solid rgba(245, 166, 35, 0.2);
            background:
              linear-gradient(105deg, rgba(7, 10, 17, 0.9) 0%, rgba(7, 10, 17, 0.68) 45%, rgba(7, 10, 17, 0.4) 100%),
              url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1800&q=80") center 45% / cover no-repeat;
          }

          .dw-hero::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.52));
            pointer-events: none;
          }

          .dw-hero > div {
            position: relative;
            z-index: 1;
          }

          .dw-badge {
            display: inline-flex;
            align-items: center;
            width: fit-content;
            border-radius: 999px;
            border: 1px solid rgba(245, 166, 35, 0.35);
            background: var(--gold-soft);
            color: var(--gold);
            font-size: 12px;
            padding: 6px 10px;
            font-weight: 700;
            letter-spacing: 0.04em;
          }

          .dw-hero h1 {
            margin: 12px 0 9px;
            font-size: clamp(30px, 5vw, 46px);
            line-height: 1.04;
            max-width: 540px;
          }

          .dw-hero h1 span { color: var(--gold); }

          .dw-hero p {
            margin: 0;
            color: #cdd5e7;
            font-size: clamp(13px, 1.65vw, 15px);
            max-width: 480px;
          }

          .dw-hero-actions {
            display: flex;
            gap: 10px;
            margin-top: 14px;
            flex-wrap: wrap;
          }

          .dw-btn {
            border: none;
            border-radius: 10px;
            padding: 8px 13px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          }

          .dw-btn-gold { background: var(--gold); color: #161207; }
          .dw-btn-dark {
            background: rgba(8, 12, 22, 0.82);
            color: #d9e0ef;
            border: 1px solid #2a374f;
          }

          .dw-hero-stats {
            margin-top: 14px;
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            font-size: 11px;
          }

          .dw-hero-stats div {
            color: #b2bfd7;
            border-right: 1px solid rgba(178, 191, 215, 0.22);
            padding-right: 12px;
          }

          .dw-hero-stats div:last-child {
            border-right: none;
            padding-right: 0;
          }

          .dw-main-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.72fr) minmax(286px, 0.82fr);
            gap: 12px;
            align-items: start;
          }

          .dw-panel {
            background: linear-gradient(180deg, var(--panel-soft), #0c1321);
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 12px;
          }

          .dw-baretto-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }

          .dw-pill {
            border-radius: 999px;
            background: rgba(245, 166, 35, 0.08);
            border: 1px solid rgba(245, 166, 35, 0.3);
            color: var(--gold);
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
          }

          .dw-chat {
            display: grid;
            gap: 8px;
            max-height: 196px;
            overflow: auto;
            padding-right: 2px;
          }

          .dw-msg {
            background: #111b2c;
            border: 1px solid #25324a;
            border-radius: 11px;
            padding: 9px 10px;
            font-size: 12px;
            line-height: 1.35;
          }

          .dw-msg-top {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 4px;
            color: #dbe5fb;
            font-size: 11px;
            font-weight: 700;
          }

          .tone-gold { color: #f9cf7a; }
          .tone-violet { color: #b7a6ff; }
          .tone-blue { color: #8bc4ff; }
          .tone-green { color: #89d39a; }

          .dw-chat-input {
            margin-top: 10px;
            width: 100%;
            border-radius: 10px;
            border: 1px solid #27354f;
            background: #0a1221;
            color: #8f9ab1;
            padding: 10px 12px;
            font-size: 12px;
          }

          .dw-feed-head {
            margin: 14px 0 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .dw-feed {
            display: grid;
            gap: 12px;
          }

          .dw-post {
            background: linear-gradient(180deg, #101827, #0d1524);
            border: 1px solid #23314a;
            border-radius: 14px;
            overflow: hidden;
          }

          .dw-post img {
            display: block;
            width: 100%;
            height: 158px;
            object-fit: cover;
          }

          .dw-post-content { padding: 11px 12px 12px; }

          .dw-post-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;
          }

          .dw-post-user { font-size: 11px; color: #9aaccc; }
          .dw-post-title {
            margin: 0 0 6px;
            font-size: 17px;
            line-height: 1.18;
          }

          .dw-post-text {
            margin: 0;
            color: #a5b2ca;
            font-size: 12px;
            line-height: 1.45;
          }

          .dw-post-actions {
            margin-top: 10px;
            display: flex;
            gap: 16px;
            color: #93a5c7;
            font-size: 11px;
          }

          .dw-side {
            display: grid;
            gap: 12px;
            position: sticky;
            top: 76px;
          }

          .dw-side h3 {
            margin: 0 0 9px;
            font-size: 13px;
            color: #f6f8fc;
            letter-spacing: 0.01em;
          }

          .dw-side-list {
            margin: 0;
            padding: 0;
            list-style: none;
            display: grid;
            gap: 8px;
          }

          .dw-side-list li {
            font-size: 12px;
            color: #a8b6ce;
            border-radius: 9px;
            padding: 8px;
            border: 1px solid #24324a;
            background: #111b2a;
          }

          .dw-ranking li {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .dw-ranking strong { color: #eef2fb; font-size: 12px; }

          .dw-bottom-nav {
            display: none;
          }

          @media (max-width: 1023px) {
            .dw-community-page {
              padding: 8px 8px 82px;
            }

            .dw-hero {
              min-height: 226px;
              border-radius: 12px;
              padding: 14px;
              background-position: center 32%;
            }

            .dw-hero h1 {
              max-width: 258px;
              font-size: clamp(24px, 7.8vw, 34px);
            }

            .dw-badge {
              font-size: 10px;
              padding: 5px 9px;
            }

            .dw-hero p {
              font-size: 12px;
            }

            .dw-main-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .dw-side {
              position: static;
              top: auto;
            }

            .dw-post img { height: 140px; }

            .dw-bottom-nav {
              display: flex;
              position: fixed;
              left: 50%;
              transform: translateX(-50%);
              bottom: 8px;
              z-index: 50;
              width: min(100% - 16px, 370px);
              border-radius: 12px;
              border: 1px solid #2a3a55;
              background: #0b1321;
              padding: 7px;
              justify-content: space-between;
              box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
            }

            .dw-bottom-nav button {
              border: none;
              background: transparent;
              color: #8ea0be;
              font-size: 10px;
              padding: 6px 7px;
              border-radius: 8px;
              min-width: 50px;
            }

            .dw-bottom-nav .active {
              background: rgba(245, 166, 35, 0.16);
              color: var(--gold);
              font-weight: 700;
            }
          }
        `}</style>

        <div className="dw-community-shell">
          <section className="dw-hero">
            <div>
              <span className="dw-badge">Community DrinkWise</span>
              <h1>
                Il posto dove gli <span>appassionati</span> si incontrano.
              </h1>
              <p>
                Baristi, sommelier, cultori e curiosi del buon bere. Benvenuto, tua drink room.
              </p>
              <div className="dw-hero-actions">
                <button className="dw-btn dw-btn-gold" onClick={() => navigate("/baretto")}>Baretto | Feed</button>
                <button className="dw-btn dw-btn-dark" onClick={() => navigate("/crea")}>Apri lounge</button>
              </div>
              <div className="dw-hero-stats">
                <div><strong>2.4k</strong> iscritti</div>
                <div><strong>742</strong> post mensili</div>
                <div><strong>18m</strong> media lettura</div>
              </div>
            </div>
          </section>

          <div className="dw-main-grid">
            <div>
              <section className="dw-panel">
                <div className="dw-baretto-title">
                  <h3 style={{ margin: 0 }}>Il Baretto</h3>
                  <span className="dw-pill">Chat dal vivo 7su7</span>
                </div>

                <div className="dw-chat">
                  {barettoMessages.map((item, idx) => (
                    <div className="dw-msg" key={`${item.user}-${idx}`}>
                      <div className="dw-msg-top">
                        <span className={`tone-${item.tone}`}>{item.user}</span>
                        <span>{item.role}</span>
                      </div>
                      <div>{item.text}</div>
                    </div>
                  ))}
                </div>

                <input className="dw-chat-input" readOnly value="Scrivi nel baretto..." />
              </section>

              <div className="dw-feed-head">
                <h2 style={{ margin: 0, fontSize: 19 }}>Feed Community</h2>
                <span className="dw-pill">Curato secondo rilevanza</span>
              </div>

              <section className="dw-feed">
                {posts.map((post) => (
                  <article className="dw-post" key={post.id}>
                    <img src={post.image} alt={post.title} />
                    <div className="dw-post-content">
                      <div className="dw-post-head">
                        <span className="dw-post-user">{post.user}</span>
                        <span className="dw-pill">{post.badge}</span>
                      </div>
                      <h3 className="dw-post-title">{post.title}</h3>
                      <p className="dw-post-text">{post.text}</p>
                      <div className="dw-post-actions">
                        <span>♡ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                        <span>↗ condividi</span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </div>

            <aside className="dw-side">
              <section className="dw-panel">
                <button className="dw-btn dw-btn-gold" style={{ width: "100%" }} onClick={() => navigate("/crea")}>+ Crea il tuo articolo</button>
              </section>

              <section className="dw-panel">
                <h3>Peggy Daily | Articolo</h3>
                <ul className="dw-side-list">
                  <li>⭐ 4.9 | Craft Cocktail: Drink & the Choice</li>
                  <li>⭐ 4.8 | Master Rosita Focus</li>
                  <li>⭐ 4.7 | Rum Aged Lab 2026</li>
                </ul>
              </section>

              <section className="dw-panel">
                <h3>I possibili search</h3>
                <ul className="dw-side-list">
                  {keywords.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </section>

              <section className="dw-panel">
                <h3>top survivor</h3>
                <ul className="dw-side-list dw-ranking">
                  {ranking.map((row) => (
                    <li key={row.name}>
                      <strong>{row.name}</strong>
                      <span>{row.score}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>

        <nav className="dw-bottom-nav" aria-label="Community navigation rapida">
          <button onClick={() => navigate("/home")}>Home</button>
          <button onClick={() => navigate("/mappa")}>Mappa</button>
          <button onClick={() => navigate("/drink")}>Drink</button>
          <button className="active" onClick={() => navigate("/community")}>Community</button>
          <button onClick={() => navigate("/dashboard")}>Panel</button>
        </nav>
      </div>
    </>
  );
}