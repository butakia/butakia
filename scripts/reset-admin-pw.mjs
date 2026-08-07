import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const passwordHash = await bcrypt.hash("dev12345", 10);
await prisma.user.update({ where: { email: "admin@butakia.com" }, data: { passwordHash } });
console.log("Password reset to dev12345 for admin@butakia.com");
await prisma.$disconnect();
