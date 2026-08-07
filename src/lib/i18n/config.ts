export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "butakia_locale";

/** Picks a supported locale from a raw `Accept-Language` header value, e.g.
 * "en-US,en;q=0.9,es;q=0.8" -> "en". Falls back to the default when nothing
 * in the header matches a language we support. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const tags = header.split(",").map((part) => part.split(";")[0].trim().toLowerCase());
  for (const tag of tags) {
    const primary = tag.split("-")[0];
    if ((LOCALES as readonly string[]).includes(primary)) return primary as Locale;
  }
  return DEFAULT_LOCALE;
}
