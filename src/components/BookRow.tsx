"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Book } from "@/lib/types";
import BookCard from "./BookCard";

export default function BookRow({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Book[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section
      className="group/row relative px-6 md:px-10"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-accent" />
          <h2 className="text-lg font-bold text-foreground md:text-xl">{title}</h2>
          <span className="text-sm text-muted">{items.length}</span>
        </div>
        {subtitle && <p className="ml-3 mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>

      <div className="relative">
        {hovering && (
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className="absolute left-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 group-hover/row:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div ref={scrollerRef} className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-4">
          {items.map((item) => (
            <BookCard key={item.id} item={item} />
          ))}
        </div>

        {hovering && (
          <button
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className="absolute right-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 group-hover/row:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
}
