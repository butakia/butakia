import { AdSlot } from "@/lib/ads-types";

const SIZE_STYLE: Record<string, React.CSSProperties> = {
  responsive: {},
  "300x250": { width: 300, height: 250, maxWidth: "100%" },
  "728x90": { width: 728, height: 90, maxWidth: "100%" },
  "160x600": { width: 160, height: 600, maxWidth: "100%" },
  "320x50": { width: 320, height: 50, maxWidth: "100%" },
};

export default function AdFrame({ ad, className }: { ad: AdSlot; className?: string }) {
  return (
    <div
      className={`mx-auto ${className ?? ""}`}
      style={SIZE_STYLE[ad.sizePreset] ?? {}}
      // Admin-authored embed code (iframe tags) — trusted content, only editable by admins.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: ad.iframeCode }}
    />
  );
}
