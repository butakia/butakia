-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookHighlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#fde047',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookHighlight_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BookHighlight" ("bookId", "chapterId", "createdAt", "endOffset", "id", "startOffset", "text", "userId") SELECT "bookId", "chapterId", "createdAt", "endOffset", "id", "startOffset", "text", "userId" FROM "BookHighlight";
DROP TABLE "BookHighlight";
ALTER TABLE "new_BookHighlight" RENAME TO "BookHighlight";
CREATE TABLE "new_ReaderPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'flip',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "fontSize" INTEGER NOT NULL DEFAULT 18,
    "lineHeight" REAL NOT NULL DEFAULT 1.5,
    "fontFamily" TEXT NOT NULL DEFAULT 'serif',
    "textWidth" TEXT NOT NULL DEFAULT 'normal',
    "textAlign" TEXT NOT NULL DEFAULT 'left',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ReaderPreference" ("fontFamily", "fontSize", "id", "lineHeight", "mode", "soundEnabled", "textWidth", "theme", "userId") SELECT "fontFamily", "fontSize", "id", "lineHeight", "mode", "soundEnabled", "textWidth", "theme", "userId" FROM "ReaderPreference";
DROP TABLE "ReaderPreference";
ALTER TABLE "new_ReaderPreference" RENAME TO "ReaderPreference";
CREATE UNIQUE INDEX "ReaderPreference_userId_key" ON "ReaderPreference"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
