-- CreateTable
CREATE TABLE "Book" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BookChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookChapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RightsDeclaration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "policyVersion" TEXT NOT NULL DEFAULT 'v1',
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RightsDeclaration_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookFavorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookFavorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookFavorite_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookComment_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "bookId" TEXT NOT NULL,
    "chapterId" TEXT,
    "page" INTEGER NOT NULL DEFAULT 0,
    "percent" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingProgress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookReport_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingBookSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "synopsis" TEXT,
    "coverUrl" TEXT,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "payload" TEXT NOT NULL DEFAULT '{}',
    "submittedBy" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReaderPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'flip',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "fontSize" INTEGER NOT NULL DEFAULT 18,
    "lineHeight" REAL NOT NULL DEFAULT 1.5,
    "fontFamily" TEXT NOT NULL DEFAULT 'serif',
    "textWidth" TEXT NOT NULL DEFAULT 'normal',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE INDEX "BookChapter_bookId_order_idx" ON "BookChapter"("bookId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "RightsDeclaration_bookId_key" ON "RightsDeclaration"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookFavorite_profileId_bookId_key" ON "BookFavorite"("profileId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_profileId_bookId_key" ON "ReadingProgress"("profileId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReaderPreference_userId_key" ON "ReaderPreference"("userId");
