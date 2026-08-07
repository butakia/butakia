import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const titles = await prisma.title.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      seasons: {
        orderBy: { number: "asc" },
        include: { episodes: { orderBy: { number: "asc" } } },
      },
    },
  });

  const data = titles.map((t) => ({
    slug: t.slug,
    title: t.title,
    originalTitle: t.originalTitle,
    type: t.type,
    year: t.year,
    duration: t.duration,
    rating: t.rating,
    ageRating: t.ageRating,
    country: t.country,
    language: t.language,
    genres: parseJsonArray(t.genres),
    tags: parseJsonArray(t.tags),
    synopsis: t.synopsis,
    poster: t.poster,
    backdrop: t.backdrop,
    badges: parseJsonArray(t.badges),
    director: t.director,
    cast: parseJsonArray(t.cast),
    franchise: t.franchise,
    hasTrailer: t.hasTrailer,
    galleryCount: t.galleryCount,
    views: t.views,
    addedAt: t.addedAt,
    relatedSlugs: parseJsonArray(t.relatedSlugs),
    playerLink: t.sourceValue,
    playerLinkKind: t.sourceKind,
    playback: t.playback ? JSON.parse(t.playback) : null,
    trivia: parseJsonArray(t.trivia),
    status: t.status,
    featured: t.featured,
    featuredOrder: t.featuredOrder,
    uploaderName: t.uploaderName,
    seasons: t.seasons.map((s) => ({
      number: s.number,
      name: s.name,
      episodes: s.episodes.map((e) => ({
        number: e.number,
        title: e.title,
        duration: e.duration,
        thumbnail: e.thumbnail,
        playerLink: e.sourceValue,
        playerLinkKind: e.sourceKind,
      })),
    })),
  }));

  const filename = `butakia-catalogo-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), titles: data }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
