-- AlterTable
ALTER TABLE "Contributor" ADD COLUMN "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "HomeSection" ADD COLUMN "franchise" TEXT;

-- AlterTable
ALTER TABLE "Title" ADD COLUMN "franchise" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "adminLevel" TEXT;

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PendingSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "playerLink" TEXT NOT NULL,
    "description" TEXT,
    "posterUrl" TEXT,
    "backdropUrl" TEXT,
    "seasonNumber" INTEGER,
    "episodeNumber" INTEGER,
    "episodeTitle" TEXT,
    "director" TEXT,
    "cast" TEXT NOT NULL DEFAULT '[]',
    "year" INTEGER,
    "country" TEXT,
    "language" TEXT,
    "duration" TEXT,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "franchise" TEXT,
    "previewConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "submittedBy" TEXT NOT NULL DEFAULT 'Anónimo',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PendingSubmission" ("backdropUrl", "description", "episodeNumber", "episodeTitle", "id", "playerLink", "posterUrl", "seasonNumber", "submittedAt", "submittedBy", "title", "type") SELECT "backdropUrl", "description", "episodeNumber", "episodeTitle", "id", "playerLink", "posterUrl", "seasonNumber", "submittedAt", "submittedBy", "title", "type" FROM "PendingSubmission";
DROP TABLE "PendingSubmission";
ALTER TABLE "new_PendingSubmission" RENAME TO "PendingSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_contributorId_key" ON "Follow"("userId", "contributorId");
