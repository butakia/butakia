import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AdBanner() {
  return (
    <div className="mx-auto my-2 max-w-6xl px-6 md:px-10">
      <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black p-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/15 text-yellow-400">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Espacio publicitario</p>
            <p className="text-xs text-white/50">
              Con Butakia Premium no vuelves a ver este espacio, y navegas sin interrupciones.
            </p>
          </div>
        </div>
        <Link
          href="/premium"
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
        >
          Quitar anuncios
        </Link>
      </div>
    </div>
  );
}
