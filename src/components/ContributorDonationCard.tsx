import { HandCoins, Target, TrendingUp } from "lucide-react";

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ContributorDonationCard({
  totalDonations,
  donationSharePercent,
  uploadGoal,
  uploads,
  totalUploads,
}: {
  totalDonations: number;
  donationSharePercent: number;
  uploadGoal: number;
  uploads: number;
  totalUploads: number;
}) {
  const pool = totalDonations * (donationSharePercent / 100);
  const shareRatio = totalUploads > 0 ? uploads / totalUploads : 0;
  const estimatedShare = pool * shareRatio;
  const goalProgress = Math.min(1, uploads / uploadGoal);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-5">
      <div className="mb-4 flex items-center gap-2">
        <HandCoins size={18} className="text-accent" />
        <h3 className="font-bold text-white">Transparencia de donaciones</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-lg font-black text-white">$ {formatMoney(totalDonations)}</p>
          <p className="text-[11px] text-white/40">recaudado en total</p>
        </div>
        <div>
          <p className="text-lg font-black text-accent">$ {formatMoney(pool)}</p>
          <p className="text-[11px] text-white/40">{donationSharePercent}% para colaboradores</p>
        </div>
        <div>
          <p className="text-lg font-black text-white">$ {formatMoney(estimatedShare)}</p>
          <p className="text-[11px] text-white/40">tu estimado</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/50">
          <span className="flex items-center gap-1">
            <Target size={12} />
            Meta: {uploadGoal} aportes
          </span>
          <span>{uploads}/{uploadGoal}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
            style={{ width: `${goalProgress * 100}%` }}
          />
        </div>
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/40">
        <TrendingUp size={13} className="mt-0.5 shrink-0" />
        Estimado de transparencia basado en tu proporción de aportes frente al total de la
        comunidad. No es un pago garantizado ni un monto final.
      </p>
    </div>
  );
}
