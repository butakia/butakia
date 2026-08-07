import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TitleCard from "@/components/TitleCard";
import { getFavoriteTitles } from "@/lib/data";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";

export default async function MiListaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getActiveProfile();
  const titles = await getFavoriteTitles(user.id, profile?.id ?? null);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Heart size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Mi Lista</h1>
              <p className="text-sm text-white/50">
                {titles.length} título{titles.length === 1 ? "" : "s"} guardado
                {titles.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          {titles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
              Aún no has agregado nada a tu lista. Busca una película o serie y presiona
              &ldquo;Agregar a Mi Lista&rdquo;.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {titles.map((t) => (
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
