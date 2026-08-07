import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForumThreadList from "@/components/ForumThreadList";
import NewThreadForm from "@/components/NewThreadForm";
import { getForumThreads } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Foro de la comunidad",
  description:
    "Habla con otros usuarios de Butakia: pide ayuda, sugiere películas y comparte recomendaciones en el foro de la comunidad.",
};

export default async function ForoPage() {
  const [threads, user] = await Promise.all([getForumThreads(), getCurrentUser()]);

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <MessagesSquare size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Foro de la comunidad</h1>
              <p className="text-sm text-white/50">
                Pide ayuda, sugiere títulos o comparte lo que quieras con otros usuarios.
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
