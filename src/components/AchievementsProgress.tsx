import { Award, Lock } from "lucide-react";

const MILESTONES = [5, 10, 20, 50, 100, 200, 300];

export default function AchievementsProgress({ uploads }: { uploads: number }) {
  const nextMilestone = MILESTONES.find((m) => uploads < m);
  const prevMilestone = [...MILESTONES].reverse().find((m) => uploads >= m) ?? 0;
  const rangeStart = prevMilestone;
  const rangeEnd = nextMilestone ?? prevMilestone;
  const progress = nextMilestone
    ? Math.min(1, (uploads - rangeStart) / (rangeEnd - rangeStart))
    : 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-5">
      <div className="mb-4 flex items-center gap-2">
        <Award size={18} className="text-accent" />
        <h3 className="font-bold text-white">Logros</h3>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-white/50">
        <span>{uploads} aportes</span>
        <span>
          {nextMilestone ? `Próxima meta: ${nextMilestone}` : "¡Todas las metas alcanzadas!"}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {MILESTONES.map((m) => {
          const unlocked = uploads >= m;
          return (
            <div
              key={m}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${
                unlocked
                  ? "border-accent/40 bg-accent/10"
                  : "border-white/10 bg-white/[0.02] opacity-60"
              }`}
            >
              {unlocked ? (
                <Award size={18} className="text-accent" />
              ) : (
                <Lock size={16} className="text-white/30" />
              )}
              <span className={`text-xs font-bold ${unlocked ? "text-white" : "text-white/40"}`}>
                {m}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
