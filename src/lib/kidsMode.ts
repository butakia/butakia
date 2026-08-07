import type { Title } from "./types";

const MATURE_AGE_RATINGS = new Set(["R", "NC-17", "18+"]);

export function filterForKids<T extends Pick<Title, "ageRating">>(items: T[], isKids: boolean): T[] {
  if (!isKids) return items;
  return items.filter((t) => !t.ageRating || !MATURE_AGE_RATINGS.has(t.ageRating));
}
