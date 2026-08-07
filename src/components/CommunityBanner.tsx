"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Upload, X } from "lucide-react";

export default function CommunityBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
      <div className="mx-6 mt-6 flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900 to-black p-4 sm:flex-row sm:items-center sm:justify-between md:mx-10">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Users size={18} />
          </span>
          <p className="text-sm text-white/70">
            <span className="font-semibold text-white">Butakia es una comunidad.</span> El
            catálogo crece gracias a los usuarios que suben películas y series.{" "}
            <Link href="/colaboradores" className="text-accent hover:underline">
              Ver top de colaboradores
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/subir"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Upload size={14} />
            Subir contenido
          </Link>
          <button
            aria-label="Cerrar aviso"
            onClick={() => setDismissed(true)}
            className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
  );
}
