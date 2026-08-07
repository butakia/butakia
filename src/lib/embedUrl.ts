export function withAutoplay(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("autoplay")) {
      parsed.searchParams.set("autoplay", "1");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
