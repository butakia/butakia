"use client";

import { AnimatePresence, motion } from "framer-motion";

// A small red ribbon that drops from the top-right corner of the page and
// retracts a moment later — the "listón" cue for "your progress was saved",
// lighter-weight than a full celebration modal so it doesn't interrupt reading.
export default function BookmarkRibbon({ show }: { show: boolean }) {
  return (
    <div className="pointer-events-none absolute right-6 top-0 z-20 overflow-hidden">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: -56 }}
            animate={{ y: 0 }}
            exit={{ y: -56 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="relative flex h-14 w-8 items-start justify-center rounded-b-sm bg-accent shadow-lg"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
