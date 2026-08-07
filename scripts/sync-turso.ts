// One-off / repeatable sync: copies the full schema + data from the local
// SQLite file (./dev.db) into the Turso (libSQL) database referenced by
// TURSO_DATABASE_URL / TURSO_AUTH_TOKEN. Needed because Prisma's migrate/db
// push CLI can't target a libsql:// URL directly (P1013: scheme not
// recognized) — the driver adapter is a runtime-only mechanism, so getting
// the schema onto Turso has to go through a real libSQL connection instead.
//
// Usage: npx tsx scripts/sync-turso.ts
import "dotenv/config";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL no está definida en .env — nada que sincronizar.");
  process.exit(1);
}

const local = new Database("./dev.db", { readonly: true });
const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

async function main() {
  console.log("Leyendo esquema y datos de ./dev.db...");

  const schemaObjects = local
    .prepare(
      `select type, name, sql from sqlite_master
       where sql is not null and name not like 'sqlite_%'
       order by case type when 'table' then 0 else 1 end`,
    )
    .all() as { type: string; name: string; sql: string }[];

  const tables = schemaObjects.filter((o) => o.type === "table").map((o) => o.name);

  // Idempotent: drop whatever's already there first, so this script can be
  // re-run safely (e.g. after adding new local content, or to recover from a
  // partially-applied run) instead of failing on "table already exists".
  const existingRes = await turso.execute(
    `select name from sqlite_master where type='table' and name not like 'sqlite_%'`,
  );
  const dropStatements = existingRes.rows.map((row) => `DROP TABLE IF EXISTS "${row.name as string}";`);

  // A single PRAGMA foreign_keys=OFF sent via its own execute()/tx.execute()
  // call does NOT reliably carry over to later, separate statements against
  // Turso's HTTP (Hrana) backend — each can behave like its own connection.
  // executeMultiple() runs a whole SQL script as one server-side unit, which
  // is what actually makes the PRAGMA apply to the DROP/CREATE statements
  // that follow it in the same call.
  const ddlScript = [
    "PRAGMA foreign_keys=OFF;",
    ...dropStatements,
    ...schemaObjects.map((o) => o.sql + ";"),
  ].join("\n");

  console.log(`Creando ${schemaObjects.length} objetos (tablas + índices) en Turso...`);
  await turso.executeMultiple(ddlScript);

  const tx = await turso.transaction("write");
  try {
    await tx.execute("PRAGMA foreign_keys=OFF;");
    let totalRows = 0;
    for (const table of tables) {
      const rows = local.prepare(`SELECT * FROM "${table}"`).all() as Record<string, unknown>[];
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => "?").join(", ");
      const insertSql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

      for (const row of rows) {
        await tx.execute({ sql: insertSql, args: columns.map((c) => row[c] as never) });
      }
      totalRows += rows.length;
      console.log(`  ${table}: ${rows.length} filas`);
    }

    await tx.execute("PRAGMA foreign_keys=ON;");
    await tx.commit();
    console.log(`Listo. ${tables.length} tablas y ${totalRows} filas copiadas a Turso.`);
  } catch (err) {
    await tx.rollback();
    throw err;
  }

  local.close();
  turso.close();
}

main().catch((err) => {
  console.error("Falló la sincronización con Turso:", err);
  process.exit(1);
});
