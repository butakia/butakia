-- CreateTable
CREATE TABLE "LiteraryAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BookHighlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookHighlight_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "literaryAuthorId" TEXT,
    "showUploader" BOOLEAN NOT NULL DEFAULT true,
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
    CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Contributor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_literaryAuthorId_fkey" FOREIGN KEY ("literaryAuthorId") REFERENCES "LiteraryAuthor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("authorId", "authorName", "categories", "contentType", "cover", "createdAt", "featured", "featuredOrder", "genres", "id", "isFree", "isbn", "language", "pageCount", "pdfUrl", "publisher", "rating", "readCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "sourceKind", "status", "subtitle", "synopsis", "tags", "title", "updatedAt", "uploaderId", "uploaderName", "views", "wordCount", "year") SELECT "authorId", "authorName", "categories", "contentType", "cover", "createdAt", "featured", "featuredOrder", "genres", "id", "isFree", "isbn", "language", "pageCount", "pdfUrl", "publisher", "rating", "readCount", "seoDescription", "seoKeywords", "seoTitle", "slug", "sourceKind", "status", "subtitle", "synopsis", "tags", "title", "updatedAt", "uploaderId", "uploaderName", "views", "wordCount", "year" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LiteraryAuthor_slug_key" ON "LiteraryAuthor"("slug");
