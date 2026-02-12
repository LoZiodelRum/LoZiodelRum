import { useState } from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const COMMUNITY_FALLBACKS = [
  "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600",
  "https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=600",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600",
  "https://images.unsplash.com/photo-1536935338788-846a998298fe?w=600",
];

export default function CommunityPostCard({ post, type = "owner", index = 0 }) {
  const fallback = type === "user" ? COMMUNITY_FALLBACKS[index % 4] : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400";
  const [imgSrc, setImgSrc] = useState(post.image || fallback);
  const title = post.title || (post.content?.slice(0, 50) + (post.content?.length > 50 ? "…" : "")) || "Post";
  const location = post.venue_name || post.location || post.author_name || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group relative h-40 rounded-2xl overflow-hidden block bg-stone-900/50 border border-stone-800/50 hover:border-amber-500/30 transition-all duration-300"
    >
      <div className="absolute inset-0">
        <img
          src={imgSrc}
          alt=""
          onError={() => setImgSrc(fallback)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">{title}</h3>
        <p className="text-stone-400 text-xs mt-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{location}</span>
        </p>
      </div>
    </motion.div>
  );
}
