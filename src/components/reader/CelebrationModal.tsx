"use client";

import { X } from "lucide-react";
import Confetti from "../Confetti";

export default function CelebrationModal({
  title,
  message,
  onClose,
  children,
}: {
  title: string;
  message: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <Confetti />
      <div
        className="relative flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 text-white/40 hover:text-white"
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-black text-white">{title}</h3>
        <p className="text-sm text-white/70">{message}</p>
        {children}
      </div>
    </div>
  );
}
