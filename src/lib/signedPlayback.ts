import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.PLAYBACK_TOKEN_SECRET!;

export function signPlaybackUrl(path: string, ttlSeconds = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = createHmac("sha256", SECRET).update(`${path}:${expires}`).digest("hex");
  return `${path}?expires=${expires}&sig=${sig}`;
}

export function verifyPlaybackUrl(path: string, expires: string, sig: string): boolean {
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", SECRET).update(`${path}:${expires}`).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
