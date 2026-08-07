import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Newspaper } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareRow from "@/components/reader/ShareRow";
import { getPostBySlug } from "@/lib/blog-data";
import { isRealImage } from "@/components/PosterPlaceholder";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

const CATEGORY_LABEL: Record<string, string> = {
  noticia: "Noticia",
  actualizacion: "Actualización",
  articulo: "Artículo",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") notFound();

  return (
    <>
      <Header />
      <main className="flex-1 px-6 pb-16 pt-28 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft size={15} />
            Volver al blog
          </Link>

          {post.coverImage && isRealImage(post.coverImage) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="mb-6 aspect-video w-full rounded-xl object-cover"
            />
          )}

          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            {CATEGORY_LABEL[post.category] ?? post.category}
          </span>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            {post.title}
          </h1>

          <p className="mt-2 flex items-center gap-2 text-sm text-white/40">
            <Newspaper size={13} />
            {post.authorName}
            {post.publishedAt && (
              <>
                {" · "}
                {new Date(post.publishedAt).toLocaleDateString("es", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
          </p>

          <div
            className="prose prose-invert mt-8 max-w-none prose-headings:font-black prose-a:text-accent"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 border-t border-white/10 pt-6">
            <ShareRow
              slug={post.slug}
              title={post.title}
              url={`${SITE_URL}/blog/${post.slug}`}
              label="Compartir este artículo"
              text={post.title}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
