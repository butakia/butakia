import { HandCoins, ExternalLink } from "lucide-react";

export default function MonetizationBanner() {
  return (
    <div className="mx-auto mb-6 flex max-w-3xl flex-col gap-3 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent p-4 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
        <HandCoins size={20} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Sube películas y gana 💰</p>
        <p className="mt-0.5 text-xs text-white/60">
          Puedes alojar tus videos en plataformas monetizadas como{" "}
          <a
            href="https://streamwish.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
          >
            Streamwish
            <ExternalLink size={11} />
          </a>{" "}
          y ganar dinero por cada reproducción de tu video — luego solo pega ese enlace aquí para
          compartirlo con la comunidad de Butakia.
        </p>
      </div>
    </div>
  );
}
