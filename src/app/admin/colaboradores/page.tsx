import Link from "next/link";
import { getContributors } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";
import ContributorBadge from "@/components/ContributorBadge";
import PromoteButton from "@/components/admin/PromoteButton";
import BadgeAssignSelect from "@/components/admin/BadgeAssignSelect";

export default async function AdminColaboradoresPage() {
  const [contributors, currentUser] = await Promise.all([getContributors(), getCurrentUser()]);
  const isFullAdmin = !currentUser?.adminLevel || currentUser.adminLevel === "full";

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Colaboradores</h1>
      <p className="mt-1 text-sm text-white/50">{contributors.length} usuarios registrados.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        {contributors.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 border-b border-white/5 bg-white/[0.02] p-3.5 last:border-b-0 hover:bg-white/5"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${(c.avatarSeed.length * 37) % 360} 60% 35%), hsl(${(c.avatarSeed.length * 37 + 40) % 360} 60% 20%))`,
              }}
            >
              {c.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/colaboradores/${c.id}`} className="truncate font-medium text-white hover:underline">
                {c.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ContributorBadge tier={c.badge} isAdmin={c.isAdmin} size="sm" />
                <span className="text-xs text-white/40">Miembro desde {c.joinedAt}</span>
              </div>
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="font-bold text-accent">{c.uploads}</p>
              <p className="text-[11px] text-white/40">aportes</p>
            </div>
            {isFullAdmin && <BadgeAssignSelect contributorId={c.id} badge={c.badge} />}
            {isFullAdmin && (
              <PromoteButton userId={c.userId} isAdmin={c.isAdmin} adminLevel={c.adminLevel} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
