-- CreateTable
CREATE TABLE "PremiumRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PremiumRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "premiumEnabled" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_SiteSettings" ("allowGuestPlayback", "donationSharePercent", "id", "paypalLink", "requireApproval", "siteName", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl") SELECT "allowGuestPlayback", "donationSharePercent", "id", "paypalLink", "requireApproval", "siteName", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "adminLevel" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("adminLevel", "createdAt", "email", "id", "isPremium", "name", "passwordHash", "role") SELECT "adminLevel", "createdAt", "email", "id", "isPremium", "name", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
