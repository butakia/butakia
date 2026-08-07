"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Share2, Film, Star, Eye, Calendar, Check } from "lucide-react";
import { Title } from "@/lib/types";
import BackdropPlaceholder from "./BackdropPlaceholder";
import PosterPlaceholder from "./PosterPlaceholder";
import FavoriteButton from "./FavoriteButton";
import { SITE_URL } from "@/lib/constants";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-foreground/90">
      {children}
    </span>
  );
}

export default function DetailHero({
  item,
  initialFavorited = false,
}: {
  item: Title;
  initialFavorited?: boolean;
}) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = `${SITE_URL}/titulo/${item.slug}`;
    const shareData = { title: `Ver ${item.title} gratis en Butakia`, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // el usuario canceló o no se pudo compartir; probamos copiar el enlace
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // clipboard no disponible, no hacemos nada más
    }
  };

  const metaChips = [
    item.year && String(item.year),
    item.duration,
    item.ageRating,
    item.country,
    item.language,
  ].filter(Boolean) as string[];

  return (
    <section className="relative">
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden md:h-[60vh]">
        <BackdropPlaceholder seed={item.backdrop} eager />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6 md:-mt-32 md:flex-row md:px-10">
        <div className="mx-auto aspect-[2/3] w-40 flex-shrink-0 overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10 md:mx-0 md:w-56">
          <PosterPlaceholder seed={item.poster} title={item.title} iconSize={40} />
        </div>

        <div className="flex-1 pb-4">
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">{item.title}</h1>
          {item.originalTitle && item.originalTitle !== item.title && (
            <p className="mt-1 text-sm text-muted">Título original: {item.originalTitle}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-accent/90 px-2.5 py-1 text-xs font-bold text-white">
              <Star size={12} className="fill-white" />
              {item.rating.toFixed(1)}
            </span>
            {metaChips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>

          {item.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.genres.map((g) => (
                <span key={g} className="text-xs text-accent">
                  #{g}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
            {item.synopsis}
          </p>

          {item.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {(item.views !== undefined || item.addedAt) && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              {item.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {item.views.toLocaleString("es-ES")} vistas
                </span>
              )}
              {item.addedAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Agregado el {item.addedAt}
                </span>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/ver/${item.slug}`}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-accent-hover active:scale-95"
            >
              <Play size={20} className="fill-white" />
              Reproducir
            </Link>

            {item.trailerUrl && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 font-medium backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/20 active:scale-95"
              >
                <Film size={18} />
                Trailer
              </a>
            )}

            <FavoriteButton titleId={item.id} initialFavorited={initialFavorited} variant="icon" />

            <button
              onClick={handleShare}
              aria-label="Compartir"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-foreground/80 transition-all duration-200 hover:scale-110 hover:bg-white/10 active:scale-90"
            >
              {shared ? <Check size={18} className="text-accent" /> : <Share2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
