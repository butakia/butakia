-- CreateTable
CREATE TABLE "ForumThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "franchise" TEXT,
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
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Title" ("addedAt", "ageRating", "backdrop", "badges", "cast", "country", "createdAt", "director", "duration", "featured", "featuredOrder", "franchise", "galleryCount", "genres", "hasTrailer", "id", "language", "originalTitle", "playback", "poster", "rating", "relatedSlugs", "slug", "sourceKind", "sourceValue", "status", "synopsis", "tags", "title", "trivia", "type", "updatedAt", "uploaderName", "views", "year") SELECT "addedAt", "ageRating", "backdrop", "badges", "cast", "country", "createdAt", "director", "duration", "featured", "featuredOrder", "franchise", "galleryCount", "genres", "hasTrailer", "id", "language", "originalTitle", "playback", "poster", "rating", "relatedSlugs", "slug", "sourceKind", "sourceValue", "status", "synopsis", "tags", "title", "trivia", "type", "updatedAt", "uploaderName", "views", "year" FROM "Title";
DROP TABLE "Title";
ALTER TABLE "new_Title" RENAME TO "Title";
CREATE UNIQUE INDEX "Title_slug_key" ON "Title"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
