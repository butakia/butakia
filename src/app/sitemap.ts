import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getContributors, getForumThreads } from "@/lib/data";
import { getAllBooks } from "@/lib/books-data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [contributors, threads, books] = await Promise.all([
    getContributors(),
    getForumThreads(),
    getAllBooks(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/colaboradores`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/foro`, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/premium`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/creditos`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/ayuda`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/publicar`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const bookRoutes: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${SITE_URL}/${b.slug}`,
    lastModified: new Date(b.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const contributorRoutes: MetadataRoute.Sitemap = contributors.map((c) => ({
    url: `${SITE_URL}/colaboradores/${c.id}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const forumRoutes: MetadataRoute.Sitemap = threads.map((t) => ({
    url: `${SITE_URL}/foro/${t.id}`,
    lastModified: t.createdAt ? new Date(t.createdAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  return [...staticRoutes, ...bookRoutes, ...contributorRoutes, ...forumRoutes];
}
