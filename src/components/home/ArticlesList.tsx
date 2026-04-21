
import React from "react";

interface Article {
  id: string;
  image: string;
  category: string;
  title: string;
  time: string;
  link: string;
}

interface Props {
  articles: Article[];
}

export default function ArticlesList({ articles }: Props) {
  return (
    <section className="px-0 pt-2 pb-6">
      <h3 className="text-white font-bold text-2xl mb-4 px-5">Ultimi articoli</h3>
      <div className="flex flex-col gap-4 px-4">
        {articles.map((a) => (
          <a
            href={a.link}
            key={a.id}
            className="flex gap-4 bg-[#18120b] rounded-2xl p-4 items-center shadow-lg min-h-[110px] max-w-full"
            style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
          >
            <img
              src={a.image}
              alt={a.title}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-yellow-900/80 text-yellow-400 text-sm font-bold rounded-lg px-3 py-1 mb-2">
                {a.category}
              </div>
              <div className="text-white font-extrabold text-lg leading-tight truncate mb-2">
                {a.title}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1"/></svg>
                  {a.time} min lettura
                </span>
                <span className="flex items-center gap-1">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h8M8 8h8"/></svg>
                  Approfondisci
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
