// Read-only safety backup of the production Turso database. Dumps every row
// of every table to a timestamped local JSON file (outside the repo) before
// any destructive schema change. Never writes to Turso.
//
// Usage: npx tsx scripts/backup-turso-readonly.ts
import "dotenv/config";
import { createClient } from "@libsql/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error("TURSO_DATABASE_URL no está definida en .env — nada que respaldar.");
  process.exit(1);
}

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

async function main() {
  const tablesRes = await turso.execute(
    `select name from sqlite_master where type='table' and name not like 'sqlite_%' and name not like '_prisma%' order by name`,
  );
  const tables = tablesRes.rows.map((r) => r.name as string);

  const backup: Record<string, unknown[]> = {};
  let totalRows = 0;

  for (const table of tables) {
    const res = await turso.execute(`SELECT * FROM "${table}"`);
    backup[table] = res.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of res.columns) obj[col] = row[col];
      return obj;
    });
    totalRows += res.rows.length;
    console.log(`  ${table}: ${res.rows.length} filas`);
  }

  const outDir = process.env.BACKUP_OUT_DIR ?? join(process.cwd(), "..", "butakia-backups");
  mkdirSync(outDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outFile = join(outDir, `turso-backup-${timestamp}.json`);
  writeFileSync(outFile, JSON.stringify(backup, null, 2), "utf-8");

  console.log(`\nListo. ${tables.length} tablas, ${totalRows} filas respaldadas en:\n  ${outFile}`);
  turso.close();
}

main().catch((err) => {
  console.error("Falló el backup de Turso:", err);
  process.exit(1);
});
