import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Pin } from "lucide-react";
import LibrosHeader from "@/components/LibrosHeader";
import Footer from "@/components/Footer";
import ForumReplySection from "@/components/ForumReplySection";
import ForumThreadActions from "@/components/ForumThreadActions";
import { getForumThread, getSiteSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/dal";

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  recomendaciones: "Recomendaciones",
  autores: "Autores",
  "ayuda-lectura": "Ayuda de lectura",
  debate: "Debate literario",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const thread = await getForumThread(id);
  if (!thread || thread.section !== "books") return {};
  return {
    title: thread.title,
    description: thread.body.slice(0, 160),
  };
}

export default async function LibrosForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [thread, user, settings] = await Promise.all([
    getForumThread(id),
    getCurrentUser(),
    getSiteSettings(),
  ]);
  if (!thread || thread.section !== "books") notFound();

  return (
    <>
      <LibrosHeader tagline={settings.librosTagline} />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/libros/foro"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft size={15} />
            Todos los temas
          </Link>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {thread.pinned && <Pin size={13} className="text-accent" />}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                  {CATEGORY_LABEL[thread.category] ?? thread.category}
                </span>
              </div>
              <ForumThreadActions
                threadId={thread.id}
                canDelete={Boolean(user) && (thread.authorId === user?.id || user?.role === "admin")}
                isAdmin={user?.role === "admin"}
                pinned={thread.pinned}
              />
            </div>
            <h1 className="text-xl font-black text-white md:text-2xl">{thread.title}</h1>
            <p className="mt-1 text-xs text-white/40">Publicado por {thread.authorName}</p>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm text-white/70">{thread.body}</p>
          </div>

          <ForumReplySection
            threadId={thread.id}
            threadAuthorId={thread.authorId}
            initialReplies={thread.replies ?? []}
            isLoggedIn={Boolean(user)}
            currentUserId={user?.id}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
