import "server-only";
import { prisma } from "./prisma";

function randomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return `${randomCode()}${Date.now().toString(36).toUpperCase()}`;
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}
