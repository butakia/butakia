import "server-only";
import { prisma } from "./prisma";
import { Book, BookChapter } from "./types";
import type { Book as DbBook, BookChapter as DbBookChapter } from "@/generated/prisma/client";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dbToBook(row: DbBook & { literaryAuthor?: { slug: string } | null }): Book {
  const genres = parseJsonArray(row.genres);
  const tags = parseJsonArray(row.tags);
  const categories = parseJsonArray(row.categories);
  const badges = parseJsonArray(row.badges);
  const seoKeywords = parseJsonArray(row.seoKeywords);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    authorName: row.authorName,
    authorId: row.authorId ?? undefined,
    literaryAuthorId: row.literaryAuthorId ?? undefined,
    literaryAuthorSlug: row.literaryAuthor?.slug,
    showUploader: row.showUploader,
    publisher: row.publisher ?? undefined,
    year: row.year ?? undefined,
    language: row.language ?? undefined,
    isbn: row.isbn ?? undefined,
    synopsis: row.synopsis,
    cover: row.cover,
    genres,
    tags: tags.length ? tags : undefined,
    categories: categories.length ? categories : undefined,
    badges: badges.length ? badges : undefined,
    contentType: row.contentType as Book["contentType"],
    sourceKind: row.sourceKind as Book["sourceKind"],
    pdfUrl: row.pdfUrl ?? undefined,
    pageCount: row.pageCount ?? undefined,
    wordCount: row.wordCount ?? undefined,
    status: row.status as Book["status"],
    isFree: row.isFree,
    featured: row.featured,
    featuredOrder: row.featuredOrder,
    views: row.views,
    readCount: row.readCount,
    rating: row.rating,
    uploaderId: row.uploaderId,
    uploaderName: row.uploaderName ?? undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    seoKeywords: seoKeywords.length ? seoKeywords : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function dbToChapter(row: DbBookChapter): BookChapter {
  return {
    id: row.id,
    bookId: row.bookId,
    order: row.order,
    title: row.title ?? undefined,
    content: row.content,
    pageStart: row.pageStart ?? undefined,
    pageEnd: row.pageEnd ?? undefined,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbToBook);
}

export async function getAllBooksAdmin(): Promise<Book[]> {
  const rows = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(dbToBook);
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const row = await prisma.book.findUnique({
    where: { slug },
    include: { literaryAuthor: { select: { slug: true } } },
  });
  return row ? dbToBook(row) : undefined;
}

export async function getBookChapters(bookId: string): Promise<BookChapter[]> {
  const rows = await prisma.bookChapter.findMany({
    where: { bookId },
    orderBy: { order: "asc" },
  });
  return rows.map(dbToChapter);
}

export async function getPendingBookSubmissionsCount(): Promise<number> {
  return prisma.pendingBookSubmission.count();
}

export async function getOpenBookReportsCount(): Promise<number> {
  return prisma.bookReport.count({ where: { status: "open" } });
}

export async function isBookFavorited(
  userId: string | undefined | null,
  bookId: string,
  profileId?: string | null
): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.bookFavorite.findFirst({ where: { userId, bookId, profileId: profileId ?? null } });
  return Boolean(row);
}

export async function getReadingProgress(
  userId: string | undefined | null,
  bookId: string,
  profileId?: string | null
) {
  if (!userId) return undefined;
  return prisma.readingProgress.findFirst({ where: { userId, bookId, profileId: profileId ?? null } });
}

export async function getReaderPreference(userId: string | undefined | null) {
  if (!userId) return undefined;
  return prisma.readerPreference.findUnique({ where: { userId } });
}

export async function getTrendingBooks(limit = 20): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { status: "published" },
    orderBy: { readCount: "desc" },
    take: limit,
  });
  return rows.map(dbToBook);
}

export async function getFreeBooks(limit = 20): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { status: "published", isFree: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(dbToBook);
}

export async function getFeaturedBooks(limit = 20): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { status: "published", featured: true },
    orderBy: { featuredOrder: "asc" },
    take: limit,
  });
  return rows.map(dbToBook);
}

export async function getBooksByGenre(genre: string, limit = 20): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { status: "published", genres: { contains: `"${genre}"` } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(dbToBook);
}

export async function getAllBookGenres(): Promise<string[]> {
  const rows = await prisma.book.findMany({ where: { status: "published" }, select: { genres: true } });
  const set = new Set<string>();
  for (const r of rows) parseJsonArray(r.genres).forEach((g) => set.add(g));
  return [...set];
}

export async function getFavoriteBooks(userId: string, profileId?: string | null): Promise<Book[]> {
  const rows = await prisma.bookFavorite.findMany({
    where: { userId, profileId: profileId ?? null },
    orderBy: { createdAt: "desc" },
    include: { book: true },
  });
  return rows.filter((r) => r.book.status === "published").map((r) => dbToBook(r.book));
}

export async function getContinueReadingBooks(userId: string, profileId?: string | null): Promise<Book[]> {
  const rows = await prisma.readingProgress.findMany({
    where: { userId, profileId: profileId ?? null, percent: { gt: 0, lt: 100 } },
    orderBy: { lastReadAt: "desc" },
    include: { book: true },
  });
  return rows.filter((r) => r.book.status === "published").map((r) => dbToBook(r.book));
}

export async function attachReadingProgress(
  books: Book[],
  userId: string | undefined | null,
  profileId?: string | null
): Promise<Book[]> {
  if (!userId || books.length === 0) return books;
  const rows = await prisma.readingProgress.findMany({
    where: { userId, profileId: profileId ?? null, bookId: { in: books.map((b) => b.id) } },
  });
  const percentByBookId = new Map(rows.map((r) => [r.bookId, r.percent]));
  return books.map((b) => ({ ...b, progressPercent: percentByBookId.get(b.id) }));
}

export async function getRecommendedForUser(
  userId: string | undefined | null,
  profileId: string | undefined | null,
  limit = 20
): Promise<Book[]> {
  if (!userId) return [];

  const [favorites, progress] = await Promise.all([
    prisma.bookFavorite.findMany({ where: { userId, profileId: profileId ?? null }, include: { book: true } }),
    prisma.readingProgress.findMany({ where: { userId, profileId: profileId ?? null }, include: { book: true } }),
  ]);

  const seedBooks = [...favorites.map((f) => f.book), ...progress.map((p) => p.book)];
  if (seedBooks.length === 0) return [];

  const seedIds = new Set(seedBooks.map((b) => b.id));
  const genreCounts = new Map<string, number>();
  for (const b of seedBooks) {
    for (const g of parseJsonArray(b.genres)) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
  }
  if (genreCounts.size === 0) return [];

  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  const rows = await prisma.book.findMany({
    where: {
      status: "published",
      id: { notIn: [...seedIds] },
      OR: topGenres.map((g) => ({ genres: { contains: `"${g}"` } })),
    },
    orderBy: { readCount: "desc" },
    take: limit,
  });
  return rows.map(dbToBook);
}

export async function getRecommendedBooks(book: Book, limit = 12): Promise<Book[]> {
  const genres = book.genres;
  if (genres.length === 0) return [];
  const rows = await prisma.book.findMany({
    where: {
      status: "published",
      id: { not: book.id },
      OR: genres.map((g) => ({ genres: { contains: `"${g}"` } })),
    },
    orderBy: { readCount: "desc" },
    take: limit,
  });
  return rows.map(dbToBook);
}

export async function getLiteraryAuthorBySlug(slug: string) {
  return prisma.literaryAuthor.findUnique({ where: { slug } });
}

export async function getBooksByLiteraryAuthor(authorId: string): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { literaryAuthorId: authorId, status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbToBook);
}

// Includes drafts/unpublished — for the claiming author's own management view, where
// they need to see everything they've uploaded, not just what's live to the public.
export async function getAllBooksByLiteraryAuthorForOwner(authorId: string): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { literaryAuthorId: authorId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbToBook);
}

export async function getLiteraryAuthorByUserId(userId: string) {
  return prisma.literaryAuthor.findUnique({ where: { userId } });
}

export async function getAllLiteraryAuthors() {
  return prisma.literaryAuthor.findMany({ orderBy: { name: "asc" } });
}

export async function getBookHighlights(userId: string, bookId: string) {
  return prisma.bookHighlight.findMany({ where: { userId, bookId }, orderBy: { createdAt: "asc" } });
}

export async function getBooksByContributor(contributorId: string): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { authorId: contributorId, status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbToBook);
}

export async function searchBooks(query: string, limit = 30): Promise<Book[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await prisma.book.findMany({
    where: {
      status: "published",
      OR: [
        { title: { contains: q } },
        { authorName: { contains: q } },
        { publisher: { contains: q } },
        { isbn: { contains: q } },
        { synopsis: { contains: q } },
        { tags: { contains: q } },
        { genres: { contains: q } },
      ],
    },
    take: limit,
    orderBy: { readCount: "desc" },
  });
  return rows.map(dbToBook);
}

export async function getBookComments(bookId: string) {
  return prisma.bookComment.findMany({ where: { bookId }, orderBy: { createdAt: "desc" } });
}

export async function getBookReports() {
  const rows = await prisma.bookReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { book: { select: { title: true, slug: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    bookId: r.bookId,
    bookTitle: r.book.title,
    bookSlug: r.book.slug,
    reason: r.reason,
    message: r.message ?? undefined,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getSaleInfo(bookId: string) {
  const row = await prisma.bookSaleInfo.findUnique({ where: { bookId } });
  if (!row) return undefined;
  return { ...row, adminObservations: JSON.parse(row.adminObservations || "[]") };
}

export async function getSaleInfoQueue() {
  const rows = await prisma.bookSaleInfo.findMany({
    orderBy: { createdAt: "desc" },
    include: { book: { select: { title: true, slug: true, authorName: true } } },
  });
  return rows.map((r) => ({ ...r, adminObservations: JSON.parse(r.adminObservations || "[]") }));
}

export async function getRightsDeclaration(bookId: string) {
  return prisma.rightsDeclaration.findUnique({ where: { bookId } });
}

export async function getBookCollections(userId: string) {
  const rows = await prisma.bookCollection.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  return rows.map((r) => ({ ...r, bookIds: parseJsonArray(r.bookIds) }));
}
