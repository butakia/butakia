import "dotenv/config";
import { createClient } from "@libsql/client";
async function main() {
  const turso = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
  const res = await turso.execute(`SELECT slug, title, status FROM "Book" ORDER BY createdAt ASC LIMIT 30`);
  console.log(res.rows);
  turso.close();
}
main();
