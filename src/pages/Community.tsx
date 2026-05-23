import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";

export default function Community() {
  const navigate = useNavigate();
  const { t } = useTranslation("community");

  const barettoMessages = [
    {
      user: t("chat.messages.0.user"),
      role: t("chat.messages.0.role"),
      text: t("chat.messages.0.text"),
      tone: "gold",
    },
    {
      user: t("chat.messages.1.user"),
      role: t("chat.messages.1.role"),
      text: t("chat.messages.1.text"),
      tone: "violet",
    },
    {
      user: t("chat.messages.2.user"),
      role: t("chat.messages.2.role"),
      text: t("chat.messages.2.text"),
      tone: "blue",
    },
    {
      user: t("chat.messages.3.user"),
      role: t("chat.messages.3.role"),
      text: t("chat.messages.3.text"),
      tone: "green",
    },
  ];

  const posts = [
    {
      id: "p1",
      user: t("feed.posts.0.user"),
      badge: t("feed.posts.0.badge"),
      title: t("feed.posts.0.title"),
      text: t("feed.posts.0.text"),
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
      likes: 128,
      comments: 14,
    },
    {
      id: "p2",
      user: t("feed.posts.1.user"),
      badge: t("feed.posts.1.badge"),
      title: t("feed.posts.1.title"),
      text: t("feed.posts.1.text"),
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      likes: 72,
      comments: 18,
    },
    {
      id: "p3",
      user: t("feed.posts.2.user"),
      badge: t("feed.posts.2.badge"),
      title: t("feed.posts.2.title"),
      text: t("feed.posts.2.text"),
      image:
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
      likes: 44,
      comments: 9,
    },
  ];

  const keywords = [
    t("sidebar.keywords.0"),
    t("sidebar.keywords.1"),
    t("sidebar.keywords.2"),
  ];

  const ranking = [
    { name: t("sidebar.ranking.0.name"), score: t("sidebar.ranking.0.score") },
    { name: t("sidebar.ranking.1.name"), score: t("sidebar.ranking.1.score") },
    { name: t("sidebar.ranking.2.name"), score: t("sidebar.ranking.2.score") },
    { name: t("sidebar.ranking.3.name"), score: t("sidebar.ranking.3.score") },
    { name: t("sidebar.ranking.4.name"), score: t("sidebar.ranking.4.score") },
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
            --shadow-soft: 0 10px 28px rgba(0, 0, 0, 0.28);
            background: radial-gradient(circle at 90% -20%, #2a1c09 0%, rgba(7, 10, 17, 0) 42%), var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 14px 14px 24px;
            overflow-x: hidden;
          }

          .dw-community-shell {
            max-width: 1160px;
            margin: 0 auto;
            display: grid;
            gap: 12px;
            width: 100%;
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
              linear-gradient(112deg, rgba(5, 8, 15, 0.7) 0%, rgba(6, 10, 18, 0.45) 44%, rgba(7, 10, 17, 0.14) 100%),
              url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1800&q=80") center 45% / cover no-repeat;
            box-shadow: var(--shadow-soft);
            isolation: isolate;
          }

          .dw-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.58));
            z-index: 0;
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
            font-size: clamp(28px, 4.4vw, 41px);
            line-height: 1.1;
            max-width: 520px;
            letter-spacing: 0.005em;
          }

          .dw-hero-highlight {
            display: inline-block;
            color: #ffd978;
            font-weight: 800;
            font-size: 1.08em;
            line-height: 1;
            letter-spacing: 0.004em;
            text-shadow: 0 4px 12px rgba(245, 166, 35, 0.26);
          }

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
            border-radius: 12px;
            padding: 10px 15px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
            min-height: 40px;
          }

          .dw-btn-gold {
            background: linear-gradient(180deg, #f8b847, #f5a623);
            color: #161207;
            box-shadow: 0 8px 22px rgba(245, 166, 35, 0.28);
          }
          .dw-btn-dark {
            background: rgba(8, 12, 22, 0.72);
            color: #d9e0ef;
            border: 1px solid #2a374f;
          }

          .dw-btn:hover,
          .dw-btn:active {
            transform: translateY(-1px);
            opacity: 0.96;
          }

          .dw-hero-stats {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            font-size: 11px;
            max-width: 540px;
          }

          .dw-hero-stats div {
            color: #c4d0e8;
            border: 1px solid rgba(188, 201, 231, 0.2);
            background: rgba(5, 9, 16, 0.42);
            border-radius: 10px;
            padding: 7px 8px;
            backdrop-filter: blur(2px);
          }

          .dw-hero-stats strong {
            color: #fff;
            margin-right: 4px;
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
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .dw-panel:hover {
            border-color: #2b3b57;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
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
            gap: 10px;
            max-height: 232px;
            overflow: auto;
            padding-right: 2px;
          }

          .dw-msg {
            background: rgba(17, 27, 44, 0.78);
            border: 1px solid rgba(47, 63, 93, 0.72);
            border-radius: 12px;
            padding: 10px;
            font-size: 12px;
            line-height: 1.4;
            display: grid;
            grid-template-columns: 28px minmax(0, 1fr);
            gap: 8px;
            backdrop-filter: blur(4px);
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
          }

          .dw-msg-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            background: linear-gradient(180deg, #f8c96f, #f5a623);
            flex-shrink: 0;
          }

          .dw-msg-body {
            min-width: 0;
          }

          .dw-msg-top {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 5px;
            color: #dbe5fb;
            font-size: 11px;
            font-weight: 700;
          }

          .tone-gold { color: #f9cf7a; }
          .tone-violet { color: #b7a6ff; }
          .tone-blue { color: #8bc4ff; }
          .tone-green { color: #89d39a; }

          .dw-chat-input {
            width: 100%;
            border-radius: 10px;
            border: 1px solid #2f4263;
            background: #0a1221;
            color: #9aa6c2;
            padding: 10px 12px;
            font-size: 12px;
            min-height: 40px;
          }

          .dw-chat-compose {
            margin-top: 12px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 42px;
            gap: 8px;
          }

          .dw-chat-send {
            border: 1px solid #35507a;
            border-radius: 10px;
            background: linear-gradient(180deg, #1a2840, #131f35);
            color: #dce7ff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;
            min-height: 40px;
          }

          .dw-chat-send:hover,
          .dw-chat-send:active {
            transform: translateY(-1px);
            opacity: 0.94;
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
            background: linear-gradient(180deg, #101827, #0e1627);
            border: 1px solid #23314a;
            border-radius: 12px;
            overflow: hidden;
            transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2);
          }

          .dw-post:hover {
            border-color: #2f4367;
            transform: translateY(-1px);
            box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
          }

          .dw-post img {
            display: block;
            width: 100%;
            height: 126px;
            object-fit: cover;
          }

          .dw-post-content { padding: 10px 11px 11px; }

          .dw-post-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;
          }

          .dw-post-user {
            font-size: 11px;
            color: #a8b7d6;
            font-weight: 600;
          }
          .dw-post-title {
            margin: 0 0 5px;
            font-size: 16px;
            line-height: 1.2;
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
            gap: 8px;
            color: #9caed1;
            font-size: 11px;
            flex-wrap: wrap;
          }

          .dw-post-actions span {
            border: 1px solid #2a3b58;
            border-radius: 999px;
            padding: 5px 8px;
            background: rgba(11, 18, 30, 0.58);
            transition: background-color 0.2s ease, border-color 0.2s ease;
          }

          .dw-post-actions span:hover,
          .dw-post-actions span:active {
            background: rgba(245, 166, 35, 0.12);
            border-color: rgba(245, 166, 35, 0.32);
          }

          .dw-side {
            display: grid;
            gap: 12px;
            position: sticky;
            top: 76px;
          }

          .dw-side h3 {
            margin: 0 0 8px;
            font-size: 12px;
            color: #f6f8fc;
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }

          .dw-side-list {
            margin: 0;
            padding: 0;
            list-style: none;
            display: grid;
            gap: 8px;
          }

          .dw-side-list li {
            font-size: 11px;
            color: #a8b6ce;
            border-radius: 9px;
            padding: 7px 8px;
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
              padding: 8px 6px 78px;
            }

            .dw-hero {
              min-height: 188px;
              border-radius: 12px;
              padding: 11px;
              background-position: center 30%;
            }

            .dw-hero h1 {
              max-width: 270px;
              font-size: clamp(20px, 6.3vw, 27px);
              line-height: 1.14;
            }

            .dw-hero-highlight {
              font-size: 1.1em;
              line-height: 1;
              text-shadow: 0 3px 10px rgba(245, 166, 35, 0.3);
            }

            .dw-badge {
              font-size: 10px;
              padding: 5px 9px;
            }

            .dw-hero p {
              font-size: 12px;
              max-width: 320px;
              color: #d8e0f3;
            }

            .dw-hero-actions {
              gap: 8px;
              margin-top: 10px;
            }

            .dw-btn {
              min-height: 42px;
              padding: 10px 14px;
              font-size: 12px;
              border-radius: 11px;
            }

            .dw-hero-stats {
              grid-template-columns: 1fr;
              gap: 6px;
              margin-top: 10px;
              max-width: none;
            }

            .dw-hero-stats div {
              padding: 7px 9px;
            }

            .dw-main-grid {
              grid-template-columns: 1fr;
              gap: 8px;
            }

            .dw-side {
              position: static;
              top: auto;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
            }

            .dw-side .dw-panel:first-child {
              grid-column: 1 / -1;
            }

            .dw-panel {
              padding: 10px;
              border-radius: 11px;
            }

            .dw-chat {
              max-height: 240px;
              gap: 8px;
            }

            .dw-msg {
              grid-template-columns: 26px minmax(0, 1fr);
              padding: 9px;
            }

            .dw-msg-avatar {
              width: 26px;
              height: 26px;
              font-size: 10px;
            }

            .dw-chat-compose {
              grid-template-columns: minmax(0, 1fr) 40px;
              gap: 7px;
            }

            .dw-post {
              border-radius: 11px;
            }

            .dw-post img { height: 112px; }

            .dw-post-title {
              font-size: 15px;
            }

            .dw-post-text {
              font-size: 11px;
              line-height: 1.4;
            }

            .dw-post-actions {
              gap: 6px;
            }

            .dw-side h3 {
              font-size: 11px;
            }

            .dw-bottom-nav {
              display: none;
              position: fixed;
              left: 50%;
              transform: translateX(-50%);
              bottom: 6px;
              z-index: 50;
              width: min(100% - 10px, 370px);
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
              padding: 7px 7px;
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
              <span className="dw-badge">{t("hero.badge")}</span>
              <h1>
                {t("hero.titlePrefix")} <span className="dw-hero-highlight">{t("hero.titleHighlight")}</span> {t("hero.titleSuffix")}
              </h1>
              <p>
                {t("hero.subtitle")}
              </p>
              <div className="dw-hero-actions">
                <button className="dw-btn dw-btn-gold" onClick={() => navigate("/baretto")}>{t("hero.ctaPrimary")}</button>
                <button className="dw-btn dw-btn-dark" onClick={() => navigate("/crea")}>{t("hero.ctaSecondary")}</button>
              </div>
              <div className="dw-hero-stats">
                <div><strong>{t("hero.stats.members.value")}</strong> {t("hero.stats.members.label")}</div>
                <div><strong>{t("hero.stats.posts.value")}</strong> {t("hero.stats.posts.label")}</div>
              </div>
            </div>
          </section>

          <div className="dw-main-grid">
            <div>
              <section className="dw-panel">
                <div className="dw-baretto-title">
                  <h3 style={{ margin: 0 }}>{t("chat.title")}</h3>
                  <span className="dw-pill">{t("chat.liveBadge")}</span>
                </div>

                <div className="dw-chat">
                  {barettoMessages.map((item, idx) => (
                    <div className="dw-msg" key={`${item.user}-${idx}`}>
                      <span className="dw-msg-avatar" aria-hidden="true">
                        {item.user.slice(0, 1)}
                      </span>
                      <div className="dw-msg-body">
                        <div className="dw-msg-top">
                          <span className={`tone-${item.tone}`}>{item.user}</span>
                          <span>{item.role}</span>
                        </div>
                        <div>{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dw-chat-compose">
                  <input className="dw-chat-input" readOnly value={t("chat.placeholder")} />
                  <button className="dw-chat-send" type="button" aria-label={t("chat.sendAriaLabel")}>
                    ↗
                  </button>
                </div>
              </section>

              <div className="dw-feed-head">
                <h2 style={{ margin: 0, fontSize: 19 }}>{t("feed.title")}</h2>
                <span className="dw-pill">{t("feed.relevanceBadge")}</span>
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
                        <span>{t("feed.actions.likes", { count: post.likes })}</span>
                        <span>{t("feed.actions.comments", { count: post.comments })}</span>
                        <span>{t("feed.actions.share")}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </div>

            <aside className="dw-side">
              <section className="dw-panel">
                <button className="dw-btn dw-btn-gold" style={{ width: "100%" }} onClick={() => navigate("/crea")}>{t("sidebar.createArticleCta")}</button>
              </section>

              <section className="dw-panel">
                <h3>{t("sidebar.dailyArticleTitle")}</h3>
                <ul className="dw-side-list">
                  <li>{t("sidebar.dailyItems.0")}</li>
                  <li>{t("sidebar.dailyItems.1")}</li>
                  <li>{t("sidebar.dailyItems.2")}</li>
                </ul>
              </section>

              <section className="dw-panel">
                <h3>{t("sidebar.searchesTitle")}</h3>
                <ul className="dw-side-list">
                  {keywords.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </section>

              <section className="dw-panel">
                <h3>{t("sidebar.topSurvivorTitle")}</h3>
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

        <nav className="dw-bottom-nav" aria-label={t("bottomNav.ariaLabel")}>
          <button onClick={() => navigate("/home")}>{t("bottomNav.home")}</button>
          <button onClick={() => navigate("/mappa")}>{t("bottomNav.map")}</button>
          <button onClick={() => navigate("/drink")}>{t("bottomNav.drink")}</button>
          <button className="active" onClick={() => navigate("/community")}>{t("bottomNav.community")}</button>
          <button onClick={() => navigate("/dashboard")}>{t("bottomNav.panel")}</button>
        </nav>
      </div>
    </>
  );
}