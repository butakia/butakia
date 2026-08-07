"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./actions";
import { slugify } from "./slugify";

export interface BlogPostInput {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: "noticia" | "actualizacion" | "articulo";
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createBlogPostAction(input: BlogPostInput) {
  const user = await requireAdmin();
  const baseSlug = slugify(input.title) || "articulo";
  let slug = baseSlug;
  let i = 2;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  await prisma.blogPost.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage || null,
      category: input.category,
      authorName: user.name,
      status: input.status,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt: input.status === "published" ? new Date() : null,
    },
  });
  revalidateBlog(slug);
  return slug;
}

export async function updateBlogPostAction(slug: string, input: BlogPostInput) {
  await requireAdmin();
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) throw new Error("Artículo no encontrado.");

  await prisma.blogPost.update({
    where: { slug },
    data: {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage || null,
      category: input.category,
      status: input.status,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt:
        input.status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });
  revalidateBlog(slug);
}

export async function deleteBlogPostAction(slug: string) {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { slug } });
  revalidateBlog(slug);
}
