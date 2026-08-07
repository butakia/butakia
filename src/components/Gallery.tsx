"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import BackdropPlaceholder from "./BackdropPlaceholder";

export default function Gallery({ seed, count }: { seed: string; count: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const images = Array.from({ length: count }, (_, i) => `${seed}-${i}`);

  if (count === 0) return null;

  const close = () => setOpenIndex(null);
  const prev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Images size={18} className="text-accent" />
        <h2 className="text-lg font-bold text-foreground md:text-xl">Galería</h2>
        <span className="text-sm text-muted">{count}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setOpenIndex(i)}
            className="group aspect-video overflow-hidden rounded-md transition-transform duration-200 hover:scale-[1.03]"
          >
            <BackdropPlaceholder seed={img} />
          </button>
        ))}
      </div>

      {openIndex !== null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={close}
          >
            <button
              aria-label="Cerrar"
              onClick={close}
              className="absolute right-6 top-6 text-white/80 transition-colors hover:text-white"
            >
              <X size={28} />
            </button>
            <button
              aria-label="Anterior"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 text-white/80 transition-colors hover:text-white md:left-8"
            >
              <ChevronLeft size={36} />
            </button>

            <div
              key={openIndex}
              onClick={(e) => e.stopPropagation()}
              className="aspect-video w-[90vw] max-w-4xl overflow-hidden rounded-lg"
            >
              <BackdropPlaceholder seed={images[openIndex]} />
            </div>

            <button
              aria-label="Siguiente"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 text-white/80 transition-colors hover:text-white md:right-8"
            >
              <ChevronRight size={36} />
            </button>
          </div>
        )}
    </section>
  );
}
