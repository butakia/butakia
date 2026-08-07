import { getActiveAdsByPlacement } from "@/lib/ads-data";
import AdPopup from "./AdPopup";

export default async function AdPopupLoader({ showAds }: { showAds: boolean }) {
  if (!showAds) return null;
  const ads = await getActiveAdsByPlacement("popup");
  if (ads.length === 0) return null;
  return <AdPopup ad={ads[0]} />;
}
