import Link from "next/link";
import { Upload, Trophy, ArrowRight } from "lucide-react";

const MILESTONES = [10, 20, 50, 100, 200, 300];

export default function UploadIncentiveBanner({ uploads }: { uploads: number }) {
  const nextMilestone = MILESTONES.find((m) => uploads < m);
  const prevMilestone = [...MILESTONES].reverse().find((m) => uploads >= m) ?? 0;
  const remaining = nextMilestone ? nextMilestone - uploads : 0;
  const progress = nextMilestone
    ? Math.min(1, (uploads - prevMilestone) / (nextMilestone - prevMilestone))
    : 1;

  return (
    <div className="mx-6 mt-6 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 via-zinc-900 to-black p-4 md:mx-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Trophy size={18} />
          </span>
          <div>
            {uploads === 0 ? (
              <p className="text-sm text-white/70">
                <span className="font-semibold text-white">Aún no has subido nada.</span> Sube tu
                primera película o serie y empieza a ganar insignias y comisión por aportes.
              </p>
            ) : (
              <p className="text-sm text-white/70">
                <span className="font-semibold text-white">{uploads} aportes hasta ahora.</span>{" "}
                {nextMilestone
                  ? `Te faltan ${remaining} para tu próxima meta de ${nextMilestone}.`
                  : "¡Alcanzaste todas las metas! Sigue subiendo para mantener tu insignia."}
              </p>
            )}
            {nextMilestone && (
              <div className="mt-2 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/panel"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            Mi panel
            <ArrowRight size={13} />
          </Link>
          <Link
            href="/subir"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Upload size={14} />
            Subir contenido
          </Link>
        </div>
      </div>
    </div>
  );
}
