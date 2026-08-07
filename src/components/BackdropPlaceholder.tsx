import { paletteFor, isRealImage } from "./PosterPlaceholder";

export default function BackdropPlaceholder({
  seed,
  className,
  eager,
}: {
  seed: string;
  className?: string;
  eager?: boolean;
}) {
  if (isRealImage(seed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={seed}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }

  const [from, to] = paletteFor(seed);
  return (
    <div
      className={`h-full w-full ${className ?? ""}`}
      style={{
        background: `radial-gradient(circle at 30% 20%, ${from}aa, transparent 55%), linear-gradient(160deg, ${from}, ${to})`,
      }}
    />
  );
}
