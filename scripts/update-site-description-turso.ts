// One-off: updates the production SiteSettings.siteDescription row, which still
// held movie-oriented copy from before the movies→books-only migration (a data
// value, not something prisma/schema.prisma changes touch). Does not affect any
// other table.
//
// Usage: npx tsx scripts/update-site-description-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL no está definida en .env.");
  process.exit(1);
}

const NEW_DESCRIPTION =
  "Butakia es la plataforma colaborativa para leer libros gratis online: novelas, cuentos, poesía y más.";

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

async function main() {
  const before = await turso.execute(`SELECT siteDescription FROM "SiteSettings" WHERE id='singleton'`);
  console.log("Antes:", before.rows[0]?.siteDescription);

  await turso.execute({
    sql: `UPDATE "SiteSettings" SET siteDescription = ? WHERE id = 'singleton'`,
    args: [NEW_DESCRIPTION],
  });

  const after = await turso.execute(`SELECT siteDescription FROM "SiteSettings" WHERE id='singleton'`);
  console.log("Después:", after.rows[0]?.siteDescription);
  turso.close();
}

main().catch((err) => {
  console.error("Falló la actualización:", err);
  process.exit(1);
});
