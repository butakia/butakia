"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { PartyPopper, Check, Plus, RotateCcw, Highlighter, X } from "lucide-react";
import { Book } from "@/lib/types";
import { toggleBookFavoriteAction } from "@/lib/books-actions";
import ShareRow from "./ShareRow";

interface HighlightItem {
  id: string;
  text: string;
}

export default function BookFinishedScreen({
  book,
  theme,
  initialFavorited,
  highlights,
  onRestart,
}: {
  book: Book;
  theme: { bg: string; text: string };
  initialFavorited: boolean;
  highlights: HighlightItem[];
  onRestart: () => void;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const [showHighlights, setShowHighlights] = useState(false);

  const toggleFavorite = () => {
    startTransition(async () => {
      try {
        const result = await toggleBookFavoriteAction(book.id);
        setFavorited(result.favorited);
      } catch {
        // Not logged in — silently ignore, the button just won't persist.
      }
    });
  };

  return (
    <motion.div
      // Reads as the book settling shut on the final page — a quick scale/tilt
      // from a thin closed sliver into the full finished screen.
      initial={{ scaleX: 0.05, rotateY: -35, opacity: 0.4 }}
      animate={{ scaleX: 1, rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{ background: theme.bg, color: theme.text, transformOrigin: "left center" }}
      className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center"
    >
      <PartyPopper size={40} className="text-accent" />
      <div>
        <h2 className="text-xl font-black">¡Felicidades!</h2>
        <p className="mt-1 text-sm opacity-80">Terminaste de leer &quot;{book.title}&quot;</p>
      </div>

      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isPending}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          favorited ? "border-accent bg-accent/15 text-accent" : "border-current/20 hover:bg-current/5"
        }`}
      >
        {favorited ? <Check size={16} /> : <Plus size={16} />}
        {favorited ? "En tus favoritos" : "¿Agregar a favoritos?"}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-1.5 rounded-full border border-current/20 px-3.5 py-2 text-xs font-semibold hover:bg-current/5"
        >
          <RotateCcw size={14} />
          Volver a leer
        </button>
        <button
          type="button"
          onClick={() => setShowHighlights(true)}
          className="flex items-center gap-1.5 rounded-full border border-current/20 px-3.5 py-2 text-xs font-semibold hover:bg-current/5"
        >
          <Highlighter size={14} />
          Mis frases subrayadas ({highlights.length})
        </button>
      </div>

      <div className="mt-2">
        <ShareRow slug={book.slug} title={book.title} />
      </div>

      {showHighlights && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowHighlights(false)}
        >
          <div
            className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-xl bg-zinc-950 p-5 text-left text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Tus frases subrayadas</h3>
              <button onClick={() => setShowHighlights(false)} aria-label="Cerrar" className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>
            {highlights.length === 0 ? (
              <p className="text-sm text-white/50">Todavía no subrayaste ninguna frase en este libro.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {highlights.map((h) => (
                  <li key={h.id} className="rounded-lg bg-white/5 p-3 text-sm text-white/80">
                    &ldquo;{h.text}&rdquo;
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
