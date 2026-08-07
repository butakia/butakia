"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/actions";

export default function FavoriteButton({
  titleId,
  initialFavorited,
  variant = "full",
}: {
  titleId: string;
  initialFavorited: boolean;
  variant?: "full" | "icon";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(titleId);
        setFavorited(result.favorited);
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        disabled={isPending}
        aria-label={favorited ? "Quitar de Mi Lista" : "Agregar a Mi Lista"}
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-110 active:scale-90 disabled:opacity-50 ${
          favorited
            ? "border-accent bg-accent text-white"
            : "border-white/40 text-white hover:border-white"
        }`}
      >
        {favorited ? <Check size={14} /> : <Plus size={14} />}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
        favorited
          ? "border-accent bg-accent/15 text-accent"
          : "border-white/15 text-white/70 hover:bg-white/10"
      }`}
    >
      {favorited ? <Check size={16} /> : <Plus size={16} />}
      {favorited ? "En mi lista" : "Agregar a Mi Lista"}
    </motion.button>
  );
}
