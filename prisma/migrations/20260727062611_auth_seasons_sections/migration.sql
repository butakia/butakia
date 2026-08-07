-- AlterTable
ALTER TABLE "PendingSubmission" ADD COLUMN "episodeNumber" INTEGER;
ALTER TABLE "PendingSubmission" ADD COLUMN "episodeTitle" TEXT;
ALTER TABLE "PendingSubmission" ADD COLUMN "seasonNumber" INTEGER;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT,
    CONSTRAINT "Season_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "thumbnail" TEXT,
    "sourceKind" TEXT,
    "sourceValue" TEXT,
    CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "genre" TEXT,
    "titleSlugs" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'Butakia',
    "paypalLink" TEXT,
    "yapeNumber" TEXT,
    "yapeQrUrl" TEXT,
    "allowGuestPlayback" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatarSeed" TEXT NOT NULL,
    "uploads" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TEXT NOT NULL,
    "badge" TEXT,
    "userId" TEXT,
    CONSTRAINT "Contributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contributor" ("avatarSeed", "badge", "id", "joinedAt", "name", "uploads") SELECT "avatarSeed", "badge", "id", "joinedAt", "name", "uploads" FROM "Contributor";
DROP TABLE "Contributor";
ALTER TABLE "new_Contributor" RENAME TO "Contributor";
CREATE UNIQUE INDEX "Contributor_userId_key" ON "Contributor"("userId");
CREATE TABLE "new_Title" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "duration" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "ageRating" TEXT,
    "country" TEXT,
    "language" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "synopsis" TEXT NOT NULL DEFAULT '',
    "poster" TEXT NOT NULL,
    "backdrop" TEXT NOT NULL,
    "badges" TEXT NOT NULL DEFAULT '[]',
    "director" TEXT,
    "cast" TEXT NOT NULL DEFAULT '[]',
    "hasTrailer" BOOLEAN NOT NULL DEFAULT false,
    "galleryCount" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TEXT,
    "relatedSlugs" TEXT NOT NULL DEFAULT '[]',
    "sourceKind" TEXT,
    "sourceValue" TEXT,
    "playback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Title" ("addedAt", "ageRating", "backdrop", "badges", "cast", "country", "createdAt", "director", "duration", "galleryCount", "genres", "hasTrailer", "id", "language", "originalTitle", "playback", "poster", "rating", "relatedSlugs", "slug", "sourceKind", "sourceValue", "status", "synopsis", "tags", "title", "type", "updatedAt", "views", "year") SELECT "addedAt", "ageRating", "backdrop", "badges", "cast", "country", "createdAt", "director", "duration", "galleryCount", "genres", "hasTrailer", "id", "language", "originalTitle", "playback", "poster", "rating", "relatedSlugs", "slug", "sourceKind", "sourceValue", "status", "synopsis", "tags", "title", "type", "updatedAt", "views", "year" FROM "Title";
DROP TABLE "Title";
ALTER TABLE "new_Title" RENAME TO "Title";
CREATE UNIQUE INDEX "Title_slug_key" ON "Title"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
