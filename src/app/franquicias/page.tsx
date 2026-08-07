import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFranchiseDefs, getAllTitles } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Franquicias de culto",
  description:
    "Explora sagas y universos completos en Butakia: Marvel, Star Wars, El Señor de los Anillos y más, agrupados para maratonear.",
  alternates: { canonical: `${SITE_URL}/franquicias` },
};

export default async function FranquiciasPage() {
  const [franchises, titles] = await Promise.all([getFranchiseDefs(), getAllTitles()]);

  const counts = new Map<string, number>();
  for (const t of titles) {
    if (!t.franchise) continue;
    counts.set(t.franchise, (counts.get(t.franchise) ?? 0) + 1);
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Flame size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Franquicias de culto</h1>
              <p className="text-sm text-white/50">
                Universos y sagas completos, agrupados para maratonear sin buscar.
              </p>
            </div>
          </div>

          {franchises.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
              Aún no hay franquicias creadas.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {franchises.map((f) => (
                <Link
                  key={f.id}
                  href={`/franquicias/${f.id}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center transition-colors hover:bg-white/[0.07]"
                >
                  {f.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.logoUrl}
                      alt={f.name}
                      className="h-16 w-16 rounded-lg object-contain"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-accent">
                      <Flame size={24} />
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{f.name}</p>
                    <p className="text-xs text-white/40">{counts.get(f.name) ?? 0} títulos</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="mt-10 text-center text-sm text-white/40">
            ¿Subiste una película de una saga? Márcala como franquicia al subirla desde{" "}
            <Link href="/subir" className="text-accent hover:underline">
              esta página
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
