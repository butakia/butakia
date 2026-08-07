"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { voteAction } from "@/lib/actions";
import { VoteCounts } from "@/lib/types";

export default function LikeDislike({
  titleId,
  initialVote,
  initialCounts,
}: {
  titleId: string;
  initialVote: "like" | "dislike" | null;
  initialCounts: VoteCounts;
}) {
  const router = useRouter();
  const [vote, setVote] = useState<"like" | "dislike" | null>(initialVote);
  const [counts, setCounts] = useState(initialCounts);
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: "like" | "dislike") => {
    startTransition(async () => {
      try {
        const prevVote = vote;
        const result = await voteAction(titleId, value);
        setVote(result.vote);
        setCounts((c) => {
          const next = { ...c };
          if (prevVote === "like") next.likes = Math.max(0, next.likes - 1);
          if (prevVote === "dislike") next.dislikes = Math.max(0, next.dislikes - 1);
          if (result.vote === "like") next.likes += 1;
          if (result.vote === "dislike") next.dislikes += 1;
          return next;
        });
        router.refresh();
      } catch {
        router.push("/login");
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote("like")}
        disabled={isPending}
        aria-label="Me gusta"
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
          vote === "like"
            ? "border-accent bg-accent/15 text-accent"
            : "border-white/15 text-white/70 hover:bg-white/10"
        }`}
      >
        <ThumbsUp size={16} className={vote === "like" ? "fill-accent" : ""} />
        Me gusta
        {counts.likes > 0 && <span className="text-xs opacity-70">{counts.likes}</span>}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote("dislike")}
        disabled={isPending}
        aria-label="No me gusta"
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
          vote === "dislike"
            ? "border-white/40 bg-white/15 text-white"
            : "border-white/15 text-white/70 hover:bg-white/10"
        }`}
      >
        <ThumbsDown size={16} className={vote === "dislike" ? "fill-white" : ""} />
        No me gusta
        {counts.dislikes > 0 && <span className="text-xs opacity-70">{counts.dislikes}</span>}
      </motion.button>
    </div>
  );
}
