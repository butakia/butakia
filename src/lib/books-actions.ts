"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "./prisma";
import { getCurrentUser, getActiveProfile } from "./dal";
import { requireAdmin } from "./actions";
import { chunkRichTextIntoChapters } from "./richtextToChapters";
import { checkRateLimit } from "./rate-limit";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueBookSlug(base: string): Promise<string> {
  let slug = base || "libro";
  let n = 1;
  // Two authors publishing books with the same title is common — dedupe instead of crashing
  // on the unique constraint (unlike Title, which never had this problem in practice).
  while (await prisma.book.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function revalidateBooks() {
  revalidatePath("/libros");
  revalidatePath("/admin/libros");
}

export interface BookFormInput {
  title: string;
  subtitle?: string;
  authorName: string;
  publisher?: string;
  year?: number;
  language?: string;
  isbn?: string;
  synopsis: string;
  cover?: string;
  genres: string[];
  tags?: string[];
  categories?: string[];
  badges?: string[];
  contentType: "pdf" | "text" | "richtext";
  sourceKind: "pdf_upload" | "pasted_text" | "editor";
  pdfUrl?: string;
  pageCount?: number;
  rawText?: string; // used to build chapters when sourceKind = pasted_text
  rawHtml?: string; // used to build chapters when sourceKind = editor
  isFree?: boolean;
  featured?: boolean;
  featuredOrder?: number;
  status?: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  rightsBasis: "owner" | "public_domain" | "authorized";
  showUploader?: boolean;
}

const bookFormSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio.").max(200),
  subtitle: z.string().trim().max(200).optional(),
  authorName: z.string().trim().min(1, "El autor es obligatorio.").max(120),
  publisher: z.string().trim().max(120).optional(),
  year: z.number().int().min(0).max(9999).optional(),
  language: z.string().trim().max(60).optional(),
  isbn: z.string().trim().max(40).optional(),
  synopsis: z.string().trim().max(5000),
  cover: z.string().optional(),
  genres: z.array(z.string().trim().min(1)).max(20),
  tags: z.array(z.string().trim().min(1)).max(20).optional(),
  categories: z.array(z.string().trim().min(1)).max(20).optional(),
  badges: z.array(z.string().trim().min(1)).max(20).optional(),
  contentType: z.enum(["pdf", "text", "richtext"]),
  sourceKind: z.enum(["pdf_upload", "pasted_text", "editor"]),
  pdfUrl: z.string().optional(),
  pageCount: z.number().int().min(0).optional(),
  rawText: z.string().max(2_000_000).optional(),
  rawHtml: z.string().max(2_000_000).optional(),
  isFree: z.boolean().optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().optional(),
  status: z.enum(["draft", "published"]).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.array(z.string()).max(20).optional(),
  rightsBasis: z.enum(["owner", "public_domain", "authorized"]),
  showUploader: z.boolean().optional(),
});

const saleInfoSchema = z.object({
  priceUsd: z.number().positive().max(10_000),
  commercialDesc: z.string().max(2000).optional(),
  discountAllowed: z.boolean().optional(),
  promotionAllowed: z.boolean().optional(),
  phoneNumber: z.string().trim().min(6, "Ingresa un número de teléfono válido.").max(30),
});

const TARGET_CHARS_PER_PAGE = 1800;

function chunkTextIntoChapters(text: string): { order: number; content: string }[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chapters: { order: number; content: string }[] = [];
  let current = "";
  for (const para of paragraphs) {
    if (current.length + para.length > TARGET_CHARS_PER_PAGE && current) {
      chapters.push({ order: chapters.length, content: current });
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) chapters.push({ order: chapters.length, content: current });
  return chapters.length ? chapters : [{ order: 0, content: text }];
}

async function findOrCreateLiteraryAuthor(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  const existing = await prisma.literaryAuthor.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.literaryAuthor.create({ data: { slug, name: trimmed } });
}

async function createBookRecord(user: { id: string; name: string }, rawInput: BookFormInput, forceStatus?: "draft" | "published") {
  const input = bookFormSchema.parse(rawInput);
  const slug = await uniqueBookSlug(slugify(input.title));
  const contributor = await prisma.contributor.findUnique({ where: { userId: user.id } });
  const literaryAuthor = await findOrCreateLiteraryAuthor(input.authorName);

  const book = await prisma.book.create({
    data: {
      slug,
      title: input.title,
      subtitle: input.subtitle || null,
      authorName: input.authorName,
      authorId: contributor?.id ?? null,
      literaryAuthorId: literaryAuthor?.id ?? null,
      showUploader: input.showUploader ?? true,
      publisher: input.publisher || null,
      year: input.year ?? null,
      language: input.language || null,
      isbn: input.isbn || null,
      synopsis: input.synopsis,
      cover: input.cover || slug,
      genres: JSON.stringify(input.genres),
      tags: JSON.stringify(input.tags ?? []),
      categories: JSON.stringify(input.categories ?? []),
      badges: JSON.stringify(input.badges ?? []),
      contentType: input.contentType,
      sourceKind: input.sourceKind,
      pdfUrl: input.pdfUrl || null,
      pageCount: input.pageCount ?? null,
      status: forceStatus ?? input.status ?? "draft",
      isFree: input.isFree ?? true,
      featured: input.featured ?? false,
      featuredOrder: input.featuredOrder ?? 0,
      uploaderId: user.id,
      uploaderName: user.name,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      seoKeywords: JSON.stringify(input.seoKeywords ?? []),
    },
  });

  if (contributor) {
    await prisma.contributor.update({
      where: { id: contributor.id },
      data: { bookUploads: { increment: 1 } },
    });
  }

  if (input.sourceKind === "pasted_text" && input.rawText) {
    const chunks = chunkTextIntoChapters(input.rawText);
    await prisma.bookChapter.createMany({
      data: chunks.map((c) => ({ bookId: book.id, order: c.order, content: c.content })),
    });
    await prisma.book.update({ where: { id: book.id }, data: { pageCount: chunks.length } });
  } else if (input.sourceKind === "editor" && input.rawHtml) {
    const chunks = chunkRichTextIntoChapters(input.rawHtml);
    await prisma.bookChapter.createMany({
      data: chunks.map((c) => ({ bookId: book.id, order: c.order, content: c.content })),
    });
    await prisma.book.update({ where: { id: book.id }, data: { pageCount: chunks.length } });
  }

  const h = await headers();
  await prisma.rightsDeclaration.create({
    data: {
      bookId: book.id,
      basis: input.rightsBasis,
      userId: user.id,
      ipAddress: h.get("x-forwarded-for") ?? null,
    },
  });

  revalidateBooks();
  return book;
}

export async function createBookAction(input: BookFormInput) {
  const user = await requireAdmin();
  return createBookRecord(user, input);
}

// Any registered user can publish immediately — no admin approval gate, per spec.
export async function publishBookAction(input: BookFormInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para publicar.");
  return createBookRecord(user, input, "published");
}

export async function updateBookAction(slug: string, input: BookFormInput) {
  await requireAdmin();
  const existing = await prisma.book.findUnique({ where: { slug } });
  if (!existing) throw new Error("Libro no encontrado.");

  const literaryAuthor =
    input.authorName !== existing.authorName ? await findOrCreateLiteraryAuthor(input.authorName) : null;

  await prisma.book.update({
    where: { slug },
    data: {
      title: input.title,
      subtitle: input.subtitle || null,
      authorName: input.authorName,
      literaryAuthorId: literaryAuthor?.id ?? existing.literaryAuthorId,
      showUploader: input.showUploader ?? existing.showUploader,
      publisher: input.publisher || null,
      year: input.year ?? null,
      language: input.language || null,
      isbn: input.isbn || null,
      synopsis: input.synopsis,
      cover: input.cover || existing.cover,
      genres: JSON.stringify(input.genres),
      tags: JSON.stringify(input.tags ?? []),
      categories: JSON.stringify(input.categories ?? []),
      badges: JSON.stringify(input.badges ?? []),
      isFree: input.isFree ?? existing.isFree,
      featured: input.featured ?? existing.featured,
      featuredOrder: input.featuredOrder ?? existing.featuredOrder,
      status: input.status ?? existing.status,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      seoKeywords: JSON.stringify(input.seoKeywords ?? []),
    },
  });

  revalidateBooks();
  revalidatePath(`/libros/${slug}`);
}

export async function deleteBookAction(slug: string) {
  await requireAdmin();
  await prisma.book.delete({ where: { slug } });
  revalidateBooks();
}

export async function toggleBookFavoriteAction(bookId: string): Promise<{ favorited: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para guardar en tu lista.");
  const profile = await getActiveProfile();
  const profileId = profile?.id ?? null;

  const existing = await prisma.bookFavorite.findFirst({ where: { userId: user.id, bookId, profileId } });
  if (existing) {
    await prisma.bookFavorite.delete({ where: { id: existing.id } });
    revalidatePath("/libros");
    return { favorited: false };
  }

  await prisma.bookFavorite.create({ data: { userId: user.id, bookId, profileId } });
  revalidatePath("/libros");
  return { favorited: true };
}

export async function saveReadingProgressAction(bookId: string, page: number, percent: number) {
  const user = await getCurrentUser();
  if (!user) return;
  const profile = await getActiveProfile();
  const profileId = profile?.id ?? null;

  const existing = await prisma.readingProgress.findFirst({ where: { userId: user.id, bookId, profileId } });
  if (existing) {
    await prisma.readingProgress.update({
      where: { id: existing.id },
      data: { page, percent: Math.max(existing.percent, percent), lastReadAt: new Date() },
    });
  } else {
    await prisma.readingProgress.create({ data: { userId: user.id, bookId, profileId, page, percent } });
  }
}

export interface ReaderPreferenceInput {
  mode?: "flip" | "scroll";
  theme?: "dark" | "sepia" | "light";
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  textWidth?: "narrow" | "normal" | "wide";
  textAlign?: "left" | "justify";
  soundEnabled?: boolean;
}

export async function saveReaderPreferenceAction(prefs: ReaderPreferenceInput) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.readerPreference.upsert({
    where: { userId: user.id },
    update: prefs,
    create: { userId: user.id, ...prefs },
  });
}

// --- Reportes ---

export type BookReportReason = "not_author" | "copyright" | "illegal" | "spam" | "duplicate" | "offensive";

export async function createBookReportAction(bookId: string, reason: BookReportReason, message?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para reportar.");
  if (!(await checkRateLimit("book-report", 5, 60_000, user.id))) {
    throw new Error("Estás reportando demasiado rápido. Espera un momento.");
  }
  await prisma.bookReport.create({ data: { bookId, reason, message: message || null } });
}

export async function resolveBookReportAction(reportId: string) {
  await requireAdmin();
  await prisma.bookReport.update({ where: { id: reportId }, data: { status: "resolved" } });
  revalidatePath("/admin/libros-reportes");
}

export async function deleteBookReportAction(reportId: string) {
  await requireAdmin();
  await prisma.bookReport.delete({ where: { id: reportId } });
  revalidatePath("/admin/libros-reportes");
}

export async function unpublishBookAction(bookId: string) {
  await requireAdmin();
  await prisma.book.update({ where: { id: bookId }, data: { status: "unpublished" } });
  revalidateBooks();
}

// --- Marketplace ---

export interface SaleInfoInput {
  priceUsd: number;
  commercialDesc?: string;
  discountAllowed?: boolean;
  promotionAllowed?: boolean;
  phoneNumber: string;
}

export async function submitBookForSaleAction(bookId: string, rawInput: SaleInfoInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const input = saleInfoSchema.parse(rawInput);

  await prisma.book.update({ where: { id: bookId }, data: { isFree: false } });

  await prisma.bookSaleInfo.upsert({
    where: { bookId },
    update: {
      priceUsd: input.priceUsd,
      commercialDesc: input.commercialDesc || null,
      discountAllowed: input.discountAllowed ?? false,
      promotionAllowed: input.promotionAllowed ?? false,
      phoneNumber: input.phoneNumber,
      validationStatus: "pending",
    },
    create: {
      bookId,
      priceUsd: input.priceUsd,
      commercialDesc: input.commercialDesc || null,
      discountAllowed: input.discountAllowed ?? false,
      promotionAllowed: input.promotionAllowed ?? false,
      phoneNumber: input.phoneNumber,
    },
  });

  revalidateBooks();
}

const VALIDATION_STATUSES = ["pending", "in_review", "info_requested", "approved", "rejected", "suspended"] as const;
export type SaleValidationStatus = (typeof VALIDATION_STATUSES)[number];

export async function updateSaleValidationStatusAction(
  saleInfoId: string,
  status: SaleValidationStatus,
  note?: string
) {
  const admin = await requireAdmin();
  const saleInfo = await prisma.bookSaleInfo.findUnique({ where: { id: saleInfoId } });
  if (!saleInfo) throw new Error("Registro de venta no encontrado.");

  const observations: { id: string; note: string; adminName: string; createdAt: string }[] = JSON.parse(
    saleInfo.adminObservations || "[]"
  );
  if (note?.trim()) {
    observations.push({
      id: crypto.randomUUID(),
      note: note.trim(),
      adminName: admin.name,
      createdAt: new Date().toISOString(),
    });
  }

  await prisma.bookSaleInfo.update({
    where: { id: saleInfoId },
    data: { validationStatus: status, adminObservations: JSON.stringify(observations) },
  });
  revalidatePath("/admin/libros-ventas");
}

// Records a sale confirmed through an external/manual payment channel (no gateway integrated yet)
// and grants the buyer reading access. This is an admin bookkeeping action, not a live charge.
export async function recordManualSaleAction(bookId: string, buyerEmail: string, priceUsd: number) {
  await requireAdmin();
  const buyer = await prisma.user.findUnique({ where: { email: buyerEmail } });
  if (!buyer) throw new Error("No se encontró un usuario con ese correo.");

  await prisma.bookOrder.create({ data: { bookId, buyerId: buyer.id, priceUsd, status: "completed" } });
  await prisma.bookEntitlement.upsert({
    where: { userId_bookId: { userId: buyer.id, bookId } },
    update: {},
    create: { userId: buyer.id, bookId },
  });
  revalidatePath("/admin/libros-ventas");
}

export async function hasBookEntitlement(userId: string | undefined | null, bookId: string): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.bookEntitlement.findUnique({ where: { userId_bookId: { userId, bookId } } });
  return Boolean(row);
}

// --- Comentarios ---

export async function addBookCommentAction(bookId: string, message: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para comentar." };

  if (!(await checkRateLimit("book-comment", 8, 60_000, user.id))) {
    return { error: "Estás comentando demasiado rápido. Espera un momento e inténtalo de nuevo." };
  }

  const trimmed = message.trim();
  if (!trimmed) return { error: "Escribe algo antes de enviar." };
  if (trimmed.length > 1000) return { error: "El comentario es demasiado largo (máx. 1000 caracteres)." };

  await prisma.bookComment.create({ data: { bookId, userId: user.id, userName: user.name, message: trimmed } });
  revalidatePath(`/libros`);
  return {};
}

export async function deleteBookCommentAction(commentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");

  const comment = await prisma.bookComment.findUnique({ where: { id: commentId } });
  if (!comment) return;
  if (comment.userId !== user.id && user.role !== "admin") {
    throw new Error("No puedes eliminar el comentario de otro usuario.");
  }
  await prisma.bookComment.delete({ where: { id: commentId } });
}

// --- Colecciones ---

export async function createCollectionAction(name: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Ponle un nombre a la colección.");
  return prisma.bookCollection.create({ data: { userId: user.id, name: trimmed } });
}

export async function deleteCollectionAction(collectionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const collection = await prisma.bookCollection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== user.id) throw new Error("No autorizado.");
  await prisma.bookCollection.delete({ where: { id: collectionId } });
}

export async function toggleBookInCollectionAction(collectionId: string, bookId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const collection = await prisma.bookCollection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== user.id) throw new Error("No autorizado.");

  const current: string[] = JSON.parse(collection.bookIds || "[]");
  const next = current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId];
  await prisma.bookCollection.update({ where: { id: collectionId }, data: { bookIds: JSON.stringify(next) } });
  return { inCollection: next.includes(bookId) };
}

// --- Autores literarios (Kafka, etc.) — solo admin edita foto/bio ---

export async function updateLiteraryAuthorAction(
  id: string,
  data: { photoUrl?: string; bio?: string; verified?: boolean }
) {
  await requireAdmin();
  await prisma.literaryAuthor.update({
    where: { id },
    data: {
      photoUrl: data.photoUrl || null,
      bio: data.bio || null,
      ...(data.verified !== undefined ? { verified: data.verified } : {}),
    },
  });
  revalidatePath("/libros");
  revalidatePath("/libros/autor");
}

// --- Autor verificado: el propio usuario reclama y edita su perfil de autor ---

export async function claimAuthorProfileAction(displayName: string): Promise<{ error?: string; slug?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para reclamar un perfil de autor." };

  const existingForUser = await prisma.literaryAuthor.findUnique({ where: { userId: user.id } });
  if (existingForUser) return { error: "Ya tienes un perfil de autor reclamado.", slug: existingForUser.slug };

  const trimmed = displayName.trim();
  if (trimmed.length < 2) return { error: "Escribe el nombre con el que apareces como autor." };

  const slug = slugify(trimmed);
  const existing = await prisma.literaryAuthor.findUnique({ where: { slug } });

  if (existing) {
    if (existing.userId && existing.userId !== user.id) {
      return { error: "Ese nombre de autor ya fue reclamado por otra cuenta." };
    }
    await prisma.literaryAuthor.update({ where: { id: existing.id }, data: { userId: user.id } });
    revalidatePath(`/libros/autor/${slug}`);
    return { slug };
  }

  const created = await prisma.literaryAuthor.create({ data: { slug, name: trimmed, userId: user.id } });
  revalidatePath(`/libros/autor/${slug}`);
  return { slug: created.slug };
}

export async function updateMyAuthorProfileAction(data: {
  photoUrl?: string;
  bio?: string;
  trajectory?: string;
}): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const author = await prisma.literaryAuthor.findUnique({ where: { userId: user.id } });
  if (!author) return { error: "No tienes un perfil de autor reclamado todavía." };

  await prisma.literaryAuthor.update({
    where: { id: author.id },
    data: {
      photoUrl: data.photoUrl || null,
      bio: data.bio || null,
      trajectory: data.trajectory ?? "",
    },
  });
  revalidatePath(`/libros/autor/${author.slug}`);
  revalidatePath("/libros/mi-perfil-autor");
  return {};
}

// --- Subrayados (solo texto plano) ---

const highlightSchema = z.object({
  chapterId: z.string().min(1),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  text: z.string().min(1).max(5000),
  color: z.string().min(1).max(20).optional(),
  note: z.string().max(2000).optional(),
});

export async function createHighlightAction(bookId: string, rawInput: z.infer<typeof highlightSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para subrayar.");
  const input = highlightSchema.parse(rawInput);
  return prisma.bookHighlight.create({
    data: {
      userId: user.id,
      bookId,
      chapterId: input.chapterId,
      startOffset: input.startOffset,
      endOffset: input.endOffset,
      text: input.text,
      color: input.color || "#fde047",
      note: input.note?.trim() || null,
    },
  });
}

export async function deleteHighlightAction(highlightId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const highlight = await prisma.bookHighlight.findUnique({ where: { id: highlightId } });
  if (!highlight || highlight.userId !== user.id) throw new Error("No autorizado.");
  await prisma.bookHighlight.delete({ where: { id: highlightId } });
}

export async function updateHighlightNoteAction(highlightId: string, note: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const highlight = await prisma.bookHighlight.findUnique({ where: { id: highlightId } });
  if (!highlight || highlight.userId !== user.id) throw new Error("No autorizado.");
  const trimmed = note.trim().slice(0, 2000);
  await prisma.bookHighlight.update({ where: { id: highlightId }, data: { note: trimmed || null } });
  return { note: trimmed || null };
}
