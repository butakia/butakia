import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "./session";
import { prisma } from "./prisma";

export const getSession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;
  return decrypt(cookie);
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, isPremium: true, adminLevel: true },
  });
  return user;
});

export const getActiveProfile = cache(async () => {
  const session = await getSession();
  if (!session?.userId || !session?.profileId) return null;

  const profile = await prisma.profile.findUnique({ where: { id: session.profileId } });
  if (!profile || profile.userId !== session.userId) return null;
  return profile;
});
