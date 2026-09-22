import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContributorBadge from "@/components/ContributorBadge";
import { getContributors } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Top Colaboradores",
  description:
    "Conoce a los colaboradores que más libros han subido a Butakia y descubre su contenido.",
  alternates: { canonical: `${SITE_URL}/colaboradores` },
};

export default async function ColaboradoresPage() {
  const contributors = await getContributors();

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Crown size={36} className="mx-auto mb-3 text-accent" />
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Top Colaboradores
          </h1>
          <p className="mt-3 text-white/60">
            Reconocemos a quienes más alimentan el catálogo de Butakia con sus aportes.
          </p>
          <Link
            href="/publicar"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Upload size={16} />
            Sube tu contenido
          </Link>
        </div>

        <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border border-white/10">
          {contributors.map((c, i) => (
            <Link
              key={c.id}
              href={`/colaboradores/${c.id}`}
              className="flex items-center gap-4 border-b border-white/5 bg-white/[0.02] p-4 last:border-b-0 hover:bg-white/5"
            >
              <span className="w-6 shrink-0 text-center text-sm font-bold text-white/40">
                {i + 1}
              </span>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, hsl(${(c.avatarSeed.length * 37) % 360} 60% 35%), hsl(${(c.avatarSeed.length * 37 + 40) % 360} 60% 20%))`,
                }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{c.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <ContributorBadge tier={c.badge} isAdmin={c.isAdmin} size="sm" />
                  <span className="text-xs text-white/40">Miembro desde {c.joinedAt}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-black text-accent">{c.uploads}</p>
                <p className="text-[11px] uppercase tracking-wide text-white/40">aportes</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
