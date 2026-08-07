import "server-only";
import { prisma } from "./prisma";
import {
  Title,
  Row,
  Contributor,
  PendingSubmission,
  HomeSection as HomeSectionType,
  SiteSettings,
  Season,
  Report,
  EditSuggestion,
  Comment as CommentType,
  Notification as NotificationType,
  VoteCounts,
  ReactionCounts,
  ReactionEmoji,
  FranchiseDef,
  Tag,
  Playlist as PlaylistType,
  ForumThread,
  ForumReply,
  Profile,
} from "./types";
import type { Title as DbTitle } from "@/generated/prisma/client";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parsePlaybackEntries(
  value: string | null | undefined
): { id: string; languageId: string; serverName: string; playerLink: string }[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function dbToTitle(row: DbTitle): Title {
  const badges = parseJsonArray(row.badges) as Title["badges"];
  const customTags = parseJsonArray(row.customTags);
  const relatedSlugs = parseJsonArray(row.relatedSlugs);
  const cast = parseJsonArray(row.cast);
  const tags = parseJsonArray(row.tags);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    originalTitle: row.originalTitle ?? undefined,
    type: row.type as Title["type"],
    year: row.year,
    duration: row.duration ?? undefined,
    rating: row.rating,
    ageRating: row.ageRating ?? undefined,
    country: row.country ?? undefined,
    language: row.language ?? undefined,
    genres: parseJsonArray(row.genres),
    tags: tags.length ? tags : undefined,
    synopsis: row.synopsis,
    poster: row.poster,
    backdrop: row.backdrop,
    badges: badges && badges.length ? badges : undefined,
    customTags: customTags.length ? customTags : undefined,
    director: row.director ?? undefined,
    cast: cast.length ? cast : undefined,
    franchise: row.franchise ?? undefined,
    hasTrailer: row.hasTrailer,
    trailerUrl: row.trailerUrl ?? undefined,
    galleryCount: row.galleryCount ?? undefined,
    views: row.views,
    addedAt: row.addedAt ?? undefined,
    relatedSlugs: relatedSlugs.length ? relatedSlugs : undefined,
    source:
      row.sourceValue !== null && row.sourceValue !== undefined
        ? { kind: (row.sourceKind as "video" | "iframe") ?? "iframe", value: row.sourceValue }
        : undefined,
    playback: row.playback ? JSON.parse(row.playback) : undefined,
    featured: row.featured,
    featuredOrder: row.featuredOrder,
    uploaderName: row.uploaderName ?? undefined,
    trivia: parseJsonArray(row.trivia).length ? parseJsonArray(row.trivia) : undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    seoKeywords: parseJsonArray(row.seoKeywords).length ? parseJsonArray(row.seoKeywords) : undefined,
  };
}

export async function hasSecurityQuestions(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { securityQuestion1: true, securityQuestion2: true },
  });
  return Boolean(user?.securityQuestion1 && user?.securityQuestion2);
}

export async function getContributorUploads(name: string): Promise<number | undefined> {
  const contributor = await prisma.contributor.findFirst({ where: { name } });
  return contributor?.uploads;
}

export async function getContributorSummaryByName(
  name: string
): Promise<{ id: string; uploads: number } | undefined> {
  const contributor = await prisma.contributor.findFirst({ where: { name } });
  return contributor ? { id: contributor.id, uploads: contributor.uploads } : undefined;
}

export async function getContributorByName(name: string): Promise<Contributor | undefined> {
  const r = await prisma.contributor.findFirst({
    where: { name },
    include: { user: { select: { role: true, adminLevel: true } }, _count: { select: { followers: true } } },
  });
  return r ? dbToContributor(r) : undefined;
}

export async function getAllTitles(): Promise<Title[]> {
  const rows = await prisma.title.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbToTitle);
}

export async function getTitleBySlug(slug: string): Promise<Title | undefined> {
  const row = await prisma.title.findUnique({ where: { slug } });
  return row ? dbToTitle(row) : undefined;
}

export async function getFeaturedList(): Promise<Title[]> {
  const rows = await prisma.title.findMany({
    where: { status: "published", featured: true },
    orderBy: { featuredOrder: "asc" },
  });
  if (rows.length) return rows.map(dbToTitle);

  const fallback = await prisma.title.findFirst({
    where: { status: "published" },
    orderBy: { views: "desc" },
  });
  return fallback ? [dbToTitle(fallback)] : [];
}

export async function getFeatured(): Promise<Title | undefined> {
  const list = await getFeaturedList();
  return list[0];
}

export async function getRelated(item: Title): Promise<Title[]> {
  if (item.relatedSlugs?.length) {
    const rows = await prisma.title.findMany({
      where: { slug: { in: item.relatedSlugs }, status: "published" },
    });
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    return item.relatedSlugs
      .map((s) => bySlug.get(s))
      .filter((r): r is DbTitle => Boolean(r))
      .map(dbToTitle);
  }

  const all = await getAllTitles();
  return all
    .filter((t) => t.id !== item.id && t.genres.some((g) => item.genres.includes(g)))
    .slice(0, 6);
}

export async function getRows(): Promise<Row[]> {
  const all = await getAllTitles();
  const sections = await prisma.homeSection.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  const rows: Row[] = [];

  if (sections.length) {
    for (const s of sections) {
      let items: Title[] = [];
      if (s.type === "genre" && s.genre) {
        items = all.filter((t) => t.genres.includes(s.genre!)).slice(0, 10);
      } else if (s.type === "newest") {
        items = [...all]
          .sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""))
          .slice(0, 10);
      } else if (s.type === "similar" && s.baseTitleSlug) {
        const base = all.find((t) => t.slug === s.baseTitleSlug);
        if (base) {
          items = all
            .filter((t) => t.id !== base.id && t.genres.some((g) => base.genres.includes(g)))
            .slice(0, 10);
        }
      } else if (s.type === "franchise" && s.franchise) {
        items = all.filter((t) => t.franchise === s.franchise).slice(0, 10);
      } else {
        const slugs = parseJsonArray(s.titleSlugs);
        if (slugs.length) {
          const bySlug = new Map(all.map((t) => [t.slug, t]));
          items = slugs.map((sl) => bySlug.get(sl)).filter((t): t is Title => Boolean(t));
        } else if (s.title.toLowerCase().includes("tendencia")) {
          items = [...all].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 8);
        } else if (s.title.toLowerCase().includes("películ") || s.title.toLowerCase().includes("pelicul")) {
          items = all.filter((t) => t.type === "movie").slice(0, 6);
        } else if (s.title.toLowerCase().includes("serie")) {
          items = all.filter((t) => t.type === "series").slice(0, 6);
        }
      }
      if (items.length) rows.push({ id: s.id, title: s.title, items });
    }
  } else {
    const trending = [...all].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 8);
    const movies = all.filter((t) => t.type === "movie").slice(0, 6);
    const series = all.filter((t) => t.type === "series").slice(0, 6);
    rows.push(
      { id: "trending", title: "Tendencias esta semana", items: trending },
      { id: "movies", title: "Películas", items: movies },
      { id: "series", title: "Series", items: series }
    );
  }

  const featured = await getFeatured();
  if (featured) {
    const franchise = await getRelated(featured);
    if (franchise.length) {
      rows.push({ id: "franchise", title: `Más como ${featured.title}`, items: franchise });
    }
  }

  return rows;
}

function dbToContributor(
  r: {
    id: string;
    name: string;
    avatarSeed: string;
    avatarUrl: string | null;
    uploads: number;
    joinedAt: string;
    badge: string | null;
    bio: string | null;
    country: string | null;
    socialLink: string | null;
    userId: string | null;
    user?: { role: string; adminLevel?: string | null } | null;
    _count?: { followers: number };
  }
): Contributor {
  return {
    id: r.id,
    name: r.name,
    avatarSeed: r.avatarSeed,
    avatarUrl: r.avatarUrl ?? undefined,
    uploads: r.uploads,
    joinedAt: r.joinedAt,
    badge: (r.badge ?? undefined) as Contributor["badge"],
    bio: r.bio ?? undefined,
    country: r.country ?? undefined,
    socialLink: r.socialLink ?? undefined,
    isAdmin: r.user?.role === "admin",
    adminLevel: (r.user?.adminLevel ?? undefined) as Contributor["adminLevel"],
    userId: r.userId ?? undefined,
    followersCount: r._count?.followers,
  };
}

export async function getContributors(): Promise<Contributor[]> {
  const rows = await prisma.contributor.findMany({
    orderBy: { uploads: "desc" },
    include: { user: { select: { role: true, adminLevel: true } }, _count: { select: { followers: true } } },
  });
  return rows.map(dbToContributor);
}

export async function getContributorById(id: string): Promise<Contributor | undefined> {
  const r = await prisma.contributor.findUnique({
    where: { id },
    include: { user: { select: { role: true, adminLevel: true } }, _count: { select: { followers: true } } },
  });
  return r ? dbToContributor(r) : undefined;
}

export async function getContributorByUserId(userId: string): Promise<Contributor | undefined> {
  const r = await prisma.contributor.findUnique({
    where: { userId },
    include: { user: { select: { role: true, adminLevel: true } }, _count: { select: { followers: true } } },
  });
  return r ? dbToContributor(r) : undefined;
}

export async function getProfilesForUser(userId: string): Promise<Profile[]> {
  const rows = await prisma.profile.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    avatarSeed: r.avatarSeed,
    avatarUrl: r.avatarUrl ?? undefined,
    hasPin: Boolean(r.pinHash),
    isKids: r.isKids,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  const r = await prisma.profile.findUnique({ where: { id } });
  if (!r) return undefined;
  return {
    id: r.id,
    userId: r.userId,
    name: r.name,
    avatarSeed: r.avatarSeed,
    avatarUrl: r.avatarUrl ?? undefined,
    hasPin: Boolean(r.pinHash),
    isKids: r.isKids,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getFavoriteTitles(userId: string, profileId?: string | null): Promise<Title[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId, profileId: profileId ?? null },
    orderBy: { createdAt: "desc" },
    include: { title: true },
  });
  return rows.filter((r) => r.title.status === "published").map((r) => dbToTitle(r.title));
}

export async function isFavoriteTitle(
  userId: string | undefined | null,
  titleId: string,
  profileId?: string | null
): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.favorite.findFirst({ where: { userId, titleId, profileId: profileId ?? null } });
  return Boolean(row);
}

export async function getFollowersCount(contributorId: string): Promise<number> {
  return prisma.follow.count({ where: { contributorId } });
}

export async function isFollowingContributor(
  userId: string | undefined | null,
  contributorId: string
): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.follow.findUnique({
    where: { userId_contributorId: { userId, contributorId } },
  });
  return Boolean(row);
}

export interface FranchiseSummary {
  name: string;
  count: number;
  titles: Title[];
  logoUrl?: string;
}

export async function getFranchises(): Promise<FranchiseSummary[]> {
  const [all, defs] = await Promise.all([getAllTitles(), getFranchiseDefs()]);
  const logoByName = new Map(defs.map((f) => [f.name, f.logoUrl]));
  const map = new Map<string, Title[]>();
  for (const t of all) {
    if (!t.franchise) continue;
    const list = map.get(t.franchise) ?? [];
    list.push(t);
    map.set(t.franchise, list);
  }
  return Array.from(map.entries())
    .map(([name, titles]) => ({ name, count: titles.length, titles, logoUrl: logoByName.get(name) }))
    .sort((a, b) => b.count - a.count);
}

export async function getFranchiseDefs(): Promise<FranchiseDef[]> {
  const rows = await prisma.franchise.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({ id: r.id, name: r.name, logoUrl: r.logoUrl ?? undefined }));
}

export async function getFranchiseByName(name: string): Promise<FranchiseDef | undefined> {
  const r = await prisma.franchise.findUnique({ where: { name } });
  return r ? { id: r.id, name: r.name, logoUrl: r.logoUrl ?? undefined } : undefined;
}

export async function getTags(): Promise<Tag[]> {
  const rows = await prisma.tag.findMany({ orderBy: [{ order: "asc" }, { label: "asc" }] });
  return rows.map((r) => ({ id: r.id, label: r.label, color: r.color, order: r.order }));
}

export async function getTitlesByUploader(name: string): Promise<Title[]> {
  const rows = await prisma.title.findMany({
    where: { uploaderName: name, status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbToTitle);
}

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  const rows = await prisma.pendingSubmission.findMany({ orderBy: { submittedAt: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type as PendingSubmission["type"],
    playerLink: r.playerLink,
    description: r.description ?? undefined,
    posterUrl: r.posterUrl ?? undefined,
    backdropUrl: r.backdropUrl ?? undefined,
    seasonNumber: r.seasonNumber ?? undefined,
    episodeNumber: r.episodeNumber ?? undefined,
    episodeTitle: r.episodeTitle ?? undefined,
    director: r.director ?? undefined,
    cast: parseJsonArray(r.cast).length ? parseJsonArray(r.cast) : undefined,
    year: r.year ?? undefined,
    country: r.country ?? undefined,
    language: r.language ?? undefined,
    duration: r.duration ?? undefined,
    genres: parseJsonArray(r.genres).length ? parseJsonArray(r.genres) : undefined,
    franchise: r.franchise ?? undefined,
    previewConfirmed: r.previewConfirmed,
    playbackEntries: parsePlaybackEntries(r.playbackEntries),
    submittedBy: r.submittedBy,
    submittedAt: r.submittedAt.toISOString().slice(0, 10),
  }));
}

export async function getHomeSectionsRaw(): Promise<HomeSectionType[]> {
  const rows = await prisma.homeSection.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type as HomeSectionType["type"],
    genre: r.genre ?? undefined,
    baseTitleSlug: r.baseTitleSlug ?? undefined,
    franchise: r.franchise ?? undefined,
    titleSlugs: parseJsonArray(r.titleSlugs),
    order: r.order,
    active: r.active,
  }));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return {
    siteName: row?.siteName ?? "Butakia",
    paypalLink: row?.paypalLink ?? undefined,
    yapeNumber: row?.yapeNumber ?? undefined,
    yapeQrUrl: row?.yapeQrUrl ?? undefined,
    allowGuestPlayback: row?.allowGuestPlayback ?? true,
    requireApproval: row?.requireApproval ?? true,
    totalDonations: row?.totalDonations ?? 0,
    donationSharePercent: row?.donationSharePercent ?? 10,
    uploadGoal: row?.uploadGoal ?? 50,
    thankYouMessage:
      row?.thankYouMessage ??
      "¡Gracias por tu aporte a la comunidad! Sigue subiendo contenido para desbloquear más insignias.",
    premiumPriceMonthly: row?.premiumPriceMonthly ?? 4.99,
    premiumEnabled: row?.premiumEnabled ?? true,
    profilesPremiumOnly: row?.profilesPremiumOnly ?? false,
    maxProfilesFree: row?.maxProfilesFree ?? 4,
    accentColor: row?.accentColor ?? "#e50914",
    siteTagline: row?.siteTagline ?? "",
    librosTagline: row?.librosTagline ?? "Libros",
    librosHeroMessage: row?.librosHeroMessage ?? "",
    adsEnabled: row?.adsEnabled ?? true,
    donationsEnabled: row?.donationsEnabled ?? true,
    prerollEnabled: row?.prerollEnabled ?? true,
    pdfUploadEnabled: row?.pdfUploadEnabled ?? true,
    fakeVisitorsEnabled: row?.fakeVisitorsEnabled ?? false,
    fakeVisitorsMin: row?.fakeVisitorsMin ?? 20,
    fakeVisitorsMax: row?.fakeVisitorsMax ?? 50,
    logoUrl: row?.logoUrl ?? undefined,
    faviconUrl: row?.faviconUrl ?? undefined,
    siteDescription:
      row?.siteDescription ??
      "Butakia es la plataforma colaborativa para ver películas y series online gratis, en HD y en español latino.",
    secondaryColor: row?.secondaryColor ?? "#161616",
    bannerUrl: row?.bannerUrl ?? undefined,
    bannerLink: row?.bannerLink ?? undefined,
    bannerEnabled: row?.bannerEnabled ?? false,
    socialFacebook: row?.socialFacebook ?? undefined,
    socialInstagram: row?.socialInstagram ?? undefined,
    socialTwitter: row?.socialTwitter ?? undefined,
    socialYoutube: row?.socialYoutube ?? undefined,
    socialTiktok: row?.socialTiktok ?? undefined,
    socialWhatsapp: row?.socialWhatsapp ?? undefined,
    footerText: row?.footerText ?? undefined,
    contactEmail: row?.contactEmail ?? undefined,
    contactPhone: row?.contactPhone ?? undefined,
  };
}

export async function getSeasonsForTitle(titleId: string): Promise<Season[]> {
  const rows = await prisma.season.findMany({
    where: { titleId },
    orderBy: { number: "asc" },
    include: { episodes: { orderBy: { number: "asc" } } },
  });
  return rows.map((s) => ({
    id: s.id,
    number: s.number,
    name: s.name ?? undefined,
    episodes: s.episodes.map((e) => ({
      id: e.id,
      number: e.number,
      title: e.title,
      description: e.description ?? undefined,
      duration: e.duration ?? undefined,
      thumbnail: e.thumbnail ?? undefined,
      source:
        e.sourceValue !== null && e.sourceValue !== undefined
          ? { kind: (e.sourceKind as "video" | "iframe") ?? "iframe", value: e.sourceValue }
          : undefined,
    })),
  }));
}

export async function searchTitles(query: string): Promise<Title[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await prisma.title.findMany({
    where: {
      status: "published",
      OR: [
        { title: { contains: q } },
        { director: { contains: q } },
        { genres: { contains: q } },
        { cast: { contains: q } },
      ],
    },
    take: 8,
  });
  return rows.map(dbToTitle);
}

export async function getReports(): Promise<Report[]> {
  const rows = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { title: { select: { title: true, slug: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    titleId: r.titleId,
    titleName: r.title.title,
    titleSlug: r.title.slug,
    message: r.message ?? undefined,
    status: r.status as Report["status"],
    createdAt: r.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getOpenReportsCount(): Promise<number> {
  return prisma.report.count({ where: { status: "open" } });
}

export async function getEditSuggestions(): Promise<EditSuggestion[]> {
  const rows = await prisma.editSuggestion.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: { title: { select: { title: true, slug: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    titleId: r.titleId,
    titleName: r.title.title,
    titleSlug: r.title.slug,
    changes: JSON.parse(r.changes),
    submittedBy: r.submittedBy,
    status: r.status as EditSuggestion["status"],
    createdAt: r.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getPendingEditSuggestionsCount(): Promise<number> {
  return prisma.editSuggestion.count({ where: { status: "pending" } });
}

export async function getTotalUploadsCount(): Promise<number> {
  const result = await prisma.contributor.aggregate({ _sum: { uploads: true } });
  return result._sum.uploads ?? 0;
}

const NAME_COOLDOWN_DAYS = 30;

export async function getNameCooldownStatus(
  contributorId: string
): Promise<{ canChange: boolean; daysLeft: number }> {
  const row = await prisma.contributor.findUnique({
    where: { id: contributorId },
    select: { nameChangedAt: true },
  });
  if (!row?.nameChangedAt) return { canChange: true, daysLeft: 0 };

  const daysSince = (Date.now() - row.nameChangedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince >= NAME_COOLDOWN_DAYS) return { canChange: true, daysLeft: 0 };
  return { canChange: false, daysLeft: Math.ceil(NAME_COOLDOWN_DAYS - daysSince) };
}

// --- Votos (me gusta / no me gusta) ---

export async function getVoteCounts(titleId: string): Promise<VoteCounts> {
  const [likes, dislikes] = await Promise.all([
    prisma.vote.count({ where: { titleId, value: "like" } }),
    prisma.vote.count({ where: { titleId, value: "dislike" } }),
  ]);
  return { likes, dislikes };
}

export async function getUserVote(
  userId: string | undefined | null,
  titleId: string,
  profileId?: string | null
): Promise<"like" | "dislike" | null> {
  if (!userId) return null;
  const row = await prisma.vote.findFirst({ where: { userId, titleId, profileId: profileId ?? null } });
  return (row?.value as "like" | "dislike" | undefined) ?? null;
}

// --- Reacciones ---

const REACTION_EMOJIS: ReactionEmoji[] = ["like", "heart", "cry", "poop"];

export async function getReactionCounts(titleId: string): Promise<ReactionCounts> {
  const rows = await prisma.reaction.groupBy({
    by: ["emoji"],
    where: { titleId },
    _count: { emoji: true },
  });
  const counts = { like: 0, heart: 0, cry: 0, poop: 0 } as ReactionCounts;
  for (const r of rows) {
    if (REACTION_EMOJIS.includes(r.emoji as ReactionEmoji)) {
      counts[r.emoji as ReactionEmoji] = r._count.emoji;
    }
  }
  return counts;
}

export async function getUserReaction(
  userId: string | undefined | null,
  titleId: string,
  profileId?: string | null
): Promise<ReactionEmoji | null> {
  if (!userId) return null;
  const row = await prisma.reaction.findFirst({ where: { userId, titleId, profileId: profileId ?? null } });
  return (row?.emoji as ReactionEmoji | undefined) ?? null;
}

// --- Comentarios ---

export async function getComments(titleId: string): Promise<CommentType[]> {
  const rows = await prisma.comment.findMany({
    where: { titleId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    titleId: r.titleId,
    userId: r.userId,
    userName: r.userName,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
  }));
}

// --- Notificaciones ---

export async function getNotifications(userId: string): Promise<NotificationType[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    link: r.link ?? undefined,
    read: r.read,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

// --- Historial / continuar viendo ---

export async function getRecentlyViewed(
  userId: string,
  limit = 10,
  profileId?: string | null
): Promise<Title[]> {
  const rows = await prisma.watchHistory.findMany({
    where: { userId, profileId: profileId ?? null, title: { status: "published" } },
    orderBy: { viewedAt: "desc" },
    take: limit,
    include: { title: true },
  });
  return rows.map((r) => ({ ...dbToTitle(r.title), progressPercent: r.progressPercent }));
}

export async function recordWatchHistory(
  userId: string,
  titleId: string,
  profileId?: string | null,
  progressPercent?: number
): Promise<void> {
  const existing = await prisma.watchHistory.findFirst({
    where: { userId, titleId, profileId: profileId ?? null },
  });
  if (existing) {
    await prisma.watchHistory.update({
      where: { id: existing.id },
      data: {
        viewedAt: new Date(),
        ...(progressPercent !== undefined
          ? { progressPercent: Math.max(existing.progressPercent, progressPercent) }
          : {}),
      },
    });
  } else {
    await prisma.watchHistory.create({
      data: { userId, titleId, profileId: profileId ?? null, progressPercent: progressPercent ?? 0 },
    });
  }
}

// --- Pendientes por colaborador ---

export async function getPendingSubmissionsByName(name: string): Promise<PendingSubmission[]> {
  const rows = await prisma.pendingSubmission.findMany({
    where: { submittedBy: name },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type as PendingSubmission["type"],
    playerLink: r.playerLink,
    description: r.description ?? undefined,
    posterUrl: r.posterUrl ?? undefined,
    backdropUrl: r.backdropUrl ?? undefined,
    seasonNumber: r.seasonNumber ?? undefined,
    episodeNumber: r.episodeNumber ?? undefined,
    episodeTitle: r.episodeTitle ?? undefined,
    director: r.director ?? undefined,
    cast: parseJsonArray(r.cast).length ? parseJsonArray(r.cast) : undefined,
    year: r.year ?? undefined,
    country: r.country ?? undefined,
    language: r.language ?? undefined,
    duration: r.duration ?? undefined,
    genres: parseJsonArray(r.genres).length ? parseJsonArray(r.genres) : undefined,
    franchise: r.franchise ?? undefined,
    previewConfirmed: r.previewConfirmed,
    playbackEntries: parsePlaybackEntries(r.playbackEntries),
    submittedBy: r.submittedBy,
    submittedAt: r.submittedAt.toISOString().slice(0, 10),
  }));
}

// --- Playlists ---

export async function getPlaylistsByContributor(contributorId: string): Promise<PlaylistType[]> {
  const rows = await prisma.playlist.findMany({
    where: { contributorId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    contributorId: r.contributorId,
    name: r.name,
    description: r.description ?? undefined,
    titleIds: parseJsonArray(r.titleIds),
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getPlaylistsWithTitles(contributorId: string): Promise<PlaylistType[]> {
  const playlists = await getPlaylistsByContributor(contributorId);
  if (!playlists.length) return [];

  const allTitleIds = Array.from(new Set(playlists.flatMap((p) => p.titleIds)));
  const rows = await prisma.title.findMany({ where: { id: { in: allTitleIds } } });
  const byId = new Map(rows.map((r) => [r.id, dbToTitle(r)]));

  return playlists.map((p) => ({
    ...p,
    titles: p.titleIds.map((id) => byId.get(id)).filter((t): t is Title => Boolean(t)),
  }));
}

// --- Foro ---

export async function getPremiumRequests(): Promise<
  { id: string; userId: string; userName: string; method: string; note?: string; status: string; createdAt: string }[]
> {
  const rows = await prisma.premiumRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    method: r.method,
    note: r.note ?? undefined,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getForumThreads(section: string = "movies"): Promise<ForumThread[]> {
  const rows = await prisma.forumThread.findMany({
    where: { section },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { replies: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    authorName: r.authorName,
    authorId: r.authorId ?? undefined,
    section: r.section,
    category: r.category,
    pinned: r.pinned,
    createdAt: r.createdAt.toISOString(),
    replyCount: r._count.replies,
  }));
}

export async function getForumThread(id: string): Promise<ForumThread | undefined> {
  const r = await prisma.forumThread.findUnique({
    where: { id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
  });
  if (!r) return undefined;
  const replies: ForumReply[] = r.replies.map((rep) => ({
    id: rep.id,
    threadId: rep.threadId,
    body: rep.body,
    authorName: rep.authorName,
    authorId: rep.authorId ?? undefined,
    createdAt: rep.createdAt.toISOString(),
  }));
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    authorName: r.authorName,
    authorId: r.authorId ?? undefined,
    section: r.section,
    category: r.category,
    pinned: r.pinned,
    createdAt: r.createdAt.toISOString(),
    replyCount: replies.length,
    replies,
  };
}
