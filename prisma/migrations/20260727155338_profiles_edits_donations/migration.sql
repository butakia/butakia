-- AlterTable
ALTER TABLE "Contributor" ADD COLUMN "bio" TEXT;
ALTER TABLE "Contributor" ADD COLUMN "country" TEXT;
ALTER TABLE "Contributor" ADD COLUMN "nameChangedAt" DATETIME;
ALTER TABLE "Contributor" ADD COLUMN "socialLink" TEXT;

-- AlterTable
ALTER TABLE "HomeSection" ADD COLUMN "baseTitleSlug" TEXT;

-- AlterTable
ALTER TABLE "PendingSubmission" ADD COLUMN "backdropUrl" TEXT;
ALTER TABLE "PendingSubmission" ADD COLUMN "posterUrl" TEXT;

-- CreateTable
CREATE TABLE "EditSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleId" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EditSuggestion_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "uploadGoal" INTEGER NOT NULL DEFAULT 50
);
INSERT INTO "new_SiteSettings" ("allowGuestPlayback", "id", "paypalLink", "requireApproval", "siteName", "yapeNumber", "yapeQrUrl") SELECT "allowGuestPlayback", "id", "paypalLink", "requireApproval", "siteName", "yapeNumber", "yapeQrUrl" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
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
    "trivia" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'published',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "uploaderName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Title" ("addedAt", "ageRating", "backdrop", "badges", "cast", "country", "createdAt", "director", "duration", "featured", "featuredOrder", "galleryCount", "genres", "hasTrailer", "id", "language", "originalTitle", "playback", "poster", "rating", "relatedSlugs", "slug", "sourceKind", "sourceValue", "status", "synopsis", "tags", "title", "type", "updatedAt", "uploaderName", "views", "year") SELECT "addedAt", "ageRating", "backdrop", "badges", "cast", "country", "createdAt", "director", "duration", "featured", "featuredOrder", "galleryCount", "genres", "hasTrailer", "id", "language", "originalTitle", "playback", "poster", "rating", "relatedSlugs", "slug", "sourceKind", "sourceValue", "status", "synopsis", "tags", "title", "type", "updatedAt", "uploaderName", "views", "year" FROM "Title";
DROP TABLE "Title";
ALTER TABLE "new_Title" RENAME TO "Title";
CREATE UNIQUE INDEX "Title_slug_key" ON "Title"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
