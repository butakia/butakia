// One-off: grants full admin role to specific existing users in production, by
// email. Does not create accounts or touch passwords — only flips role/adminLevel
// on User rows that already exist.
// Usage: npx tsx scripts/grant-admin-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const EMAILS = ["butakia1@gmail.com", "omaroliden1@gmail.com"];

const turso = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  for (const email of EMAILS) {
    const before = await turso.execute({ sql: `SELECT id, role, adminLevel FROM "User" WHERE email = ?`, args: [email] });
    if (!before.rows[0]) {
      console.log(`${email}: no existe, se omite.`);
      continue;
    }
    await turso.execute({
      sql: `UPDATE "User" SET role = 'admin', adminLevel = 'full' WHERE email = ?`,
      args: [email],
    });
    const after = await turso.execute({ sql: `SELECT id, email, role, adminLevel FROM "User" WHERE email = ?`, args: [email] });
    console.log(`${email}:`, after.rows[0]);
  }
  turso.close();
}
main();
