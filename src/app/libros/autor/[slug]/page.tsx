import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { getLiteraryAuthorBySlug, getBooksByLiteraryAuthor } from "@/lib/books-data";
import LibrosHeader from "@/components/LibrosHeader";
import Footer from "@/components/Footer";
import BookRow from "@/components/BookRow";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getLiteraryAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio || `Obras de ${author.name} disponibles en Butakia Libros.`,
    openGraph: { title: author.name, images: author.photoUrl ? [author.photoUrl] : undefined },
  };
}

export default async function LiteraryAuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getLiteraryAuthorBySlug(slug);
  if (!author) notFound();

  const books = await getBooksByLiteraryAuthor(author.id);

  return (
    <>
      <LibrosHeader />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            {author.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.photoUrl}
                alt={author.name}
                className="h-28 w-28 shrink-0 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white ring-2 ring-white/10"
                style={{
                  background: `linear-gradient(135deg, hsl(${(author.name.length * 37) % 360} 60% 35%), hsl(${(author.name.length * 37 + 40) % 360} 60% 20%))`,
                }}
              >
                {author.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="flex items-center justify-center gap-2 text-3xl font-black text-white sm:justify-start">
                {author.name}
                {author.verified && (
                  <span title="Autor verificado" className="inline-flex text-accent">
                    <BadgeCheck size={22} />
                  </span>
                )}
              </h1>
              {author.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">{author.bio}</p>}
              {author.trajectory && (
                <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                  {author.trajectory}
                </p>
              )}
              <p className="mt-3 text-xs text-white/40">{books.length} obra(s) en Butakia Libros</p>
              {!author.userId && (
                <p className="mt-2 text-xs text-white/40">
                  ¿Eres tú?{" "}
                  <Link href="/libros/mi-perfil-autor" className="text-accent hover:underline">
                    Reclama este perfil
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>

        {books.length > 0 && (
          <div className="mt-10 -mx-6 md:-mx-10">
            <BookRow title={`Obras de ${author.name}`} items={books} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
