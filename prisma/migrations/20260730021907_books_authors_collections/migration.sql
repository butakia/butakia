-- CreateTable
CREATE TABLE "BookCollection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bookIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "authorName" TEXT NOT NULL,
    "authorId" TEXT,
    "publisher" TEXT,
    "year" INTEGER,
    "language" TEXT,
    "isbn" TEXT,
    "synopsis" TEXT NOT NULL DEFAULT '',
    "cover" TEXT NOT NULL,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "categories" TEXT NOT NULL DEFAULT '[]',
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "sourceKind" TEXT NOT NULL DEFAULT 'native',
    "pdfUrl" TEXT,
    "pageCount" INTEGER,
    "wordCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "uploaderId" TEXT NOT NULL,
    "uploaderName" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Contributor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("authorId", "authorName", "categories", "contentType", "cover", "createdAt", "featured", "featuredOrder", "genres", "id", "isFree", "isbn", "language", "pageCount", "pdfUrl", "publisher", "rating", "readCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "sourceKind", "status", "subtitle", "synopsis", "tags", "title", "updatedAt", "uploaderId", "uploaderName", "views", "wordCount", "year") SELECT "authorId", "authorName", "categories", "contentType", "cover", "createdAt", "featured", "featuredOrder", "genres", "id", "isFree", "isbn", "language", "pageCount", "pdfUrl", "publisher", "rating", "readCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "sourceKind", "status", "subtitle", "synopsis", "tags", "title", "updatedAt", "uploaderId", "uploaderName", "views", "wordCount", "year" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");
CREATE TABLE "new_Contributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatarSeed" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "uploads" INTEGER NOT NULL DEFAULT 0,
    "bookUploads" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TEXT NOT NULL,
    "badge" TEXT,
    "bio" TEXT,
    "country" TEXT,
    "socialLink" TEXT,
    "nameChangedAt" DATETIME,
    "userId" TEXT,
    CONSTRAINT "Contributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contributor" ("avatarSeed", "avatarUrl", "badge", "bio", "country", "id", "joinedAt", "name", "nameChangedAt", "socialLink", "uploads", "userId") SELECT "avatarSeed", "avatarUrl", "badge", "bio", "country", "id", "joinedAt", "name", "nameChangedAt", "socialLink", "uploads", "userId" FROM "Contributor";
DROP TABLE "Contributor";
ALTER TABLE "new_Contributor" RENAME TO "Contributor";
CREATE UNIQUE INDEX "Contributor_userId_key" ON "Contributor"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
