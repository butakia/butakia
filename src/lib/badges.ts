import "server-only";

export type BadgeTier = "gold" | "silver" | "bronze";

// Umbrales de aportes aprobados para subir de nivel automáticamente.
const TIERS: { min: number; tier: BadgeTier }[] = [
  { min: 200, tier: "gold" },
  { min: 50, tier: "silver" },
  { min: 10, tier: "bronze" },
];

export function computeBadgeTier(uploads: number): BadgeTier | null {
  for (const t of TIERS) {
    if (uploads >= t.min) return t.tier;
  }
  return null;
}

export const BADGE_TIER_LABEL: Record<BadgeTier, string> = {
  gold: "Oro",
  silver: "Plata",
  bronze: "Bronce",
};
