"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Info, Star } from "lucide-react";
import { Title } from "@/lib/types";
import PosterPlaceholder from "./PosterPlaceholder";
import FavoriteButton from "./FavoriteButton";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

const BADGE_LABEL: Record<string, string> = {
  new: "Nuevo",
  trending: "Trending",
  top10: "Top 10",
  "4k": "4K",
  hd: "HD",
};

export default function TitleCard({ item }: { item: Title }) {
  const embedUrl = item.trailerUrl ? getYouTubeEmbedUrl(item.trailerUrl) : null;
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (!embedUrl) return;
    timeoutRef.current = setTimeout(() => setShowPreview(true), 700);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPreview(false);
  };

  return (
    <Link href={`/titulo/${item.slug}`} className="flex-shrink-0">
    <motion.div
      whileHover={{ scale: 1.06, zIndex: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[2/3] w-[160px] cursor-pointer overflow-hidden rounded-lg bg-surface shadow-lg sm:w-[180px]"
    >
      <PosterPlaceholder seed={item.poster || item.slug} title={item.title} className="rounded-lg" />

      {showPreview && embedUrl && (
        <iframe
          src={embedUrl}
          title={`Tráiler de ${item.title}`}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 h-full w-full rounded-lg"
          style={{ border: 0 }}
        />
      )}

      {item.progressPercent !== undefined && item.progressPercent > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.min(100, item.progressPercent)}%` }}
          />
        </div>
      )}

      {((item.badges && item.badges.length > 0) || (item.customTags && item.customTags.length > 0)) && (
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {item.badges?.map((b) => (
            <span
              key={b}
              className="rounded bg-accent/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
            >
              {BADGE_LABEL[b]}
            </span>
          ))}
          {item.customTags?.map((t) => (
            <span
              key={t}
              className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ring-1 ring-white/20"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-black/50 p-3 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <p className="mb-1 line-clamp-1 text-sm font-bold text-white">{item.title}</p>
        <div className="mb-1.5 flex items-center gap-2 text-[11px] text-white/70">
          <span className="flex items-center gap-0.5">
            <Star size={11} className="fill-accent text-accent" />
            {item.rating.toFixed(1)}
          </span>
          <span>{item.year}</span>
          {item.duration && <span>{item.duration}</span>}
        </div>
        {item.synopsis && (
          <p className="mb-2 line-clamp-3 text-[11px] leading-snug text-white/60">
            {item.synopsis}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            aria-label="Reproducir"
            onClick={(e) => e.preventDefault()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-95"
          >
            <Play size={14} className="fill-black" />
          </button>
          <FavoriteButton titleId={item.id} initialFavorited={false} variant="icon" />
          <button
            aria-label="Más información"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-white transition-transform hover:scale-110 hover:border-white active:scale-95"
          >
            <Info size={14} />
          </button>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}
