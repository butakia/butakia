"use client";

import { useState } from "react";
import { Gift, Copy, Check, Crown } from "lucide-react";

export default function ReferralCard({ referralLink }: { referralLink: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-5">
      <div className="mb-2 flex items-center gap-2">
        <Gift size={18} className="text-accent" />
        <h3 className="font-bold text-white">Invita y gana Premium</h3>
      </div>
      <p className="mb-4 text-sm text-white/60">
        Comparte tu enlace. Cuando la persona que invitas suba y apruebe su primer contenido, ganas{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
          <Crown size={13} />
          Butakia Premium
        </span>{" "}
        gratis.
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate text-sm text-white/80">{referralLink}</span>
        <button
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
