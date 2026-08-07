import type { Metadata } from "next";
import { getBooksByGenre } from "@/lib/books-data";
import LibrosHeader from "@/components/LibrosHeader";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}): Promise<Metadata> {
  const { genre } = await params;
  const name = decodeURIComponent(genre);
  return {
    title: `${name} — Libros`,
    description: `Explora obras de ${name} gratis en Butakia Libros.`,
  };
}

export default async function LibrosGenrePage({
  params,
}: {
  params: Promise<{ genre: string }>;
}) {
  const { genre } = await params;
  const name = decodeURIComponent(genre);
  const books = await getBooksByGenre(name, 60);

  return (
    <>
      <LibrosHeader />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-black capitalize text-white">{name}</h1>
          <p className="mt-2 text-sm text-white/50">
            {books.length} {books.length === 1 ? "obra" : "obras"}
          </p>

          {books.length === 0 ? (
            <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-white/60">Aún no hay libros en esta categoría.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {books.map((b) => (
                <BookCard key={b.id} item={b} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
