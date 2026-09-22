"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getCurrentUser, getActiveProfile } from "./dal";
import { setActiveProfileInSession } from "./session";
import { getSiteSettings } from "./data";
import { checkRateLimit } from "./rate-limit";

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

export interface SiteSettingsInput {
  siteName: string;
  paypalLink?: string;
  yapeNumber?: string;
  yapeQrUrl?: string;
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
      await tx.user.update({ where: { id: user.id }, data: { name: data.name } });
    }
  });

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

// --- Foro ---

const FORUM_CATEGORIES = ["general", "recomendaciones", "autores", "ayuda-lectura", "debate"] as const;

export async function createForumThreadAction(
  title: string,
  body: string,
  category: string
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

  const finalCategory = (FORUM_CATEGORIES as readonly string[]).includes(category) ? category : "general";

  const thread = await prisma.forumThread.create({
    data: {
      title: trimmedTitle,
      body: trimmedBody,
      category: finalCategory,
      section: "books",
      authorName: user.name,
      authorId: user.id,
    },
  });
  revalidatePath("/foro");
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
  revalidatePath("/foro");
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
}

export async function togglePinForumThreadAction(threadId: string) {
  await requireAdmin();
  const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
  if (!thread) return;
  await prisma.forumThread.update({ where: { id: threadId }, data: { pinned: !thread.pinned } });
  revalidatePath("/foro");
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

// --- Etiquetas (tags) ---

export async function createTagAction(label: string, color: string) {
  await requireFullAdmin();
  const trimmed = label.trim().toUpperCase();
  if (!trimmed) throw new Error("El nombre de la etiqueta es obligatorio.");
  const count = await prisma.tag.count();
  await prisma.tag.create({ data: { label: trimmed, color: color || "#e50914", order: count } });
  revalidatePath("/admin/etiquetas");
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
  // no sabe que la cookie de perfil cambió, así que páginas ya visitadas (Panel)
  // seguirían mostrando datos del perfil anterior. El cliente fuerza una recarga completa.
  return { success: true };
}

export async function clearActiveProfileAction(): Promise<{ success: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { success: false };
  await setActiveProfileInSession(user.id, user.role as "user" | "admin", null);
  return { success: true };
}
