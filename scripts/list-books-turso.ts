// Read-only: lists every book in production with title/author/cover, to help
// identify test/junk entries before any deletion.
// Usage: npx tsx scripts/list-books-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const turso = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  const res = await turso.execute(
    `SELECT id, slug, title, authorName, cover, status, uploaderId, createdAt FROM "Book" ORDER BY createdAt ASC`
  );
  for (const row of res.rows) {
    console.log(`${row.id} | ${row.title} | autor: ${row.authorName} | cover: ${row.cover} | status: ${row.status} | ${row.createdAt}`);
  }
  console.log(`\nTotal: ${res.rows.length} libros`);
  turso.close();
}
main();
