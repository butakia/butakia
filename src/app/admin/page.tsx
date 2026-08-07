import Link from "next/link";
import { Film, Tv, Inbox, Eye, Users, TrendingUp, Activity, CalendarDays } from "lucide-react";
import { getAllTitles, getPendingSubmissions, getContributors } from "@/lib/data";
import { getVisitStats } from "@/lib/visits";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            accent ? "bg-accent/15 text-accent" : "bg-white/10 text-white/70"
          }`}
        >
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const [titles, pending, contributors, visitStats] = await Promise.all([
    getAllTitles(),
    getPendingSubmissions(),
    getContributors(),
    getVisitStats(),
  ]);

  const movies = titles.filter((t) => t.type === "movie").length;
  const series = titles.filter((t) => t.type === "series").length;
  const totalViews = titles.reduce((sum, t) => sum + (t.views ?? 0), 0);

  const recent = [...titles]
    .filter((t) => t.addedAt)
    .sort((a, b) => (b.addedAt! > a.addedAt! ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-white/50">Resumen general de Butakia.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Film} label="Películas" value={movies} />
        <StatCard icon={Tv} label="Series" value={series} />
        <StatCard icon={Inbox} label="Pendientes de revisión" value={pending.length} accent />
        <StatCard icon={Eye} label="Vistas totales" value={totalViews.toLocaleString("es-ES")} />
        <StatCard icon={Users} label="Colaboradores" value={contributors.length} />
        <StatCard icon={TrendingUp} label="Total de títulos" value={titles.length} />
        <StatCard icon={CalendarDays} label="Visitas reales hoy" value={visitStats.today.toLocaleString("es-ES")} accent />
        <StatCard icon={Activity} label="Visitas reales totales" value={visitStats.total.toLocaleString("es-ES")} />
      </div>
      <p className="mt-2 text-xs text-white/30">
        Las "visitas reales" cuentan cargas de página reales — distinto del contador de "usuarios
        en línea" simulado que puedes activar en Admin → Configuración.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 font-bold text-white">Últimos títulos agregados</h2>
          <div className="space-y-1">
            {recent.map((t) => (
              <Link
                key={t.id}
                href={`/admin/contenido/${t.slug}/editar`}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <span className="truncate text-white/80">{t.title}</span>
                <span className="shrink-0 text-xs text-white/40">{t.addedAt}</span>
              </Link>
            ))}
            {recent.length === 0 && <p className="text-sm text-white/40">Sin registros aún.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 font-bold text-white">Pendientes de revisión</h2>
          <div className="space-y-1">
            {pending.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href="/admin/pendientes"
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <span className="truncate text-white/80">{p.title}</span>
                <span className="shrink-0 text-xs text-white/40">{p.submittedBy}</span>
              </Link>
            ))}
            {pending.length === 0 && (
              <p className="text-sm text-white/40">No hay contenido pendiente. 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
