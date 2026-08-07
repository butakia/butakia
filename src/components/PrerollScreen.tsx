"use client";

import { useEffect, useState } from "react";
import { Sparkles, HeartHandshake, Lightbulb } from "lucide-react";

const COUNTDOWN_SECONDS = 10;
const TRIVIA_INTERVAL_MS = 4000;

export default function PrerollScreen({
  trivia,
  onFinish,
}: {
  trivia: string[];
  onFinish: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [triviaIndex, setTriviaIndex] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onFinish();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onFinish]);

  useEffect(() => {
    if (trivia.length < 2) return;
    const interval = setInterval(() => {
      setTriviaIndex((i) => (i + 1) % trivia.length);
    }, TRIVIA_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [trivia.length]);

  const progress = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto bg-gradient-to-b from-zinc-900 via-black to-black px-6 py-6 text-center sm:gap-8 sm:py-10">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/60">
        <Sparkles size={13} className="text-accent" />
        Reproducción gratuita
      </div>

      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--accent, #e50914)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="text-3xl font-black text-white">{secondsLeft}</span>
      </div>

      <div className="max-w-md">
        <p className="text-base font-bold text-white">Tu video comienza en breve</p>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-white/60">
          <HeartHandshake size={14} className="shrink-0 text-accent" />
          Si ves anuncios, es gracias a ellos que podemos mantener este sitio gratis para todos.
        </p>
        <p className="mt-2 text-xs text-white/40">
          Haz clic en reproducir dentro del reproductor para comenzar.
        </p>
      </div>

      {trivia.length > 0 && (
        <div className="min-h-[64px] w-full max-w-lg rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <p className="mb-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
            <Lightbulb size={12} />
            Dato curioso
          </p>
          <p key={triviaIndex} className="text-sm leading-snug text-white/70">
            {trivia[triviaIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
