import Link from "next/link";
import { Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContributorBadge from "@/components/ContributorBadge";
import { getContributors } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créditos",
  description: "Reconocimiento a los colaboradores que hacen crecer Butakia.",
};

export default async function CreditosPage() {
  const contributors = await getContributors();
  const trusted = contributors.filter((c) => c.isAdmin || c.badge);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Award size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Créditos</h1>
              <p className="text-sm text-white/50">
                Butakia existe gracias a estos colaboradores y administradores de confianza.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trusted.map((c) => (
              <Link
                key={c.id}
                href={`/colaboradores/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
              >
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, hsl(${(c.avatarSeed.length * 37) % 360} 60% 35%), hsl(${(c.avatarSeed.length * 37 + 40) % 360} 60% 20%))`,
                    }}
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{c.name}</p>
                  <div className="mt-1">
                    <ContributorBadge tier={c.badge} isAdmin={c.isAdmin} size="sm" />
                  </div>
                </div>
                <span className="shrink-0 text-right text-xs text-white/40">
                  {c.uploads}
                  <br />
                  aportes
                </span>
              </Link>
            ))}
          </div>

          {trusted.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
              Todavía no hay colaboradores de confianza destacados.
            </p>
          )}

          <p className="mt-10 text-center text-sm text-white/40">
            ¿Quieres aparecer aquí?{" "}
            <Link href="/subir" className="text-accent hover:underline">
              Sube contenido
            </Link>{" "}
            y sé constante — las insignias y roles de administrador se otorgan a los colaboradores
            más activos y confiables.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
