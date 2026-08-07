import "server-only";
import { headers } from "next/headers";

// In-memory sliding-window limiter — fine for a single-instance deployment like this
// one; swap for a shared store (Redis, etc.) if the app ever runs multiple instances,
// since separate processes wouldn't share this Map and the limit would be per-instance.
const hits = new Map<string, number[]>();

// Periodic cleanup so `hits` doesn't grow unbounded with one-off keys from users who
// never come back.
let lastSweep = Date.now();
function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, timestamps] of hits) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

/**
 * Returns true if the action identified by `key` is allowed right now, and records
 * this attempt. `limit` attempts are allowed per `windowMs`.
 */
export async function checkRateLimit(
  action: string,
  limit: number,
  windowMs: number,
  identity?: string
): Promise<boolean> {
  const ip = identity ?? (await getClientIp());
  const key = `${action}:${ip}`;
  const now = Date.now();
  sweep(windowMs);

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
