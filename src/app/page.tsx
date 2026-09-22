import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import {
  getAllBooks,
  getTrendingBooks,
  getFreeBooks,
  getFeaturedBooks,
  getBooksByGenre,
  getAllBookGenres,
  getFavoriteBooks,
  getContinueReadingBooks,
  getRecommendedForUser,
  attachReadingProgress,
} from "@/lib/books-data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookRow from "@/components/BookRow";
import BookSearchBar from "@/components/BookSearchBar";
import AdFrame from "@/components/ads/AdFrame";
import { getActiveAdsByPlacement } from "@/lib/ads-data";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    absolute: "Butakia — Lee Libros Gratis Online",
  },
  description:
    "La biblioteca digital de Butakia: novelas, cuentos, ensayos, poesía y obras de dominio público para leer gratis en línea.",
};

export default async function HomePage() {
  const [user, profile, all, trending, free, featured, genres, libroAds, settings] = await Promise.all([
    getCurrentUser(),
    getActiveProfile(),
    getAllBooks(),
    getTrendingBooks(),
    getFreeBooks(),
    getFeaturedBooks(),
    getAllBookGenres(),
    getActiveAdsByPlacement("libros_home"),
    getSiteSettings(),
  ]);

  let favorites = [] as Awaited<ReturnType<typeof getFavoriteBooks>>;
  let continueReading = [] as Awaited<ReturnType<typeof getContinueReadingBooks>>;
  let recommended = [] as Awaited<ReturnType<typeof getRecommendedForUser>>;
  if (user) {
    [favorites, continueReading, recommended] = await Promise.all([
      getFavoriteBooks(user.id, profile?.id ?? null),
      getContinueReadingBooks(user.id, profile?.id ?? null),
      getRecommendedForUser(user.id, profile?.id ?? null),
    ]);
    favorites = await attachReadingProgress(favorites, user.id, profile?.id ?? null);
    continueReading = await attachReadingProgress(continueReading, user.id, profile?.id ?? null);
  }

  const genreBooks = await Promise.all(genres.slice(0, 8).map((g) => getBooksByGenre(g)));
  const showAds = settings.adsEnabled && !user?.isPremium;

  return (
    <>
      <Header tagline={settings.librosTagline} />
      <main className="flex-1 pb-16 pt-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Butakia Libros</h1>
              <p className="mt-2 text-sm text-white/50">
                {all.length} {all.length === 1 ? "obra disponible" : "obras disponibles"} para leer gratis.
              </p>
              {settings.librosHeroMessage && (
                <p className="mt-1 max-w-xl text-sm text-white/70">{settings.librosHeroMessage}</p>
              )}
            </div>
            <Link
              href="/publicar"
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
            >
              <PenLine size={16} />
              Publicar mi obra
            </Link>
          </div>

          <div className="mt-6">
            <BookSearchBar />
          </div>
        </div>

        {all.length === 0 ? (
          <div className="mx-auto mt-16 max-w-7xl px-6 md:px-10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-white/60">Aún no hay libros publicados. Vuelve pronto.</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-8">
            {continueReading.length > 0 && (
              <BookRow
                title="Continuar leyendo"
                subtitle="Progreso estimado según tu última sesión de lectura."
                items={continueReading}
              />
            )}
            {recommended.length > 0 && (
              <BookRow
                title="Recomendados para ti"
                subtitle="Según tus favoritos y lecturas."
                items={recommended}
              />
            )}
            <BookRow title="Destacados" items={featured} />
            <BookRow title="Más leídos" items={trending} />
            {showAds && libroAds[0] && (
              <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
                <AdFrame ad={libroAds[0]} className="overflow-hidden rounded-xl" />
              </div>
            )}
            <BookRow title="Novedades" items={all.slice(0, 20)} />
            <BookRow title="Libros gratuitos" items={free} />
            {favorites.length > 0 && (
              <div id="mis-favoritos">
                <BookRow title="Mis favoritos" items={favorites} />
              </div>
            )}
            {genres.slice(0, 8).map((genre, i) => (
              <BookRow key={genre} title={genre} items={genreBooks[i]} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
