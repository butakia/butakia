-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contributorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "titleIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Playlist_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Franchise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "thankYouMessage" TEXT NOT NULL DEFAULT '¡Gracias por tu aporte a la comunidad! Sigue subiendo contenido para desbloquear más insignias.'
);
INSERT INTO "new_SiteSettings" ("allowGuestPlayback", "donationSharePercent", "id", "paypalLink", "requireApproval", "siteName", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl") SELECT "allowGuestPlayback", "donationSharePercent", "id", "paypalLink", "requireApproval", "siteName", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_name_key" ON "Franchise"("name");
