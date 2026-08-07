-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarSeed" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "pinHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "titleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("createdAt", "id", "titleId", "userId") SELECT "createdAt", "id", "titleId", "userId" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE UNIQUE INDEX "Favorite_profileId_titleId_key" ON "Favorite"("profileId", "titleId");
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
    "maxProfilesFree" INTEGER NOT NULL DEFAULT 4
);
INSERT INTO "new_SiteSettings" ("allowGuestPlayback", "donationSharePercent", "id", "paypalLink", "premiumEnabled", "premiumPriceMonthly", "requireApproval", "siteName", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl") SELECT "allowGuestPlayback", "donationSharePercent", "id", "paypalLink", "premiumEnabled", "premiumPriceMonthly", "requireApproval", "siteName", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
CREATE TABLE "new_Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "titleId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("createdAt", "id", "titleId", "updatedAt", "userId", "value") SELECT "createdAt", "id", "titleId", "updatedAt", "userId", "value" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE UNIQUE INDEX "Vote_profileId_titleId_key" ON "Vote"("profileId", "titleId");
CREATE TABLE "new_WatchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "titleId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatchHistory_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WatchHistory" ("id", "titleId", "userId", "viewedAt") SELECT "id", "titleId", "userId", "viewedAt" FROM "WatchHistory";
DROP TABLE "WatchHistory";
ALTER TABLE "new_WatchHistory" RENAME TO "WatchHistory";
CREATE UNIQUE INDEX "WatchHistory_profileId_titleId_key" ON "WatchHistory"("profileId", "titleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
