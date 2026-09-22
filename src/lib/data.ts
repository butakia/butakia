import "server-only";
import { prisma } from "./prisma";
import {
  Contributor,
  SiteSettings,
  Tag,
  Notification as NotificationType,
  ForumThread,
  ForumReply,
  Profile,
} from "./types";

export async function hasSecurityQuestions(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { securityQuestion1: true, securityQuestion2: true },
  });
  return Boolean(user?.securityQuestion1 && user?.securityQuestion2);
}

export async function getContributorUploads(name: string): Promise<number | undefined> {
  const contributor = await prisma.contributor.findFirst({ where: { name } });
  return contributor?.bookUploads;
}

export async function getContributorSummaryByName(
  name: string
): Promise<{ id: string; uploads: number } | undefined> {
  const contributor = await prisma.contributor.findFirst({ where: { name } });
  return contributor ? { id: contributor.id, uploads: contributor.bookUploads } : undefined;
}

export async function getContributorByName(name: string): Promise<Contributor | undefined> {
  const r = await prisma.contributor.findFirst({
    where: { name },
    include: { user: { select: { role: true, adminLevel: true } }, _count: { select: { followers: true } } },
  });
  return r ? dbToContributor(r) : undefined;
}

function dbToContributor(
  r: {
    id: string;
    name: string;
    avatarSeed: string;
    avatarUrl: string | null;
    bookUploads: number;
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
    uploads: r.bookUploads,
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
    orderBy: { bookUploads: "desc" },
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

export async function getTags(): Promise<Tag[]> {
  const rows = await prisma.tag.findMany({ orderBy: [{ order: "asc" }, { label: "asc" }] });
  return rows.map((r) => ({ id: r.id, label: r.label, color: r.color, order: r.order }));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return {
    siteName: row?.siteName ?? "Butakia",
    paypalLink: row?.paypalLink ?? undefined,
    yapeNumber: row?.yapeNumber ?? undefined,
    yapeQrUrl: row?.yapeQrUrl ?? undefined,
    requireApproval: row?.requireApproval ?? true,
    totalDonations: row?.totalDonations ?? 0,
    donationSharePercent: row?.donationSharePercent ?? 10,
    uploadGoal: row?.uploadGoal ?? 50,
    thankYouMessage:
      row?.thankYouMessage ??
      "¡Gracias por tu aporte a la comunidad! Sigue subiendo libros para desbloquear más insignias.",
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
    pdfUploadEnabled: row?.pdfUploadEnabled ?? true,
    fakeVisitorsEnabled: row?.fakeVisitorsEnabled ?? false,
    fakeVisitorsMin: row?.fakeVisitorsMin ?? 20,
    fakeVisitorsMax: row?.fakeVisitorsMax ?? 50,
    logoUrl: row?.logoUrl ?? undefined,
    faviconUrl: row?.faviconUrl ?? undefined,
    siteDescription:
      row?.siteDescription ??
      "Butakia es la plataforma colaborativa para leer libros gratis online: novelas, cuentos, poesía y más.",
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

export async function getTotalUploadsCount(): Promise<number> {
  const result = await prisma.contributor.aggregate({ _sum: { bookUploads: true } });
  return result._sum.bookUploads ?? 0;
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

// --- Premium ---

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

// --- Foro ---

export async function getForumThreads(): Promise<ForumThread[]> {
  const rows = await prisma.forumThread.findMany({
    where: { section: "books" },
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
