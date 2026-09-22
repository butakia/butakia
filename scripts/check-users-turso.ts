// Read-only check: lists admin users and looks up specific emails in production.
// Usage: npx tsx scripts/check-users-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

const turso = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  const admins = await turso.execute(`SELECT id, email, name, role, adminLevel FROM "User" WHERE role = 'admin'`);
  console.log("Admins actuales:", admins.rows);

  const emails = ["butakia1@gmail.com", "omaroliden1@gmail.com"];
  for (const email of emails) {
    const res = await turso.execute({
      sql: `SELECT id, email, name, role, adminLevel FROM "User" WHERE email = ?`,
      args: [email],
    });
    console.log(`${email}:`, res.rows[0] ?? "NO EXISTE");
  }
  turso.close();
}
main();
