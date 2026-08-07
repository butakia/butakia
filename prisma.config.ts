import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma's migrate/db CLI can't speak the libsql:// wire protocol (only the
    // runtime driver adapter in src/lib/prisma.ts can), so this must always stay
    // pointed at the local SQLite file — Turso is kept in sync separately via
    // scripts/sync-turso.ts.
    url: env("DATABASE_URL"),
  },
});