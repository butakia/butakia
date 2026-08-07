import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Star, Eye, DollarSign, Clock } from "lucide-react";
import { getBookBySlug, isBookFavorited, getBookComments, getSaleInfo, getRecommendedBooks } from "@/lib/books-data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { getSiteSettings } from "@/lib/data";
import { getActiveAdsByPlacement } from "@/lib/ads-data";
import LibrosHeader from "@/components/LibrosHeader";
import Footer from "@/components/Footer";
import PosterPlaceholder from "@/components/PosterPlaceholder";
import { isRealImage } from "@/components/PosterPlaceholder";
import BookFavoriteButton from "@/components/BookFavoriteButton";
import BookComments from "@/components/BookComments";
import ReportBookButton from "@/components/ReportBookButton";
import BookRow from "@/components/BookRow";
import AdFrame from "@/components/ads/AdFrame";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return {};

  const title = book.seoTitle || `Leer ${book.title} Gratis Online`;
  const description =
    book.seoDescription ||
    (book.synopsis
      ? `Lee ${book.title} de ${book.authorName} gratis en línea. ${book.synopsis}`
      : `Lee ${book.title} de ${book.authorName} gratis en línea en Butakia Libros.`);
  const url = `${SITE_URL}/libros/${book.slug}`;
  const image = isRealImage(book.cover) ? book.cover : `${SITE_URL}/opengraph-image`;

  return {
    title,
    description,
    keywords: book.seoKeywords?.length ? book.seoKeywords : [`leer ${book.title}`, `${book.title} gratis`, book.authorName],
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "book", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book || book.status !== "published") notFound();

  const [user, profile, comments, saleInfo, recommended, settings] = await Promise.all([
    getCurrentUser(),
    getActiveProfile(),
    getBookComments(book.id),
    getSaleInfo(book.id),
    getRecommendedBooks(book),
    getSiteSettings(),
  ]);
  const favorited = await isBookFavorited(user?.id, book.id, profile?.id ?? null);
  const showAds = settings.adsEnabled && !user?.isPremium;
  const detailAds = showAds ? await getActiveAdsByPlacement("libro_detalle") : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.authorName },
    description: book.synopsis || undefined,
    image: isRealImage(book.cover)
      ? book.cover.startsWith("http")
        ? book.cover
        : `${SITE_URL}${book.cover}`
      : `${SITE_URL}/opengraph-image`,
    inLanguage: book.language || undefined,
    numberOfPages: book.pageCount || undefined,
    publisher: book.publisher ? { "@type": "Organization", name: book.publisher } : undefined,
    datePublished: book.year ? String(book.year) : undefined,
    isbn: book.isbn || undefined,
    genre: book.genres,
    aggregateRating:
      book.rating > 0
        ? { "@type": "AggregateRating", ratingValue: book.rating, bestRating: 10, ratingCount: Math.max(1, book.readCount) }
        : undefined,
    url: `${SITE_URL}/libros/${book.slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Libros", item: `${SITE_URL}/libros` },
      { "@type": "ListItem", position: 3, name: book.title, item: `${SITE_URL}/libros/${book.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <LibrosHeader />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row">
          <div className="mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-xl shadow-2xl md:mx-0 md:w-64">
            <PosterPlaceholder seed={book.cover || book.slug} title={book.title} icon="book" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black text-white md:text-4xl">{book.title}</h1>
            {book.subtitle && <p className="mt-1 text-lg text-white/60">{book.subtitle}</p>}
            <p className="mt-2 text-white/70">
              por{" "}
              {book.literaryAuthorSlug ? (
                <Link
                  href={`/libros/autor/${book.literaryAuthorSlug}`}
                  className="font-semibold text-white hover:text-accent hover:underline"
                >
                  {book.authorName}
                </Link>
              ) : (
                <span className="font-semibold text-white">{book.authorName}</span>
              )}
            </p>
            {book.showUploader && book.uploaderName && (
              <p className="mt-0.5 text-xs text-white/40">
                Subido por{" "}
                {book.authorId ? (
                  <Link href={`/colaboradores/${book.authorId}`} className="hover:text-white hover:underline">
                    {book.uploaderName}
                  </Link>
                ) : (
                  book.uploaderName
                )}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/50">
              {book.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-accent text-accent" />
                  {book.rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {book.readCount.toLocaleString("es-ES")} lecturas
              </span>
              {book.year && <span>{book.year}</span>}
              {book.language && <span>{book.language}</span>}
              {book.pageCount && <span>{book.pageCount} páginas</span>}
              {book.publisher && <span>{book.publisher}</span>}
            </div>

            {book.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {book.genres.map((g) => (
                  <span key={g} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {book.synopsis && <p className="mt-5 max-w-2xl leading-relaxed text-white/70">{book.synopsis}</p>}

            {saleInfo?.priceUsd && (
              <div className="mt-5 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-bold text-accent">
                  <DollarSign size={14} />
                  {saleInfo.priceUsd.toFixed(2)} USD
                </span>
                {saleInfo.validationStatus !== "approved" && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-3 py-1.5 text-xs font-semibold text-yellow-500">
                    <Clock size={12} />
                    En proceso de validación
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/libros/${book.slug}/leer`}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                <BookOpen size={18} />
                Leer ahora
              </Link>
              <BookFavoriteButton bookId={book.id} initialFavorited={favorited} />
              <ReportBookButton bookId={book.id} isLoggedIn={Boolean(user)} />
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <div className="mt-12 -mx-6 md:-mx-10">
            <BookRow title="Libros recomendados" items={recommended} />
          </div>
        )}

        {detailAds[0] && (
          <div className="mx-auto mt-12 max-w-5xl">
            <AdFrame ad={detailAds[0]} className="overflow-hidden rounded-xl" />
          </div>
        )}

        <div className="mx-auto mt-12 max-w-5xl">
          <BookComments
            bookId={book.id}
            initialComments={comments}
            isLoggedIn={Boolean(user)}
            currentUserId={user?.id}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
