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
    <section className="px-4 pt-2 pb-4">
      <h3 className="text-white font-bold text-lg mb-2">Ultimi articoli</h3>
      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <a href={a.link} key={a.id} className="flex gap-3 bg-stone-900 rounded-xl p-2 items-center">
            <img src={a.image} alt={a.title} className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-amber-400 text-xs font-bold mb-0.5">{a.category}</div>
              <div className="text-white font-semibold text-sm leading-tight truncate mb-1">{a.title}</div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>{a.time} min lettura</span>
                <span>Approfondisci</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
