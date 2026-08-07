import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TitleCard from "@/components/TitleCard";
import { getFranchiseDefs, getAllTitles } from "@/lib/data";

export default async function FranchiseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [franchises, titles] = await Promise.all([getFranchiseDefs(), getAllTitles()]);

  const franchise = franchises.find((f) => f.id === id);
  if (!franchise) notFound();

  const items = titles.filter((t) => t.franchise === franchise.name);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/franquicias"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft size={15} />
            Todas las franquicias
          </Link>

          <div className="mb-8 flex items-center gap-3">
            {franchise.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={franchise.logoUrl}
                alt={franchise.name}
                className="h-14 w-14 rounded-lg object-contain"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Flame size={22} />
              </span>
            )}
            <div>
              <h1 className="text-2xl font-black text-white">{franchise.name}</h1>
              <p className="text-sm text-white/50">
                {items.length} título{items.length === 1 ? "" : "s"} en esta franquicia.
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
              Todavía no hay títulos subidos para esta franquicia.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {items.map((t) => (
                <TitleCard key={t.id} item={t} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
