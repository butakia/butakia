"use server";

import { prisma } from "./prisma";

// Fire-and-forget: a visit log is not critical-path data, so a failure here should
// never break page rendering for the user.
export async function recordVisitAction(path: string) {
  try {
    await prisma.siteVisit.create({ data: { path: path.slice(0, 200) } });
  } catch {
    // ignore
  }
}

export async function getVisitStats(): Promise<{ total: number; today: number }> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [total, today] = await Promise.all([
    prisma.siteVisit.count(),
    prisma.siteVisit.count({ where: { createdAt: { gte: startOfDay } } }),
  ]);
  return { total, today };
}
