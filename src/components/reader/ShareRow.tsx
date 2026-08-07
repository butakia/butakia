"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.39a9.9 9.9 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.16-4.93-4.35-.15-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.05.17-.19.72-.83.91-1.12.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.13.07.71-.17 1.39Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ShareRow({
  slug,
  title,
  url,
  label = "Compartir esta obra",
  text,
}: {
  slug: string;
  title: string;
  url?: string;
  label?: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? `${SITE_URL}/libros/${slug}`;
  const shareText = text ?? `Estoy leyendo "${title}" en Butakia Libros`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 md:items-start">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <div className="flex items-center gap-2">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-110"
        >
          <FacebookIcon />
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en WhatsApp"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
        >
          <WhatsAppIcon />
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copiar enlace para Instagram"
          title="Instagram no permite compartir enlaces directos: copia el link para pegarlo en tu historia o bio"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white transition-transform hover:scale-110"
        >
          {copied ? <Link2 size={18} /> : <InstagramIcon />}
        </button>
      </div>
      {copied && <p className="text-[11px] text-white/60">Enlace copiado</p>}
    </div>
  );
}
