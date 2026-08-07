"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { toggleBookFavoriteAction } from "@/lib/books-actions";

export default function BookFavoriteButton({
  bookId,
  initialFavorited,
}: {
  bookId: string;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleBookFavoriteAction(bookId);
        setFavorited(result.favorited);
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  };

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
