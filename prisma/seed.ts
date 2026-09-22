import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.notification.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.contributor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSettings.deleteMany();

  const contributors = [
    {
      name: "LectorVoraz_MX",
      avatarSeed: "lector-voraz",
      bookUploads: 42,
      joinedAt: "2025-02-14",
      badge: "gold",
      bio: "Publico novelas y cuentos cortos casi todas las semanas.",
      country: "México",
      socialLink: "https://instagram.com/lectorvoraz_mx",
    },
    { name: "PoetaDeBarrio", avatarSeed: "poeta-barrio", bookUploads: 28, joinedAt: "2025-03-01", badge: "gold" },
    { name: "ElCuratorLibros", avatarSeed: "curator-libros", bookUploads: 25, joinedAt: "2025-01-22", badge: "gold" },
    { name: "CuentosYMas", avatarSeed: "cuentos-mas", bookUploads: 18, joinedAt: "2025-04-10", badge: "silver" },
    { name: "RetroLecturas88", avatarSeed: "retro-lecturas", bookUploads: 16, joinedAt: "2025-02-28", badge: "silver" },
    { name: "LatinoLetras", avatarSeed: "latino-letras", bookUploads: 13, joinedAt: "2025-05-16", badge: "silver" },
    { name: "NightOwlWriter", avatarSeed: "night-owl", bookUploads: 9, joinedAt: "2025-06-03", badge: "bronze" },
    { name: "ClubDeLectura", avatarSeed: "club-lectura", bookUploads: 7, joinedAt: "2025-06-20", badge: "bronze" },
    { name: "NovelaCorta", avatarSeed: "novela-corta", bookUploads: 5, joinedAt: "2025-07-01", badge: "bronze" },
    { name: "Usuario_Nuevo7", avatarSeed: "usuario-nuevo7", bookUploads: 1, joinedAt: "2026-07-15", badge: null },
  ];

  for (const c of contributors) {
    await prisma.contributor.create({ data: c });
  }

  const adminPasswordHash = await bcrypt.hash("butakia2026", 10);
  await prisma.user.create({
    data: {
      email: "admin@butakia.com",
      passwordHash: adminPasswordHash,
      name: "Admin Butakia",
      role: "admin",
      adminLevel: "full",
      isPremium: true,
    },
  });

  const demoPasswordHash = await bcrypt.hash("demo1234", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@butakia.com",
      passwordHash: demoPasswordHash,
      name: "LectorVoraz_MX",
      role: "user",
      isPremium: true,
    },
  });

  const lector = await prisma.contributor.findFirst({
    where: { name: "LectorVoraz_MX" },
  });
  if (lector) {
    await prisma.contributor.update({
      where: { id: lector.id },
      data: { userId: demoUser.id },
    });
  }

  await prisma.siteSettings.create({
    data: {
      id: "singleton",
      siteName: "Butakia",
      paypalLink: "https://paypal.me/butakia",
      yapeNumber: "987 654 321",
      yapeQrUrl: "",
      totalDonations: 1250.5,
      donationSharePercent: 10,
      uploadGoal: 50,
      thankYouMessage:
        "¡Gracias por tu aporte! Gracias a colaboradores como tú, Butakia sigue creciendo. Sigue subiendo libros para desbloquear más insignias y comisión.",
    },
  });

  console.log("Seed completado.");
  console.log("Admin: admin@butakia.com / butakia2026");
  console.log("Usuario demo: demo@butakia.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
