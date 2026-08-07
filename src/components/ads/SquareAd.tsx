import { getActiveAdsByPlacement } from "@/lib/ads-data";
import AdFrame from "./AdFrame";

export default async function SquareAd({ className }: { className?: string }) {
  const ads = await getActiveAdsByPlacement("square");
  if (ads.length === 0) return null;
  const ad = ads[0];

  return <AdFrame ad={ad} className={className ?? "mx-auto w-full max-w-xs overflow-hidden rounded-xl"} />;
}
