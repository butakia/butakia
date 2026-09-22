// One-off: adds a bio and profile photo to the LiteraryAuthor record for
// Julio Ramón Ribeyro. Bio is original text summarizing public biographical
// facts (not copied from any single source). Photo is a CC BY 2.0 licensed
// photograph (Municipalidad de Miraflores, via Wikimedia Commons).
// Usage: npx tsx scripts/update-ribeyro-author-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const turso = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

const PHOTO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/5/53/Homenaje_a_Julio_Ram%C3%B3n_Ribeyro_por_Marco_Sue%C3%B1o_%284%29.jpg";

const BIO =
  "Julio Ramón Ribeyro Zúñiga (Lima, 1929 – 1994) fue un narrador y ensayista peruano, considerado uno de los grandes cuentistas latinoamericanos del siglo XX. Perteneció a la Generación del 50 y desarrolló una obra de estilo realista, marcada por la ironía y una prosa sobria, centrada en la vida urbana de Lima y sus contrastes sociales. Recopiló buena parte de sus cuentos en \"La palabra del mudo\". Poco antes de morir recibió el Premio Juan Rulfo, uno de los máximos reconocimientos de las letras en español.";

async function main() {
  const author = await turso.execute(
    `SELECT id, slug, name, bio, photoUrl FROM "LiteraryAuthor" WHERE name = 'Julio Ramón Ribeyro'`
  );
  const row = author.rows[0];
  if (!row) {
    console.log("No se encontró LiteraryAuthor 'Julio Ramón Ribeyro'.");
    turso.close();
    return;
  }
  console.log("Antes:", row);

  await turso.execute({
    sql: `UPDATE "LiteraryAuthor" SET bio = ?, photoUrl = ?, updatedAt = ? WHERE id = ?`,
    args: [BIO, PHOTO_URL, new Date().toISOString(), row.id as string],
  });

  const after = await turso.execute({
    sql: `SELECT id, slug, name, bio, photoUrl FROM "LiteraryAuthor" WHERE id = ?`,
    args: [row.id as string],
  });
  console.log("Después:", after.rows[0]);
  turso.close();
}
main();
