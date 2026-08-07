import "server-only";
import { prisma } from "./prisma";
import { BlogPost } from "./types";
import type { BlogPost as DbBlogPost } from "@/generated/prisma/client";

function dbToBlogPost(row: DbBlogPost): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage ?? undefined,
    category: row.category as BlogPost["category"],
    authorName: row.authorName,
    status: row.status as BlogPost["status"],
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : undefined,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(dbToBlogPost);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(dbToBlogPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? dbToBlogPost(row) : undefined;
}
