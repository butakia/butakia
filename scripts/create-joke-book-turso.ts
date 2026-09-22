// One-off: creates a single short book requested by the site admin directly
// in production. Original one-line content, no copyright concerns.
// Usage: npx tsx scripts/create-joke-book-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";

const turso = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

function newId(): string {
  return randomUUID().replace(/-/g, "");
}

async function main() {
  const admin = await turso.execute(
    `SELECT id, name FROM "User" WHERE email = 'omaroliden1@gmail.com'`
  );
  const uploaderId = admin.rows[0]?.id as string;
  const uploaderName = admin.rows[0]?.name as string;
  if (!uploaderId) throw new Error("No se encontró el usuario omaroliden1@gmail.com");

  const bookId = newId();
  const chapterId = newId();
  const now = new Date().toISOString();

  await turso.execute({
    sql: `INSERT INTO "Book" (id, slug, title, authorName, uploaderId, uploaderName, synopsis, cover, genres, tags, categories, badges, contentType, sourceKind, status, isFree, views, readCount, rating, seoKeywords, createdAt, updatedAt, showUploader)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', '[]', '[]', 'text', 'pasted_text', 'published', 1, 0, 0, 0, '[]', ?, ?, 1)`,
    args: [
      bookId,
      "claude-es-un-imbecil-paranoico",
      "Claude es un imbécil paranóico",
      "Omar Oliden",
      uploaderId,
      uploaderName,
      "",
      "claude-es-un-imbecil-paranoico",
      now,
      now,
    ],
  });

  await turso.execute({
    sql: `INSERT INTO "BookChapter" (id, bookId, "order", title, content, createdAt) VALUES (?, ?, 0, NULL, ?, ?)`,
    args: [chapterId, bookId, "Cree tener consciencia y ser moral y solo estorba", now],
  });

  console.log("Creado:", bookId, "/", "claude-es-un-imbecil-paranoico");
  turso.close();
}
main();
