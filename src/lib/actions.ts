"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getCurrentUser, getActiveProfile } from "./dal";
import { setActiveProfileInSession } from "./session";
import { getSiteSettings, recordWatchHistory } from "./data";
import { PLAYBACK_LANGUAGES } from "./playbackLanguages";
import { computeBadgeTier, BADGE_TIER_LABEL } from "./badges";
import { parseDurationToSeconds } from "./duration";
import { checkRateLimit } from "./rate-limit";

import { slugify } from "./slugify";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("No autorizado.");
  }
  return user;
}

export async function requireFullAdmin() {
  const user = await requireAdmin();
  if (user.adminLevel && user.adminLevel !== "full") {
    throw new Error("Esta acción requiere permisos de administrador total.");
  }
  return user;
}

async function createNotification(userId: string, message: string, link?: string) {
  await prisma.notification.create({ data: { userId, message, link: link || null } });
}

function buildPlaybackFromEntries(playbackEntriesJson: string | null | undefined): string | null {
  let entries: { languageId: string; serverName: string; playerLink: string }[] = [];
  try {
    entries = JSON.parse(playbackEntriesJson || "[]");
  } catch {
    entries = [];
  }
  const filled = entries.filter((e) => e.playerLink && e.playerLink.trim());
  if (!filled.length) return null;

  const grouped = new Map<string, { id: string; name: string; source: { kind: string; value: string } }[]>();
  for (const e of filled) {
    const list = grouped.get(e.languageId) ?? [];
    list.push({
      id: `${slugify(e.serverName || "servidor")}-${list.length}`,
      name: e.serverName?.trim() || "Servidor",
      source: { kind: "iframe", value: e.playerLink.trim() },
    });
    grouped.set(e.languageId, list);
  }

  const playback = Array.from(grouped.entries()).map(([languageId, servers]) => {
    const def = PLAYBACK_LANGUAGES.find((l) => l.id === languageId);
    return { id: languageId, label: def?.label ?? languageId, flag: def?.flag ?? "🌐", servers };
  });

  return JSON.stringify(playback);
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/contenido");
  revalidatePath("/admin/pendientes");
}

export interface TitleFormInput {
  title: string;
  type: "movie" | "series";
  year: number;
  duration?: string;
  rating: number;
  ageRating?: string;
  country?: string;
  language?: string;
  genres: string[];
  tags: string[];
  synopsis: string;
  director?: string;
  cast: string[];
  franchise?: string;
  playerLink?: string;
  badges: string[];
  customTags?: string[];
  featured?: boolean;
  featuredOrder?: number;
  poster?: string;
  backdrop?: string;
  trivia?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  trailerUrl?: string;
}

export async function createTitleAction(input: TitleFormInput) {
  await requireAdmin();
  const slug = slugify(input.title);
  const created = await prisma.title.create({
    data: {
      slug,
      title: input.title,
      type: input.type,
      year: input.year,
      duration: input.duration || null,
      rating: input.rating,
      ageRating: input.ageRating || null,
      country: input.country || null,
      language: input.language || null,
      genres: JSON.stringify(input.genres),
      tags: JSON.stringify(input.tags),
      synopsis: input.synopsis,
      poster: input.poster || slug,
      backdrop: input.backdrop || slug,
      director: input.director || null,
      cast: JSON.stringify(input.cast),
      franchise: input.franchise || null,
      badges: JSON.stringify(input.badges),
      customTags: JSON.stringify(input.customTags ?? []),
      sourceKind: input.playerLink ? "iframe" : null,
      sourceValue: input.playerLink || null,
      addedAt: new Date().toISOString().slice(0, 10),
      featured: input.featured ?? false,
      featuredOrder: input.featuredOrder ?? 0,
      trivia: JSON.stringify(input.trivia ?? []),
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      seoKeywords: JSON.stringify(input.seoKeywords ?? []),
      trailerUrl: input.trailerUrl || null,
      hasTrailer: Boolean(input.trailerUrl),
    },
  });
  revalidateCatalog();
  return { id: created.id, slug: created.slug };
}

export async function updateTitleAction(slug: string, input: TitleFormInput) {
  await requireAdmin();
  await prisma.title.update({
    where: { slug },
    data: {
      title: input.title,
      type: input.type,
      year: input.year,
      duration: input.duration || null,
      rating: input.rating,
      ageRating: input.ageRating || null,
      country: input.country || null,
      language: input.language || null,
      genres: JSON.stringify(input.genres),
      tags: JSON.stringify(input.tags),
      synopsis: input.synopsis,
      director: input.director || null,
      cast: JSON.stringify(input.cast),
      franchise: input.franchise || null,
      badges: JSON.stringify(input.badges),
      customTags: JSON.stringify(input.customTags ?? []),
      featured: input.featured ?? false,
      featuredOrder: input.featuredOrder ?? 0,
      trivia: JSON.stringify(input.trivia ?? []),
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      seoKeywords: JSON.stringify(input.seoKeywords ?? []),
      trailerUrl: input.trailerUrl || null,
      hasTrailer: Boolean(input.trailerUrl),
      ...(input.poster ? { poster: input.poster } : {}),
      ...(input.backdrop ? { backdrop: input.backdrop } : {}),
      ...(input.playerLink
        ? { sourceKind: "iframe", sourceValue: input.playerLink }
        : {}),
    },
  });
  revalidateCatalog();
  revalidatePath(`/titulo/${slug}`);
  revalidatePath(`/ver/${slug}`);
}

export async function deleteTitleAction(slug: string) {
  await requireAdmin();
  await prisma.title.delete({ where: { slug } });
  revalidateCatalog();
}

export async function addSeasonAction(titleId: string, number: number, name?: string) {
  await requireAdmin();
  await prisma.season.create({ data: { titleId, number, name: name || null } });
  revalidateCatalog();
}

export async function addEpisodeAction(
  seasonId: string,
  data: {
    number: number;
    title: string;
    playerLink?: string;
    duration?: string;
    description?: string;
    thumbnail?: string;
  }
) {
  await requireAdmin();
  await prisma.episode.create({
    data: {
      seasonId,
      number: data.number,
      title: data.title,
      description: data.description || null,
      duration: data.duration || null,
      thumbnail: data.thumbnail || null,
      sourceKind: data.playerLink ? "iframe" : null,
      sourceValue: data.playerLink || null,
    },
  });
  revalidateCatalog();
}

export async function updateEpisodeAction(
  episodeId: string,
  data: { title?: string; description?: string; thumbnail?: string; playerLink?: string; duration?: string }
) {
  await requireAdmin();
  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail || null } : {}),
      ...(data.duration !== undefined ? { duration: data.duration || null } : {}),
      ...(data.playerLink !== undefined
        ? { sourceKind: data.playerLink ? "iframe" : null, sourceValue: data.playerLink || null }
        : {}),
    },
  });
  revalidateCatalog();
}

export async function deleteEpisodeAction(episodeId: string) {
  await requireAdmin();
  await prisma.episode.delete({ where: { id: episodeId } });
  revalidateCatalog();
}

export async function approvePendingAction(id: string) {
  await requireAdmin();
  const item = await prisma.pendingSubmission.findUnique({ where: { id } });
  if (item) {
    const slug = slugify(item.title);
    const playback = buildPlaybackFromEntries(item.playbackEntries);
    const created = await prisma.title.create({
      data: {
        slug,
        title: item.title,
        type: item.type,
        year: item.year || new Date().getFullYear(),
        rating: 0,
        duration: item.duration || null,
        country: item.country || null,
        language: item.language || null,
        director: item.director || null,
        cast: item.cast,
        genres: item.genres,
        franchise: item.franchise || null,
        synopsis: item.description ?? "",
        poster: item.posterUrl || slug,
        backdrop: item.backdropUrl || slug,
        badges: JSON.stringify(["new"]),
        sourceKind: "iframe",
        sourceValue: item.playerLink,
        playback,
        addedAt: new Date().toISOString().slice(0, 10),
        uploaderName: item.submittedBy !== "Anónimo" ? item.submittedBy : null,
      },
    });

    if (item.submittedBy && item.submittedBy !== "Anónimo") {
      const contributor = await prisma.contributor.findFirst({
        where: { name: item.submittedBy },
      });
      if (contributor) {
        const updatedContributor = await prisma.contributor.update({
          where: { id: contributor.id },
          data: { uploads: { increment: 1 } },
        });

        const newTier = computeBadgeTier(updatedContributor.uploads);
        if (newTier && newTier !== updatedContributor.badge) {
          await prisma.contributor.update({
            where: { id: contributor.id },
            data: { badge: newTier },
          });
          if (contributor.userId) {
            await createNotification(
              contributor.userId,
              `¡Subiste de nivel! Ahora eres Colaborador ${BADGE_TIER_LABEL[newTier]} 🏆`,
              `/colaboradores/${contributor.id}`
            );
          }
        }

        if (contributor.userId) {
          const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
          const thankYou = settings?.thankYouMessage
            ? ` ${settings.thankYouMessage}`
            : "";
          await createNotification(
            contributor.userId,
            `Tu aporte "${item.title}" fue aprobado y ya está publicado en el catálogo.${thankYou}`,
            `/titulo/${slug}`
          );

          // Programa de referidos: si es el primer aporte aprobado de este usuario
          // y alguien lo invitó, recompensamos a quien lo invitó con Premium.
          if (updatedContributor.uploads === 1) {
            const referredUser = await prisma.user.findUnique({
              where: { id: contributor.userId },
              select: { referredById: true },
            });
            if (referredUser?.referredById) {
              const referrer = await prisma.user.update({
                where: { id: referredUser.referredById },
                data: { isPremium: true },
              });
              await createNotification(
                referrer.id,
                `¡Tu invitado subió su primer contenido! Ganaste Butakia Premium 🎉`,
                "/premium"
              );
            }
          }
        }
      }
    }

    if (item.type === "series") {
      const season = await prisma.season.create({
        data: { titleId: created.id, number: item.seasonNumber || 1 },
      });
      await prisma.episode.create({
        data: {
          seasonId: season.id,
          number: item.episodeNumber || 1,
          title: item.episodeTitle || "Episodio 1",
          sourceKind: "iframe",
          sourceValue: item.playerLink,
        },
      });
    }

    await prisma.pendingSubmission.delete({ where: { id } });
  }
  revalidateCatalog();
}

export async function rejectPendingAction(id: string) {
  await requireAdmin();
  const item = await prisma.pendingSubmission.findUnique({ where: { id } });
  if (item && item.submittedBy && item.submittedBy !== "Anónimo") {
    const contributor = await prisma.contributor.findFirst({ where: { name: item.submittedBy } });
    if (contributor?.userId) {
      await createNotification(
        contributor.userId,
        `Tu aporte "${item.title}" fue rechazado por el equipo de administración.`
      );
    }
  }
  await prisma.pendingSubmission.delete({ where: { id } });
  revalidateCatalog();
}

export interface SubmissionInput {
  title: string;
  type: "movie" | "series";
  playerLink: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  director?: string;
  cast?: string[];
  year?: number;
  country?: string;
  language?: string;
  duration?: string;
  genres?: string[];
  franchise?: string;
  previewConfirmed?: boolean;
  playbackEntries?: { id: string; languageId: string; serverName: string; playerLink: string }[];
}

export async function submitPendingAction(input: SubmissionInput): Promise<{ id: string }> {
  const user = await getCurrentUser();
  const created = await prisma.pendingSubmission.create({
    data: {
      title: input.title,
      type: input.type,
      playerLink: input.playerLink,
      description: input.description || null,
      posterUrl: input.posterUrl || null,
      backdropUrl: input.backdropUrl || null,
      seasonNumber: input.seasonNumber || null,
      episodeNumber: input.episodeNumber || null,
      episodeTitle: input.episodeTitle || null,
      director: input.director || null,
      cast: JSON.stringify(input.cast ?? []),
      year: input.year || null,
      country: input.country || null,
      language: input.language || null,
      duration: input.duration || null,
      genres: JSON.stringify(input.genres ?? []),
      franchise: input.franchise || null,
      previewConfirmed: input.previewConfirmed ?? false,
      playbackEntries: JSON.stringify(input.playbackEntries ?? []),
      submittedBy: user?.name || "Anónimo",
    },
  });
  revalidateCatalog();
  return { id: created.id };
}

export interface SectionInput {
  title: string;
  type: "manual" | "genre" | "newest" | "similar" | "franchise";
  genre?: string;
  baseTitleSlug?: string;
  franchise?: string;
  titleSlugs?: string[];
  order: number;
  active: boolean;
}

export async function createSectionAction(input: SectionInput) {
  await requireFullAdmin();
  await prisma.homeSection.create({
    data: {
      title: input.title,
      type: input.type,
      genre: input.genre || null,
      baseTitleSlug: input.baseTitleSlug || null,
      franchise: input.franchise || null,
      titleSlugs: JSON.stringify(input.titleSlugs ?? []),
      order: input.order,
      active: input.active,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/secciones");
}

export async function updateSectionAction(id: string, input: SectionInput) {
  await requireFullAdmin();
  await prisma.homeSection.update({
    where: { id },
    data: {
      title: input.title,
      type: input.type,
      genre: input.genre || null,
      baseTitleSlug: input.baseTitleSlug || null,
      franchise: input.franchise || null,
      titleSlugs: JSON.stringify(input.titleSlugs ?? []),
      order: input.order,
      active: input.active,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/secciones");
}

export async function deleteSectionAction(id: string) {
  await requireFullAdmin();
  await prisma.homeSection.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/secciones");
}

export interface SiteSettingsInput {
  siteName: string;
  paypalLink?: string;
  yapeNumber?: string;
  yapeQrUrl?: string;
  allowGuestPlayback: boolean;
  requireApproval: boolean;
  totalDonations: number;
  donationSharePercent: number;
  uploadGoal: number;
  thankYouMessage: string;
  premiumPriceMonthly: number;
  premiumEnabled: boolean;
  profilesPremiumOnly: boolean;
  maxProfilesFree: number;
  accentColor: string;
  siteTagline: string;
  librosTagline: string;
  librosHeroMessage: string;
  adsEnabled: boolean;
  donationsEnabled: boolean;
  prerollEnabled: boolean;
  pdfUploadEnabled: boolean;
  fakeVisitorsEnabled: boolean;
  fakeVisitorsMin: number;
  fakeVisitorsMax: number;
  logoUrl?: string;
  faviconUrl?: string;
  siteDescription: string;
  secondaryColor: string;
  bannerUrl?: string;
  bannerLink?: string;
  bannerEnabled: boolean;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  socialWhatsapp?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export async function updateSiteSettingsAction(input: SiteSettingsInput) {
  await requireFullAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...input },
    update: input,
  });
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
}

export async function createReportAction(titleId: string, message?: string) {
  if (!(await checkRateLimit("report", 5, 60_000))) return;
  await prisma.report.create({
    data: { titleId, message: message || null },
  });
  revalidatePath("/admin/reportes");
}

export async function resolveReportAction(id: string) {
  await requireAdmin();
  await prisma.report.update({ where: { id }, data: { status: "resolved" } });
  revalidatePath("/admin/reportes");
}

export async function deleteReportAction(id: string) {
  await requireAdmin();
  await prisma.report.delete({ where: { id } });
  revalidatePath("/admin/reportes");
}

// --- Perfil de colaborador ---

export interface ProfileInput {
  name?: string;
  bio?: string;
  country?: string;
  socialLink?: string;
  avatarUrl?: string;
}

const NAME_COOLDOWN_DAYS = 30;

export async function updateProfileAction(input: ProfileInput): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const contributor = await prisma.contributor.findUnique({ where: { userId: user.id } });
  if (!contributor) return { error: "No se encontró tu perfil de colaborador." };

  const data: {
    bio?: string | null;
    country?: string | null;
    socialLink?: string | null;
    avatarUrl?: string | null;
    name?: string;
    nameChangedAt?: Date;
  } = {
    bio: input.bio?.trim() || null,
    country: input.country?.trim() || null,
    socialLink: input.socialLink?.trim() || null,
    avatarUrl: input.avatarUrl?.trim() || null,
  };

  if (input.name && input.name.trim() && input.name.trim() !== contributor.name) {
    if (contributor.nameChangedAt) {
      const daysSince =
        (Date.now() - contributor.nameChangedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < NAME_COOLDOWN_DAYS) {
        const daysLeft = Math.ceil(NAME_COOLDOWN_DAYS - daysSince);
        return { error: `Solo puedes cambiar tu nombre cada 30 días. Espera ${daysLeft} día(s) más.` };
      }
    }
    data.name = input.name.trim();
    data.nameChangedAt = new Date();
  }

  await prisma.$transaction(async (tx) => {
    await tx.contributor.update({ where: { id: contributor.id }, data });
    if (data.name) {
      await tx.title.updateMany({
        where: { uploaderName: contributor.name },
        data: { uploaderName: data.name },
      });
      await tx.pendingSubmission.updateMany({
        where: { submittedBy: contributor.name },
        data: { submittedBy: data.name },
      });
      await tx.user.update({ where: { id: user.id }, data: { name: data.name } });
    }
  });

  revalidateCatalog();
  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${contributor.id}`);
  return {};
}

export async function promoteToAdminAction(userId: string, level: "full" | "partial" = "partial") {
  await requireFullAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role: "admin", adminLevel: level } });
  await createNotification(
    userId,
    `¡Felicidades! Ahora eres administrador ${level === "full" ? "total" : "parcial"} de Butakia.`,
    "/admin"
  );
  revalidatePath("/admin/colaboradores");
}

export async function demoteFromAdminAction(userId: string) {
  await requireFullAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role: "user", adminLevel: null } });
  revalidatePath("/admin/colaboradores");
}

const BADGE_LABEL_ES: Record<string, string> = { gold: "Oro", silver: "Plata", bronze: "Cobre" };

export async function setContributorBadgeAction(
  contributorId: string,
  badge: "gold" | "silver" | "bronze" | null
) {
  await requireFullAdmin();
  const contributor = await prisma.contributor.update({
    where: { id: contributorId },
    data: { badge },
  });
  if (contributor.userId && badge) {
    await createNotification(
      contributor.userId,
      `¡Felicidades! Se te asignó la insignia de Colaborador ${BADGE_LABEL_ES[badge]}.`,
      `/colaboradores/${contributorId}`
    );
  }
  revalidatePath("/admin/colaboradores");
  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${contributorId}`);
}

// --- Seguidores ---

export async function toggleFollowAction(contributorId: string): Promise<{ following: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para seguir a un colaborador.");

  const existing = await prisma.follow.findUnique({
    where: { userId_contributorId: { userId: user.id, contributorId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    revalidatePath(`/colaboradores/${contributorId}`);
    return { following: false };
  }

  await prisma.follow.create({ data: { userId: user.id, contributorId } });
  revalidatePath(`/colaboradores/${contributorId}`);
  return { following: true };
}

// --- Sugerencias de edición ---

export interface EditSuggestionInput {
  synopsis?: string;
  director?: string;
  cast?: string[];
  genres?: string[];
  playerLink?: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export async function submitEditSuggestionAction(titleId: string, changes: EditSuggestionInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para sugerir cambios.");

  await prisma.editSuggestion.create({
    data: {
      titleId,
      changes: JSON.stringify(changes),
      submittedBy: user.name,
    },
  });
  revalidatePath("/admin/ediciones");
}

export async function approveEditSuggestionAction(id: string) {
  await requireAdmin();
  const suggestion = await prisma.editSuggestion.findUnique({
    where: { id },
    include: { title: { select: { title: true, slug: true } } },
  });
  if (!suggestion) return;

  const changes = JSON.parse(suggestion.changes) as EditSuggestionInput;
  await prisma.title.update({
    where: { id: suggestion.titleId },
    data: {
      ...(changes.synopsis !== undefined ? { synopsis: changes.synopsis } : {}),
      ...(changes.director !== undefined ? { director: changes.director } : {}),
      ...(changes.cast !== undefined ? { cast: JSON.stringify(changes.cast) } : {}),
      ...(changes.genres !== undefined ? { genres: JSON.stringify(changes.genres) } : {}),
      ...(changes.playerLink !== undefined
        ? { sourceKind: "iframe", sourceValue: changes.playerLink }
        : {}),
      ...(changes.posterUrl !== undefined ? { poster: changes.posterUrl } : {}),
      ...(changes.backdropUrl !== undefined ? { backdrop: changes.backdropUrl } : {}),
    },
  });
  await prisma.editSuggestion.update({ where: { id }, data: { status: "approved" } });

  const submitter = await prisma.user.findFirst({ where: { name: suggestion.submittedBy } });
  if (submitter) {
    await createNotification(
      submitter.id,
      `Tu sugerencia de edición para "${suggestion.title.title}" fue aprobada.`,
      `/titulo/${suggestion.title.slug}`
    );
  }

  revalidateCatalog();
  revalidatePath("/admin/ediciones");
}

export async function rejectEditSuggestionAction(id: string) {
  await requireAdmin();
  const suggestion = await prisma.editSuggestion.update({
    where: { id },
    data: { status: "rejected" },
    include: { title: { select: { title: true, slug: true } } },
  });

  const submitter = await prisma.user.findFirst({ where: { name: suggestion.submittedBy } });
  if (submitter) {
    await createNotification(
      submitter.id,
      `Tu sugerencia de edición para "${suggestion.title.title}" fue rechazada.`,
      `/titulo/${suggestion.title.slug}`
    );
  }

  revalidatePath("/admin/ediciones");
}

// --- Mi lista (favoritos) ---

export async function toggleFavoriteAction(titleId: string): Promise<{ favorited: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para guardar en tu lista.");
  const profile = await getActiveProfile();
  const profileId = profile?.id ?? null;

  const existing = await prisma.favorite.findFirst({
    where: { userId: user.id, titleId, profileId },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/mi-lista");
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId: user.id, titleId, profileId } });
  revalidatePath("/mi-lista");
  return { favorited: true };
}

// --- Votos (me gusta / no me gusta) ---

export async function voteAction(
  titleId: string,
  value: "like" | "dislike"
): Promise<{ vote: "like" | "dislike" | null }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para votar.");
  const profile = await getActiveProfile();
  const profileId = profile?.id ?? null;

  const existing = await prisma.vote.findFirst({
    where: { userId: user.id, titleId, profileId },
  });

  if (existing && existing.value === value) {
    await prisma.vote.delete({ where: { id: existing.id } });
    return { vote: null };
  }

  if (existing) {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.vote.create({ data: { userId: user.id, titleId, profileId, value } });
  }
  return { vote: value };
}

export async function reactionAction(
  titleId: string,
  emoji: "like" | "heart" | "cry" | "poop"
): Promise<{ reaction: "like" | "heart" | "cry" | "poop" | null }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para reaccionar.");
  const profile = await getActiveProfile();
  const profileId = profile?.id ?? null;

  const existing = await prisma.reaction.findFirst({
    where: { userId: user.id, titleId, profileId },
  });

  if (existing && existing.emoji === emoji) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return { reaction: null };
  }

  if (existing) {
    await prisma.reaction.update({ where: { id: existing.id }, data: { emoji } });
  } else {
    await prisma.reaction.create({ data: { userId: user.id, titleId, profileId, emoji } });
  }
  return { reaction: emoji };
}

// --- Comentarios ---

export async function addCommentAction(titleId: string, message: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para comentar." };

  if (!(await checkRateLimit("comment", 8, 60_000, user.id))) {
    return { error: "Estás comentando demasiado rápido. Espera un momento e inténtalo de nuevo." };
  }

  const trimmed = message.trim();
  if (!trimmed) return { error: "Escribe algo antes de enviar." };
  if (trimmed.length > 1000) return { error: "El comentario es demasiado largo (máx. 1000 caracteres)." };

  await prisma.comment.create({
    data: { titleId, userId: user.id, userName: user.name, message: trimmed },
  });
  return {};
}

export async function deleteCommentAction(commentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;
  if (comment.userId !== user.id && user.role !== "admin") {
    throw new Error("No puedes eliminar el comentario de otro usuario.");
  }

  await prisma.comment.delete({ where: { id: commentId } });
}

// --- Notificaciones ---

export async function markNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/");
}

// --- Franquicias ---

export async function createFranchiseAction(name: string, logoUrl?: string) {
  await requireFullAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("El nombre de la franquicia es obligatorio.");
  await prisma.franchise.create({ data: { name: trimmed, logoUrl: logoUrl || null } });
  revalidatePath("/admin/franquicias");
  revalidatePath("/franquicias");
}

export async function updateFranchiseLogoAction(id: string, logoUrl: string | null) {
  await requireFullAdmin();
  await prisma.franchise.update({ where: { id }, data: { logoUrl } });
  revalidatePath("/admin/franquicias");
  revalidatePath("/franquicias");
}

// --- Foro ---

const FORUM_CATEGORIES_BY_SECTION: Record<string, readonly string[]> = {
  movies: ["general", "ayuda", "sugerencias", "peliculas"],
  books: ["general", "recomendaciones", "autores", "ayuda-lectura", "debate"],
};

export async function createForumThreadAction(
  title: string,
  body: string,
  category: string,
  section: string = "movies"
): Promise<{ error?: string; id?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para crear un tema." };
  if (!(await checkRateLimit("forum-thread", 5, 60_000, user.id))) {
    return { error: "Estás publicando demasiado rápido. Espera un momento." };
  }

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  if (!trimmedTitle || !trimmedBody) return { error: "Completa el título y el mensaje." };
  if (trimmedTitle.length > 150) return { error: "El título es demasiado largo (máx. 150 caracteres)." };
  if (trimmedBody.length > 3000) return { error: "El mensaje es demasiado largo (máx. 3000 caracteres)." };

  const finalSection = section === "books" ? "books" : "movies";
  const validCategories = FORUM_CATEGORIES_BY_SECTION[finalSection];
  const finalCategory = validCategories.includes(category) ? category : "general";

  const thread = await prisma.forumThread.create({
    data: {
      title: trimmedTitle,
      body: trimmedBody,
      category: finalCategory,
      section: finalSection,
      authorName: user.name,
      authorId: user.id,
    },
  });
  revalidatePath(finalSection === "books" ? "/libros/foro" : "/foro");
  return { id: thread.id };
}

export async function addForumReplyAction(
  threadId: string,
  body: string
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para responder." };
  if (!(await checkRateLimit("forum-reply", 10, 60_000, user.id))) {
    return { error: "Estás respondiendo demasiado rápido. Espera un momento." };
  }

  const trimmed = body.trim();
  if (!trimmed) return { error: "Escribe algo antes de enviar." };
  if (trimmed.length > 3000) return { error: "La respuesta es demasiado larga (máx. 3000 caracteres)." };

  await prisma.forumReply.create({
    data: { threadId, body: trimmed, authorName: user.name, authorId: user.id },
  });
  revalidatePath(`/foro/${threadId}`);
  revalidatePath(`/libros/foro/${threadId}`);
  return {};
}

export async function deleteForumThreadAction(threadId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
  if (!thread) return;
  if (thread.authorId !== user.id && user.role !== "admin") {
    throw new Error("No puedes eliminar el tema de otro usuario.");
  }
  await prisma.forumThread.delete({ where: { id: threadId } });
  revalidatePath(thread.section === "books" ? "/libros/foro" : "/foro");
}

export async function deleteForumReplyAction(replyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const reply = await prisma.forumReply.findUnique({ where: { id: replyId } });
  if (!reply) return;
  if (reply.authorId !== user.id && user.role !== "admin") {
    throw new Error("No puedes eliminar la respuesta de otro usuario.");
  }
  await prisma.forumReply.delete({ where: { id: reply.id } });
  revalidatePath(`/foro/${reply.threadId}`);
  revalidatePath(`/libros/foro/${reply.threadId}`);
}

export async function togglePinForumThreadAction(threadId: string) {
  await requireAdmin();
  const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
  if (!thread) return;
  await prisma.forumThread.update({ where: { id: threadId }, data: { pinned: !thread.pinned } });
  revalidatePath(thread.section === "books" ? "/libros/foro" : "/foro");
}

// --- Premium ---

export async function createPremiumRequestAction(
  method: "paypal" | "yape",
  note?: string
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para solicitar Premium." };
  if (user.isPremium) return { error: "Ya tienes Butakia Premium activo." };

  const existing = await prisma.premiumRequest.findFirst({
    where: { userId: user.id, status: "pending" },
  });
  if (existing) return { error: "Ya tienes una solicitud pendiente de revisión." };

  await prisma.premiumRequest.create({
    data: { userId: user.id, method, note: note?.trim() || null },
  });
  revalidatePath("/admin/premium");
  return {};
}

export async function approvePremiumRequestAction(requestId: string) {
  await requireAdmin();
  const request = await prisma.premiumRequest.findUnique({ where: { id: requestId } });
  if (!request) return;

  await prisma.$transaction([
    prisma.premiumRequest.update({ where: { id: requestId }, data: { status: "approved" } }),
    prisma.user.update({ where: { id: request.userId }, data: { isPremium: true } }),
  ]);
  await createNotification(
    request.userId,
    "¡Tu cuenta ahora es Butakia Premium! Disfruta sin anuncios y con acceso anticipado.",
    "/premium"
  );
  revalidatePath("/admin/premium");
}

export async function rejectPremiumRequestAction(requestId: string) {
  await requireAdmin();
  const request = await prisma.premiumRequest.findUnique({ where: { id: requestId } });
  if (!request) return;
  await prisma.premiumRequest.update({ where: { id: requestId }, data: { status: "rejected" } });
  await createNotification(
    request.userId,
    "No pudimos confirmar tu pago de Butakia Premium. Contáctanos si crees que es un error.",
    "/premium"
  );
  revalidatePath("/admin/premium");
}

export async function deleteFranchiseAction(id: string) {
  await requireFullAdmin();
  await prisma.franchise.delete({ where: { id } });
  revalidatePath("/admin/franquicias");
  revalidatePath("/franquicias");
}

// --- Etiquetas (tags) ---

export async function createTagAction(label: string, color: string) {
  await requireFullAdmin();
  const trimmed = label.trim().toUpperCase();
  if (!trimmed) throw new Error("El nombre de la etiqueta es obligatorio.");
  const count = await prisma.tag.count();
  await prisma.tag.create({ data: { label: trimmed, color: color || "#e50914", order: count } });
  revalidatePath("/admin/etiquetas");
  revalidatePath("/admin/contenido");
  revalidatePath("/admin/libros");
}

export async function updateTagAction(id: string, data: { label?: string; color?: string }) {
  await requireFullAdmin();
  const payload: { label?: string; color?: string } = {};
  if (data.label !== undefined) {
    const trimmed = data.label.trim().toUpperCase();
    if (!trimmed) throw new Error("El nombre de la etiqueta es obligatorio.");
    payload.label = trimmed;
  }
  if (data.color !== undefined) payload.color = data.color;
  await prisma.tag.update({ where: { id }, data: payload });
  revalidatePath("/admin/etiquetas");
}

export async function deleteTagAction(id: string) {
  await requireFullAdmin();
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/etiquetas");
}

// --- Playlists de colaborador ---

export interface PlaylistInput {
  name: string;
  description?: string;
  titleIds: string[];
}

async function requireOwnContributor() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const contributor = await prisma.contributor.findUnique({ where: { userId: user.id } });
  if (!contributor) throw new Error("No se encontró tu perfil de colaborador.");
  return contributor;
}

export async function createPlaylistAction(input: PlaylistInput) {
  const contributor = await requireOwnContributor();
  if (!input.name.trim()) throw new Error("La lista necesita un nombre.");

  await prisma.playlist.create({
    data: {
      contributorId: contributor.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      titleIds: JSON.stringify(input.titleIds),
    },
  });
  revalidatePath(`/colaboradores/${contributor.id}`);
  revalidatePath("/panel");
}

export async function updatePlaylistAction(playlistId: string, input: PlaylistInput) {
  const contributor = await requireOwnContributor();
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.contributorId !== contributor.id) {
    throw new Error("No puedes editar esta lista.");
  }

  await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      titleIds: JSON.stringify(input.titleIds),
    },
  });
  revalidatePath(`/colaboradores/${contributor.id}`);
  revalidatePath("/panel");
}

export async function deletePlaylistAction(playlistId: string) {
  const contributor = await requireOwnContributor();
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.contributorId !== contributor.id) {
    throw new Error("No puedes eliminar esta lista.");
  }

  await prisma.playlist.delete({ where: { id: playlistId } });
  revalidatePath(`/colaboradores/${contributor.id}`);
  revalidatePath("/panel");
}

// --- Perfiles ---

const PIN_REGEX = /^\d{4}$/;

export async function createProfileAction(
  name: string,
  avatarSeed: string,
  pin?: string,
  isKids?: boolean
): Promise<{ error?: string; id?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 30) {
    return { error: "El nombre debe tener entre 1 y 30 caracteres." };
  }
  if (pin && !PIN_REGEX.test(pin)) {
    return { error: "El PIN debe tener exactamente 4 dígitos." };
  }

  const [existing, settings] = await Promise.all([
    prisma.profile.findMany({ where: { userId: user.id } }),
    getSiteSettings(),
  ]);

  const limit = settings.profilesPremiumOnly && !user.isPremium ? 1 : settings.maxProfilesFree;
  if (existing.length >= limit) {
    return {
      error:
        settings.profilesPremiumOnly && !user.isPremium
          ? "Necesitas Butakia Premium para crear más de un perfil."
          : `Ya alcanzaste el máximo de ${limit} perfiles.`,
    };
  }

  const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
  const profile = await prisma.profile.create({
    data: { userId: user.id, name: trimmed, avatarSeed, pinHash, isKids: Boolean(isKids) },
  });
  revalidatePath("/perfiles");
  return { id: profile.id };
}

export async function updateViewerProfileAction(
  profileId: string,
  input: { name?: string; avatarSeed?: string; isKids?: boolean }
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== user.id) return { error: "Perfil no encontrado." };

  const name = input.name?.trim();
  if (name !== undefined && (name.length < 1 || name.length > 30)) {
    return { error: "El nombre debe tener entre 1 y 30 caracteres." };
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      ...(name ? { name } : {}),
      ...(input.avatarSeed ? { avatarSeed: input.avatarSeed } : {}),
      ...(input.isKids !== undefined ? { isKids: input.isKids } : {}),
    },
  });
  revalidatePath("/perfiles");
  return {};
}

export async function setProfilePinAction(
  profileId: string,
  pin: string | null
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== user.id) return { error: "Perfil no encontrado." };

  if (pin && !PIN_REGEX.test(pin)) {
    return { error: "El PIN debe tener exactamente 4 dígitos." };
  }

  const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
  await prisma.profile.update({ where: { id: profileId }, data: { pinHash } });
  revalidatePath("/perfiles");
  return {};
}

export async function deleteProfileAction(profileId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== user.id) return { error: "Perfil no encontrado." };

  const count = await prisma.profile.count({ where: { userId: user.id } });
  if (count <= 1) return { error: "Debes tener al menos un perfil." };

  await prisma.profile.delete({ where: { id: profileId } });

  const active = await getActiveProfile();
  if (active?.id === profileId) {
    await setActiveProfileInSession(user.id, user.role as "user" | "admin", null);
  }
  revalidatePath("/perfiles");
  return {};
}

export async function selectProfileAction(
  profileId: string,
  pin?: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.userId !== user.id) return { error: "Perfil no encontrado." };

  if (profile.pinHash) {
    if (!pin) return { error: "Este perfil requiere un PIN." };
    const valid = await bcrypt.compare(pin, profile.pinHash);
    if (!valid) return { error: "PIN incorrecto." };
  }

  await setActiveProfileInSession(user.id, user.role as "user" | "admin", profileId);
  // No usamos redirect() aquí a propósito: el caché de rutas del cliente (Router Cache)
  // no sabe que la cookie de perfil cambió, así que páginas ya visitadas (Mi Lista, Panel)
  // seguirían mostrando datos del perfil anterior. El cliente fuerza una recarga completa.
  return { success: true };
}

export async function clearActiveProfileAction(): Promise<{ success: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { success: false };
  await setActiveProfileInSession(user.id, user.role as "user" | "admin", null);
  return { success: true };
}

// --- Progreso de reproducción (estimado) ---
//
// Como los videos se reproducen dentro de un iframe externo (Streamwish y similares),
// no tenemos acceso a la posición real de reproducción. Este progreso es solo un
// estimado basado en cuánto tiempo el usuario mantuvo la pestaña abierta en la página
// del video, comparado con la duración declarada del título. No permite "continuar"
// realmente desde ese punto — el reproductor externo siempre empieza desde el inicio.

export async function updateWatchProgressAction(titleId: string, secondsWatched: number) {
  const user = await getCurrentUser();
  if (!user) return;
  const profile = await getActiveProfile();

  const title = await prisma.title.findUnique({ where: { id: titleId }, select: { duration: true } });
  const totalSeconds = parseDurationToSeconds(title?.duration) ?? 3600;
  const percent = Math.max(0, Math.min(95, Math.round((secondsWatched / totalSeconds) * 100)));

  await recordWatchHistory(user.id, titleId, profile?.id ?? null, percent);
}
