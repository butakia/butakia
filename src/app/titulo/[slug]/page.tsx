import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { getTitleBySlug, getRelated, getComments, getFranchiseByName, isFavoriteTitle, getSiteSettings } from "@/lib/data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { getActiveAdsByPlacement } from "@/lib/ads-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContentRow from "@/components/ContentRow";
import Gallery from "@/components/Gallery";
import DetailHero from "@/components/DetailHero";
import TriviaSection from "@/components/TriviaSection";
import SuggestEditButton from "@/components/SuggestEditButton";
import CommentSection from "@/components/CommentSection";
import AdFrame from "@/components/ads/AdFrame";
import { isRealImage } from "@/components/PosterPlaceholder";
import { SITE_URL } from "@/lib/constants";
import { filterForKids } from "@/lib/kidsMode";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getTitleBySlug(slug);
  if (!item) return {};

  const kind = item.type === "series" ? "serie" : "película";
  const title = item.seoTitle || `Ver ${item.title} Gratis Online en HD (${item.year})`;
  const description =
    item.seoDescription ||
    (item.synopsis
      ? `Mira la ${kind} ${item.title} (${item.year}) online gratis, en HD y sin cortes. ${item.synopsis}`
      : `Mira la ${kind} ${item.title} (${item.year}) online gratis, en HD y sin cortes en Butakia.`);
  const keywords = item.seoKeywords?.length
    ? item.seoKeywords
    : [
        `ver ${item.title} online`,
        `${item.title} gratis`,
        `${item.title} español latino`,
        `${item.title} ${item.year}`,
      ];
  const url = `${SITE_URL}/titulo/${item.slug}`;
  const image = isRealImage(item.poster) ? item.poster : `${SITE_URL}/opengraph-image`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `Ver ${item.title} Gratis`,
      description,
      url,
      type: "video.movie",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `Ver ${item.title} Gratis`,
      description,
      images: [image],
    },
  };
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getTitleBySlug(slug);
  if (!item) notFound();

  const [related, user, profile, comments, franchiseDef, settings] = await Promise.all([
    getRelated(item),
    getCurrentUser(),
    getActiveProfile(),
    getComments(item.id),
    item.franchise ? getFranchiseByName(item.franchise) : Promise.resolve(undefined),
    getSiteSettings(),
  ]);

  if (profile?.isKids && filterForKids([item], true).length === 0) notFound();

  const favorited = await isFavoriteTitle(user?.id, item.id, profile?.id ?? null);
  const showAds = settings.adsEnabled && !user?.isPremium;
  const detailAds = showAds ? await getActiveAdsByPlacement("titulo_detalle") : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.type === "series" ? "TVSeries" : "Movie",
    name: item.title,
    description: item.synopsis || undefined,
    image: isRealImage(item.poster)
      ? item.poster.startsWith("http")
        ? item.poster
        : `${SITE_URL}${item.poster}`
      : `${SITE_URL}/opengraph-image`,
    datePublished: String(item.year),
    genre: item.genres,
    aggregateRating:
      item.rating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: item.rating,
            bestRating: 10,
            ratingCount: Math.max(1, item.views ?? 1),
          }
        : undefined,
    director: item.director ? { "@type": "Person", name: item.director } : undefined,
    actor: item.cast?.length ? item.cast.map((name) => ({ "@type": "Person", name })) : undefined,
    url: `${SITE_URL}/titulo/${item.slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Explorar", item: `${SITE_URL}/explorar` },
      { "@type": "ListItem", position: 3, name: item.title, item: `${SITE_URL}/titulo/${item.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1">
        <DetailHero item={item} initialFavorited={favorited} />

        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
          {item.franchise && (
            <Link
              href="/franquicias"
              className="flex w-fit items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
            >
              {franchiseDef?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={franchiseDef.logoUrl} alt="" className="h-4 w-4 rounded object-contain" />
              ) : (
                <Flame size={13} />
              )}
              Franquicia: {item.franchise}
            </Link>
          )}

          {item.cast?.length || item.director ? (
            <section>
              <h2 className="mb-3 text-lg font-bold md:text-xl">Reparto y equipo</h2>
              <div className="flex flex-col gap-3 text-sm">
                {item.director && (
                  <p>
                    <span className="text-muted">Director: </span>
                    <span className="font-medium">{item.director}</span>
                  </p>
                )}
                {item.cast?.length ? (
                  <p>
                    <span className="text-muted">Reparto: </span>
                    <span className="font-medium">{item.cast.join(", ")}</span>
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <TriviaSection trivia={item.trivia ?? []} />

          {item.galleryCount ? <Gallery seed={item.slug} count={item.galleryCount} /> : null}

          <div>
            <SuggestEditButton item={item} isLoggedIn={Boolean(user)} />
          </div>

          {detailAds[0] && <AdFrame ad={detailAds[0]} className="overflow-hidden rounded-xl" />}

          <CommentSection
            titleId={item.id}
            initialComments={comments}
            isLoggedIn={Boolean(user)}
            currentUserId={user?.id}
            isAdmin={user?.role === "admin"}
          />
        </div>

        {related.length > 0 && (
          <div className="pb-10">
            <ContentRow row={{ id: "related", title: "Más como esto", items: related }} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
