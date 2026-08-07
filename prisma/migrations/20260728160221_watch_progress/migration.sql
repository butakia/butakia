-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WatchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "titleId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WatchHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatchHistory_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WatchHistory" ("id", "profileId", "titleId", "userId", "viewedAt") SELECT "id", "profileId", "titleId", "userId", "viewedAt" FROM "WatchHistory";
DROP TABLE "WatchHistory";
ALTER TABLE "new_WatchHistory" RENAME TO "WatchHistory";
CREATE UNIQUE INDEX "WatchHistory_profileId_titleId_key" ON "WatchHistory"("profileId", "titleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
