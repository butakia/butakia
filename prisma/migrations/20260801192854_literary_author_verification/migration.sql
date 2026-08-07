-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LiteraryAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "trajectory" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LiteraryAuthor" ("bio", "createdAt", "id", "name", "photoUrl", "slug", "updatedAt") SELECT "bio", "createdAt", "id", "name", "photoUrl", "slug", "updatedAt" FROM "LiteraryAuthor";
DROP TABLE "LiteraryAuthor";
ALTER TABLE "new_LiteraryAuthor" RENAME TO "LiteraryAuthor";
CREATE UNIQUE INDEX "LiteraryAuthor_slug_key" ON "LiteraryAuthor"("slug");
CREATE UNIQUE INDEX "LiteraryAuthor_userId_key" ON "LiteraryAuthor"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
