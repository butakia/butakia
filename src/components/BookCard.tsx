"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Star } from "lucide-react";
import { Book } from "@/lib/types";
import PosterPlaceholder from "./PosterPlaceholder";

export default function BookCard({ item }: { item: Book }) {
  return (
    <Link href={`/${item.slug}`} className="flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.06, zIndex: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group relative aspect-[2/3] w-[160px] cursor-pointer overflow-hidden rounded-lg bg-surface shadow-lg sm:w-[180px]"
      >
        <PosterPlaceholder seed={item.cover || item.slug} title={item.title} className="rounded-lg" />

        {item.isFree && (
          <div className="absolute left-2 top-2">
            <span className="rounded bg-accent/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Gratis
            </span>
          </div>
        )}

        {item.progressPercent !== undefined && item.progressPercent > 0 && (
          <>
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {Math.round(Math.min(100, item.progressPercent))}%
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, item.progressPercent)}%` }} />
            </div>
          </>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-black/50 p-3 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          <p className="mb-1 line-clamp-1 text-sm font-bold text-white">{item.title}</p>
          <p className="mb-1.5 line-clamp-1 text-[11px] text-white/70">{item.authorName}</p>
          <div className="mb-1.5 flex items-center gap-2 text-[11px] text-white/70">
            {item.rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star size={11} className="fill-accent text-accent" />
                {item.rating.toFixed(1)}
              </span>
            )}
            {item.year && <span>{item.year}</span>}
          </div>
          <button
            aria-label="Leer"
            onClick={(e) => e.preventDefault()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-95"
          >
            <BookOpen size={14} />
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
