"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { Title } from "@/lib/types";
import { paletteFor } from "./PosterPlaceholder";
import BackdropPlaceholder from "./BackdropPlaceholder";

const ROTATE_MS = 7000;
const SWIPE_THRESHOLD = 40;

export default function Hero({ titles }: { titles: Title[] }) {
  const [index, setIndex] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const title = titles[index] ?? titles[0];

  const [displayed, setDisplayed] = useState(title);
  const [incoming, setIncoming] = useState<Title | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    if (!title || title.id === displayed.id) return;
    setIncoming(title);
    setSliding(false);
    const raf = requestAnimationFrame(() => setSliding(true));
    const timer = setTimeout(() => {
      setDisplayed(title);
      setIncoming(null);
      setSliding(false);
    }, 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title?.id]);

  useEffect(() => {
    if (titles.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % titles.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [titles.length, restartKey]);

  const goTo = (i: number, dir?: 1 | -1) => {
    const next = (i % titles.length + titles.length) % titles.length;
    setDirection(dir ?? (next > index || (index === titles.length - 1 && next === 0) ? 1 : -1));
    setIndex(next);
    setRestartKey((k) => k + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (titles.length <= 1) return;
    goTo(dx < 0 ? index + 1 : index - 1, dx < 0 ? 1 : -1);
  };

  if (!title) return null;

  const [from] = paletteFor(title.slug);

  return (
    <section
      className="relative flex h-[85vh] min-h-[560px] w-full items-end overflow-hidden touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{ transform: incoming ? `translateX(${sliding ? direction * -100 : 0}%)` : "translateX(0%)" }}
      >
        <BackdropPlaceholder seed={displayed.backdrop} eager />
      </div>
      {incoming && (
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ transform: `translateX(${sliding ? 0 : direction * 100}%)` }}
        >
          <BackdropPlaceholder seed={incoming.backdrop} eager />
        </div>
      )}
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${from}55, transparent 60%), linear-gradient(180deg, #0b0b0b 0%, transparent 30%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/10 to-transparent" />

      <div key={title.id} className="relative z-10 min-w-0 max-w-2xl px-6 pb-16 md:px-10">
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight text-foreground/90 md:text-7xl">
          {title.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Star size={16} className="fill-accent text-accent" />
            {title.rating.toFixed(1)}
          </span>
          <span>{title.year}</span>
          {title.duration && <span>{title.duration}</span>}
          {title.genres.slice(0, 1).map((g) => (
            <span key={g} className="rounded-md bg-white/10 px-2 py-0.5 text-xs">
              {g}
            </span>
          ))}
        </div>

        <p className="mt-4 line-clamp-3 max-w-xl text-base text-foreground/80 md:text-lg">
          {title.synopsis}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/ver/${title.slug}`}
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-accent-hover active:scale-95"
          >
            <Play size={20} className="fill-white" />
            Reproducir
          </Link>
          <Link
            href={`/titulo/${title.slug}`}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-white/20 active:scale-95"
          >
            <Info size={20} />
            Más información
          </Link>
        </div>

        {titles.length > 1 && (
          <div className="mt-8 flex items-center gap-2">
            {titles.map((t, i) => (
              <button
                key={t.id}
                aria-label={`Ver ${t.title}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-accent" : "w-4 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
