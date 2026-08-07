const ALLOWED_PROTOCOLS = new Set(["https:"]); // evita http: salvo que realmente lo necesites
const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function validateEmbedUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, error: "URL inválida." };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, error: "Solo se permiten enlaces https://." };
  }
  if (
    BLOCKED_HOSTS.has(parsed.hostname) ||
    parsed.hostname.match(/^(10|172\.(1[6-9]|2\d|3[01])|192\.168)\./)
  ) {
    return { ok: false, error: "Ese host no está permitido." };
  }
  // Opcional: restringir a una lista blanca de dominios que tú cures (recomendado)
  // if (!ALLOWED_EMBED_DOMAINS.has(parsed.hostname)) return { ok: false, error: "Dominio no permitido." };

  return { ok: true, url: parsed.toString() };
}

export function extractIframeSrc(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("<")) return trimmed; // ya es una URL simple

  const match = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
