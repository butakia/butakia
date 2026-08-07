"use client";

import { CheckCircle2, RotateCcw, Tv2 } from "lucide-react";

export default function LinkPreviewStep({
  playerLink,
  confirmed,
  onConfirm,
  onReject,
}: {
  playerLink: string;
  confirmed: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  if (!playerLink.trim()) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
        <Tv2 size={15} />
        Vista previa del enlace
      </p>
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
        <iframe
          src={playerLink}
          className="h-full w-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>

      {confirmed ? (
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent">
          <CheckCircle2 size={16} />
          Confirmaste que el enlace se visualiza correctamente.
          <button
            type="button"
            onClick={onReject}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white"
          >
            <RotateCcw size={12} />
            Volver a revisar
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-xs text-white/50">¿Se visualiza correctamente?</p>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Sí, se ve bien
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-lg border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10"
          >
            No, quiero editarlo
          </button>
        </div>
      )}
    </div>
  );
}
