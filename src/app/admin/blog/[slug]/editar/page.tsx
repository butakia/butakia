import Link from "next/link";
import { getPostBySlug } from "@/lib/blog-data";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditarArticuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div>
        <p className="text-white/60">No se encontró ese artículo.</p>
        <Link href="/admin/blog" className="mt-2 inline-block text-accent hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Editar: {post.title}</h1>
      <div className="mt-6">
        <BlogPostForm initial={post} />
      </div>
    </div>
  );
}
