import { BookOpen } from "lucide-react";

// Both stops keep enough lightness/saturation to read clearly against the app's
// near-black background — a gradient that fades to near-black (like the old
// palette did) becomes visually indistinguishable from the page behind it.
const PALETTES = [
  ["#8a2f2f", "#3a1212"],
  ["#2f4f8a", "#12203a"],
  ["#2f6b52", "#12331f"],
  ["#6b2f6b", "#331233"],
  ["#8a5f1f", "#3a2c0d"],
  ["#1f6b8a", "#0d333f"],
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
  author,
  className,
  iconSize = 28,
}: {
  seed: string;
  title: string;
  author?: string;
  className?: string;
  iconSize?: number;
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
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center ${className ?? ""}`}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      <BookOpen size={iconSize} className="mb-3 text-white/30" strokeWidth={1.5} />
      <span className="line-clamp-4 px-4 text-base font-black leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        {title}
      </span>
      {author && (
        <span className="mt-2 line-clamp-1 px-4 text-xs font-semibold uppercase tracking-wide text-white/70">
          {author}
        </span>
      )}
    </div>
  );
}
