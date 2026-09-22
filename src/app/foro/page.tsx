import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForumThreadList from "@/components/ForumThreadList";
import NewThreadForm from "@/components/NewThreadForm";
import { getForumThreads, getSiteSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Foro de Butakia Libros",
  description:
    "Habla con otros lectores de Butakia Libros: pide recomendaciones, comenta sobre autores y comparte tus lecturas.",
};

export default async function LibrosForoPage() {
  const [threads, user, settings] = await Promise.all([
    getForumThreads(),
    getCurrentUser(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header tagline={settings.librosTagline} />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <MessagesSquare size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Foro de Butakia Libros</h1>
              <p className="text-sm text-white/50">
                Pide recomendaciones, comenta sobre autores o comparte lo que estás leyendo.
              </p>
            </div>
          </div>

          <NewThreadForm isLoggedIn={Boolean(user)} />

          <ForumThreadList threads={threads} />
        </div>
      </main>
      <Footer />
    </>
  );
}
