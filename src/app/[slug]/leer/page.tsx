import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { getBookBySlug, getBookChapters, getReadingProgress, getReaderPreference, getSaleInfo, getBookHighlights, isBookFavorited, getBookComments } from "@/lib/books-data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { hasBookEntitlement } from "@/lib/books-actions";
import { getSiteSettings } from "@/lib/data";
import BookReader from "@/components/reader/BookReader";
import ShareRow from "@/components/reader/ShareRow";
import BookComments from "@/components/BookComments";
import Logo from "@/components/Logo";

export default async function LeerLibroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book || book.status !== "published") notFound();

  const [user, profile, chapters, saleInfo] = await Promise.all([
    getCurrentUser(),
    getActiveProfile(),
    getBookChapters(book.id),
    getSaleInfo(book.id),
  ]);

  const isPaidAndApproved = saleInfo?.priceUsd && saleInfo.validationStatus === "approved";
  const isOwnerOrAdmin = user && (user.id === book.uploaderId || user.role === "admin");
  const entitled = isPaidAndApproved && user ? await hasBookEntitlement(user.id, book.id) : false;
  const locked = Boolean(isPaidAndApproved) && !entitled && !isOwnerOrAdmin;

  if (locked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <Lock size={40} className="text-accent" />
        <h1 className="text-xl font-bold text-white">Esta obra es de pago</h1>
        <p className="max-w-sm text-sm text-white/60">
          &quot;{book.title}&quot; cuesta ${saleInfo!.priceUsd!.toFixed(2)} USD. Contacta a Butakia para
          completar la compra y desbloquear la lectura completa.
        </p>
        <Link href={`/${book.slug}`} className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white">
          Volver a la obra
        </Link>
      </div>
    );
  }

  const [progress, readerPref, highlights, favorited, comments, siteSettings] = await Promise.all([
    getReadingProgress(user?.id, book.id, profile?.id ?? null),
    getReaderPreference(user?.id),
    user ? getBookHighlights(user.id, book.id) : Promise.resolve([]),
    isBookFavorited(user?.id, book.id, profile?.id ?? null),
    getBookComments(book.id),
    getSiteSettings(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col bg-black px-3 py-3 md:px-8 md:py-6">
      <div className="mb-2 flex shrink-0 items-center gap-3 md:mb-4">
        <Link
          href={`/${book.slug}`}
          aria-label="Volver a Butakia Libros"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_2px_10px_-2px_rgba(229,9,20,0.6)] transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </Link>
        <Logo iconOnly subtitle="Libros" className="shrink-0" />
        <span className="truncate text-sm font-semibold text-white/70">{book.title}</span>
      </div>

      <div className="w-full shrink-0">
        <BookReader
          book={book}
          chapters={chapters}
          initialPage={progress?.page ?? 0}
          hasProgress={Boolean(progress)}
          initialPrefs={
            readerPref
              ? {
                  mode: readerPref.mode as "flip" | "scroll",
                  theme: readerPref.theme as "dark" | "sepia" | "light",
                  fontSize: readerPref.fontSize,
                  lineHeight: readerPref.lineHeight,
                  fontFamily: readerPref.fontFamily,
                  textWidth: readerPref.textWidth as "narrow" | "normal" | "wide",
                  textAlign: readerPref.textAlign as "left" | "justify",
                  soundEnabled: readerPref.soundEnabled,
                }
              : {}
          }
          initialHighlights={highlights}
          initialFavorited={favorited}
          siteSettings={siteSettings}
        />
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-8">
        <ShareRow slug={book.slug} title={book.title} />
        <div className="h-px w-full bg-white/10" />
        <BookComments
          bookId={book.id}
          initialComments={comments}
          isLoggedIn={Boolean(user)}
          currentUserId={user?.id}
          isAdmin={user?.role === "admin"}
        />
      </div>
    </div>
  );
}
