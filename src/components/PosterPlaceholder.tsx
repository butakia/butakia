import { Clapperboard, BookOpen } from "lucide-react";

const PALETTES = [
  ["#3b0d0d", "#0b0b0b"],
  ["#1b2a4a", "#0b0b0b"],
  ["#1a3a2e", "#0b0b0b"],
  ["#3a1a3a", "#0b0b0b"],
  ["#3a2a0a", "#0b0b0b"],
  ["#0a2a3a", "#0b0b0b"],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function paletteFor(seed: string): [string, string] {
  const [a, b] = PALETTES[hash(seed) % PALETTES.length];
  return [a, b];
}

export function isRealImage(value: string): boolean {
  return value.startsWith("/uploads/") || value.startsWith("http://") || value.startsWith("https://");
}

export default function PosterPlaceholder({
  seed,
  title,
  className,
  iconSize = 28,
  icon = "movie",
}: {
  seed: string;
  title: string;
  className?: string;
  iconSize?: number;
  icon?: "movie" | "book";
}) {
  if (isRealImage(seed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={seed}
        alt={title}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }

  const [from, to] = paletteFor(seed);
  return (
    <div
      className={`relative flex h-full w-full items-end overflow-hidden ${className ?? ""}`}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      {icon === "book" ? (
        <BookOpen size={iconSize} className="absolute right-3 top-3 text-white/20" strokeWidth={1.5} />
      ) : (
        <Clapperboard size={iconSize} className="absolute right-3 top-3 text-white/20" strokeWidth={1.5} />
      )}
      <span className="line-clamp-3 p-3 text-sm font-semibold text-white/80">{title}</span>
    </div>
  );
}
