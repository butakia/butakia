"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { reactionAction } from "@/lib/actions";
import { ReactionCounts, ReactionEmoji } from "@/lib/types";

const REACTIONS: { key: ReactionEmoji; emoji: string; label: string }[] = [
  { key: "like", emoji: "👍", label: "Me gusta" },
  { key: "heart", emoji: "❤️", label: "Me encanta" },
  { key: "cry", emoji: "😢", label: "Me hizo llorar" },
  { key: "poop", emoji: "💩", label: "Es una porquería" },
];

export default function ReactionBar({
  titleId,
  initialReaction,
  initialCounts,
}: {
  titleId: string;
  initialReaction: ReactionEmoji | null;
  initialCounts: ReactionCounts;
}) {
  const router = useRouter();
  const [reaction, setReaction] = useState<ReactionEmoji | null>(initialReaction);
  const [counts, setCounts] = useState(initialCounts);
  const [isPending, startTransition] = useTransition();

  const handleReact = (emoji: ReactionEmoji) => {
    startTransition(async () => {
      try {
        const prev = reaction;
        const result = await reactionAction(titleId, emoji);
        setReaction(result.reaction);
        setCounts((c) => {
          const next = { ...c };
          if (prev) next[prev] = Math.max(0, next[prev] - 1);
          if (result.reaction) next[result.reaction] += 1;
          return next;
        });
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTIONS.map((r) => (
        <motion.button
          key={r.key}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleReact(r.key)}
          disabled={isPending}
          aria-label={r.label}
          title={r.label}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
            reaction === r.key
              ? "border-accent bg-accent/15 text-accent"
              : "border-white/15 text-white/70 hover:bg-white/10"
          }`}
        >
          <span className="text-base leading-none">{r.emoji}</span>
          {counts[r.key] > 0 && <span className="text-xs opacity-70">{counts[r.key]}</span>}
        </motion.button>
      ))}
    </div>
  );
}
