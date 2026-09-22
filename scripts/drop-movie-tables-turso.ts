// One-off migration: removes the movie/series-only tables and orphaned
// movies-forum content from the production Turso database, WITHOUT touching
// any Book/User/Contributor/etc. data. Unlike scripts/sync-turso.ts (which
// mirrors the whole DB from local ./dev.db and would destroy real book/user
// data that only exists in Turso), this only drops the specific tables that
// belonged exclusively to the movies/series feature, now removed from the
// app and from prisma/schema.prisma.
//
// Run scripts/backup-turso-readonly.ts first and keep the backup.
//
// Usage: npx tsx scripts/drop-movie-tables-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL no está definida en .env — nada que migrar.");
  process.exit(1);
}

const MOVIE_ONLY_TABLES = [
  "Comment",
  "Favorite",
  "Vote",
  "Reaction",
  "WatchHistory",
  "EditSuggestion",
  "Report",
  "Episode",
  "Season",
  "Title",
  "Franchise",
  "Playlist",
  "PendingSubmission",
  "HomeSection",
];

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

async function main() {
  console.log("Borrando hilos del foro de películas (section='movies')...");
  const orphanThreads = await turso.execute(`SELECT id FROM "ForumThread" WHERE section = 'movies'`);
  const threadIds = orphanThreads.rows.map((r) => r.id as string);
  console.log(`  ${threadIds.length} hilo(s) encontrados.`);

  const script = [
    "PRAGMA foreign_keys=OFF;",
    ...(threadIds.length
      ? [
          `DELETE FROM "ForumReply" WHERE threadId IN (${threadIds.map((id) => `'${id}'`).join(",")});`,
          `DELETE FROM "ForumThread" WHERE section = 'movies';`,
        ]
      : []),
    ...MOVIE_ONLY_TABLES.map((t) => `DROP TABLE IF EXISTS "${t}";`),
  ].join("\n");

  console.log(`Borrando ${MOVIE_ONLY_TABLES.length} tablas exclusivas de películas/series...`);
  await turso.executeMultiple(script);

  console.log("Listo. Tablas de libros, usuarios y colaboradores intactas.");
  turso.close();
}

main().catch((err) => {
  console.error("Falló la migración de Turso:", err);
  process.exit(1);
});
