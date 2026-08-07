import Link from "next/link";
import { Newspaper } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPosts } from "@/lib/blog-data";
import { isRealImage } from "@/components/PosterPlaceholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Noticias, actualizaciones y artículos de Butakia.",
};

const CATEGORY_LABEL: Record<string, string> = {
  noticia: "Noticia",
  actualizacion: "Actualización",
  articulo: "Artículo",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Newspaper size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white">Blog</h1>
              <p className="text-sm text-white/50">Noticias, actualizaciones y artículos de Butakia.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
              >
                <div className="aspect-video w-full overflow-hidden bg-surface">
                  {post.coverImage && isRealImage(post.coverImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
                      <Newspaper size={28} className="text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    {CATEGORY_LABEL[post.category] ?? post.category}
                  </span>
                  <h2 className="mt-2 font-bold text-white group-hover:text-accent">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/50">{post.excerpt}</p>
                  )}
                  {post.publishedAt && (
                    <p className="mt-2 text-xs text-white/30">
                      {new Date(post.publishedAt).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/40">
              Todavía no hay artículos publicados.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
