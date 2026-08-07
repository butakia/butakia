import type { Metadata } from "next";
import { Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExplorerClient from "@/components/ExplorerClient";
import { getAllTitles, getFranchises, getSiteSettings } from "@/lib/data";
import { getActiveProfile, getCurrentUser } from "@/lib/dal";
import { getActiveAdsByPlacement } from "@/lib/ads-data";
import { filterForKids } from "@/lib/kidsMode";
import { SITE_URL } from "@/lib/constants";
import AdFrame from "@/components/ads/AdFrame";

export const metadata: Metadata = {
  title: "Explorar catálogo",
  description:
    "Explora y filtra todo el catálogo de Butakia por género, tipo y más. Miles de películas y series para ver online gratis.",
  alternates: { canonical: `${SITE_URL}/explorar` },
};

export default async function ExplorarPage() {
  const [titlesRaw, franchiseSummaries, profile, user, settings] = await Promise.all([
    getAllTitles(),
    getFranchises(),
    getActiveProfile(),
    getCurrentUser(),
    getSiteSettings(),
  ]);
  const titles = filterForKids(titlesRaw, Boolean(profile?.isKids));
  const showAds = settings.adsEnabled && !user?.isPremium;
  const explorarAds = showAds ? await getActiveAdsByPlacement("explorar") : [];

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Compass size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Explorar</h1>
              <p className="text-sm text-white/50">Busca y filtra todo el catálogo de Butakia.</p>
            </div>
          </div>

          {explorarAds[0] && (
            <div className="mb-6">
              <AdFrame ad={explorarAds[0]} className="overflow-hidden rounded-xl" />
            </div>
          )}

          <ExplorerClient titles={titles} franchises={franchiseSummaries.map((f) => f.name)} />
        </div>
      </main>
      <Footer />
    </>
  );
}
