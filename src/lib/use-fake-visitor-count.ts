"use client";

import { useEffect, useState } from "react";

// Wanders the displayed count around the midpoint of [min, max] instead of picking a
// fresh uniform-random number every tick — real concurrent-viewer counts drift
// gradually, they don't jump from one extreme to the other every few seconds, so a
// small random walk reads as far more believable than pure noise.
function nextValue(current: number, min: number, max: number): number {
  const mid = (min + max) / 2;
  const pullToMid = (mid - current) * 0.15;
  const noise = (Math.random() - 0.5) * (max - min) * 0.25;
  const next = Math.round(current + pullToMid + noise);
  return Math.min(max, Math.max(min, next));
}

export function useFakeVisitorCount(min: number, max: number): number {
  const [count, setCount] = useState(() => Math.round((min + max) / 2));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setCount((c) => nextValue(c, min, max));
      timer = setTimeout(tick, 4000 + Math.random() * 6000);
    };
    timer = setTimeout(tick, 4000 + Math.random() * 6000);
    return () => clearTimeout(timer);
  }, [min, max]);

  return count;
}
