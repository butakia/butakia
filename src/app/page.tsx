import { Fragment } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import CommunityBanner from "@/components/CommunityBanner";
import UploadIncentiveBanner from "@/components/UploadIncentiveBanner";
import AdBanner from "@/components/AdBanner";
import UnderRowAd from "@/components/ads/UnderRowAd";
import CrossPromoCard from "@/components/CrossPromoCard";
import PromoBanner from "@/components/PromoBanner";
import { BookOpen } from "lucide-react";
import {
  getFeaturedList,
  getRows,
  getRecentlyViewed,
  getFavoriteTitles,
  getContributorByUserId,
  getSiteSettings,
} from "@/lib/data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { filterForKids } from "@/lib/kidsMode";

export default async function Home() {
  const [featuredListRaw, rowsRaw, user, settings, profile] = await Promise.all([
    getFeaturedList(),
    getRows(),
    getCurrentUser(),
    getSiteSettings(),
    getActiveProfile(),
  ]);
  const showAds = settings.premiumEnabled && !user?.isPremium;
  const profileId = profile?.id ?? null;
  const isKids = Boolean(profile?.isKids);

  const featuredList = filterForKids(featuredListRaw, isKids);
  const rows = rowsRaw
    .map((row) => ({ ...row, items: filterForKids(row.items, isKids) }))
    .filter((row) => row.items.length > 0);

  const [recentlyViewedRaw, favoriteTitlesRaw, contributor] = user
    ? await Promise.all([
        getRecentlyViewed(user.id, 12, profileId),
        getFavoriteTitles(user.id, profileId),
        getContributorByUserId(user.id),
      ])
    : [[], [], undefined];
  const recentlyViewed = filterForKids(recentlyViewedRaw, isKids);
  const favoriteTitles = filterForKids(favoriteTitlesRaw, isKids);

  if (!featuredList.length) {
    return (
      <>
        <Header />
        <main className="flex-1 px-6 py-24 text-center text-white/50">
          Aún no hay contenido publicado.
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero titles={featuredList} />
        {settings.bannerEnabled && settings.bannerUrl && (
          <PromoBanner imageUrl={settings.bannerUrl} link={settings.bannerLink} />
        )}
        {contributor ? (
          <UploadIncentiveBanner uploads={contributor.uploads} />
        ) : (
          <CommunityBanner />
        )}
        <div className="px-6 pt-8 md:px-10">
          <CrossPromoCard
            icon={BookOpen}
            question="¿Disfrutas de los libros?"
            cta="Prueba Butakia Libros: novelas, cuentos, poesía y más, gratis."
            href="/libros"
          />
        </div>
        <div className="flex flex-col gap-10 py-8">
          {recentlyViewed.length > 0 && (
            <ContentRow
              row={{
                id: "continuar",
                title: "Continuar viendo",
                subtitle: "Progreso estimado según tu tiempo en la página, no tu posición exacta.",
                items: recentlyViewed,
              }}
            />
          )}
          {favoriteTitles.length > 0 && (
            <ContentRow row={{ id: "mi-lista", title: "Mi Lista", items: favoriteTitles.slice(0, 12) }} />
          )}
          {rows.map((row, i) => (
            <Fragment key={row.id}>
              <ContentRow row={row} />
              {i === 1 && showAds && (
                <>
                  <AdBanner />
                  <UnderRowAd />
                </>
              )}
            </Fragment>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
