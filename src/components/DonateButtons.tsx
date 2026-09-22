"use client";

import { useState } from "react";
import { Heart, DollarSign, X } from "lucide-react";
import { SiteSettings } from "@/lib/types";

export default function DonateButtons({ settings }: { settings: SiteSettings }) {
  const [showYape, setShowYape] = useState(false);
  const hasPaypal = Boolean(settings.paypalLink);
  const hasYape = Boolean(settings.yapeNumber || settings.yapeQrUrl);

  if (!settings.donationsEnabled || (!hasPaypal && !hasYape)) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900 to-black p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-start gap-2 text-sm text-white/70">
          <Heart size={16} className="mt-0.5 shrink-0 text-accent" />
          <span>
            ¿Te gustó? Apoya con una donación.
            <span className="block text-xs text-white/40">
              Nos ayuda a recompensar a los colaboradores que suben libros y actualizan los
              enlaces caídos.
            </span>
          </span>
        </p>
        <div className="flex items-center gap-2">
          {hasPaypal && (
            <a
              href={settings.paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-[#0070ba] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            >
              <DollarSign size={14} />
              PayPal
            </a>
          )}
          {hasYape && (
            <button
              onClick={() => setShowYape(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#8e2de2] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            >
              <Heart size={14} />
              Yape
            </button>
          )}
        </div>
      </div>

      {showYape && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowYape(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs rounded-2xl border border-white/10 bg-zinc-950 p-6 text-center"
          >
            <button
              aria-label="Cerrar"
              onClick={() => setShowYape(false)}
              className="absolute right-3 top-3 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="mb-3 font-bold text-white">Donar con Yape</h3>
            {settings.yapeQrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.yapeQrUrl}
                alt="Código QR de Yape"
                className="mx-auto mb-3 h-48 w-48 rounded-lg object-cover"
              />
            ) : null}
            {settings.yapeNumber && (
              <p className="text-lg font-black text-white">{settings.yapeNumber}</p>
            )}
            <p className="mt-1 text-xs text-white/50">Gracias por apoyar a Butakia 💜</p>
          </div>
        </div>
      )}
    </div>
  );
}
