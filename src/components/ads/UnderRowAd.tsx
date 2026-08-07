import { getActiveAdsByPlacement } from "@/lib/ads-data";
import AdFrame from "./AdFrame";

export default async function UnderRowAd() {
  const ads = await getActiveAdsByPlacement("under_row");
  if (ads.length === 0) return null;
  const ad = ads[0];

  return (
    <div className="mx-auto my-2 max-w-6xl px-6 md:px-10">
      <AdFrame ad={ad} className="overflow-hidden rounded-xl" />
    </div>
  );
}
