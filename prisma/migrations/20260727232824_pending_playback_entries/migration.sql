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
    "playbackEntries" TEXT NOT NULL DEFAULT '[]',
    "submittedBy" TEXT NOT NULL DEFAULT 'Anónimo',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PendingSubmission" ("backdropUrl", "cast", "country", "description", "director", "duration", "episodeNumber", "episodeTitle", "franchise", "genres", "id", "language", "playerLink", "posterUrl", "previewConfirmed", "seasonNumber", "submittedAt", "submittedBy", "title", "type", "year") SELECT "backdropUrl", "cast", "country", "description", "director", "duration", "episodeNumber", "episodeTitle", "franchise", "genres", "id", "language", "playerLink", "posterUrl", "previewConfirmed", "seasonNumber", "submittedAt", "submittedBy", "title", "type", "year" FROM "PendingSubmission";
DROP TABLE "PendingSubmission";
ALTER TABLE "new_PendingSubmission" RENAME TO "PendingSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
