-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'Butakia',
    "paypalLink" TEXT,
    "yapeNumber" TEXT,
    "yapeQrUrl" TEXT,
    "allowGuestPlayback" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "totalDonations" REAL NOT NULL DEFAULT 0,
    "donationSharePercent" REAL NOT NULL DEFAULT 10,
    "uploadGoal" INTEGER NOT NULL DEFAULT 50,
    "thankYouMessage" TEXT NOT NULL DEFAULT '¡Gracias por tu aporte a la comunidad! Sigue subiendo contenido para desbloquear más insignias.',
    "premiumPriceMonthly" REAL NOT NULL DEFAULT 4.99,
    "premiumEnabled" BOOLEAN NOT NULL DEFAULT true,
    "profilesPremiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "maxProfilesFree" INTEGER NOT NULL DEFAULT 4,
    "accentColor" TEXT NOT NULL DEFAULT '#e50914',
    "siteTagline" TEXT NOT NULL DEFAULT '',
    "librosTagline" TEXT NOT NULL DEFAULT 'Libros',
    "librosHeroMessage" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_SiteSettings" ("allowGuestPlayback", "donationSharePercent", "id", "maxProfilesFree", "paypalLink", "premiumEnabled", "premiumPriceMonthly", "profilesPremiumOnly", "requireApproval", "siteName", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl") SELECT "allowGuestPlayback", "donationSharePercent", "id", "maxProfilesFree", "paypalLink", "premiumEnabled", "premiumPriceMonthly", "profilesPremiumOnly", "requireApproval", "siteName", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
