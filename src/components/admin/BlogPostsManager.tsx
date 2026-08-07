"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { deleteBlogPostAction } from "@/lib/blog-actions";
import { BlogPost } from "@/lib/types";

const CATEGORY_LABEL: Record<BlogPost["category"], string> = {
  noticia: "Noticia",
  actualizacion: "Actualización",
  articulo: "Artículo",
};

export default function BlogPostsManager({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (slug: string) => {
    startTransition(async () => {
      await deleteBlogPostAction(slug);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/blog/nuevo"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={15} />
          Nuevo artículo
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {post.status === "published" ? (
                  <Eye size={13} className="shrink-0 text-emerald-400" />
                ) : (
                  <EyeOff size={13} className="shrink-0 text-white/30" />
                )}
                <p className="truncate font-semibold text-white">{post.title}</p>
              </div>
              <p className="mt-1 text-xs text-white/40">
                {CATEGORY_LABEL[post.category]} · {post.authorName} ·{" "}
                {post.status === "published" ? "Publicado" : "Borrador"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/blog/${post.slug}/editar`}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                <Pencil size={13} />
                Editar
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(post.slug)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/40 hover:border-red-500/40 hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/40">
          Aún no hay artículos. Crea el primero.
        </p>
      )}
    </div>
  );
}
