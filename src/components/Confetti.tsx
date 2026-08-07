"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#e50914", "#ffd60a", "#22c55e", "#3b82f6", "#a855f7", "#ffffff"];

export default function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.4,
        duration: 2.2 + Math.random() * 1.4,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
        round: Math.random() > 0.5,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", x: p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.6),
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
