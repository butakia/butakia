-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForumThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorId" TEXT,
    "section" TEXT NOT NULL DEFAULT 'movies',
    "category" TEXT NOT NULL DEFAULT 'general',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ForumThread" ("authorId", "authorName", "body", "category", "createdAt", "id", "pinned", "title") SELECT "authorId", "authorName", "body", "category", "createdAt", "id", "pinned", "title" FROM "ForumThread";
DROP TABLE "ForumThread";
ALTER TABLE "new_ForumThread" RENAME TO "ForumThread";
CREATE INDEX "ForumThread_section_idx" ON "ForumThread"("section");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
