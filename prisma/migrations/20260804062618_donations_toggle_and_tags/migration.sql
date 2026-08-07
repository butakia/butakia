-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#e50914',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "badges" TEXT NOT NULL DEFAULT '[]',
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
INSERT INTO "new_Book" ("authorId", "authorName", "categories", "contentType", "cover", "createdAt", "featured", "featuredOrder", "genres", "id", "isFree", "isbn", "language", "literaryAuthorId", "pageCount", "pdfUrl", "publisher", "rating", "readCount", "seoDescription", "seoKeywords", "seoTitle", "showUploader", "slug", "sourceKind", "status", "subtitle", "synopsis", "tags", "title", "updatedAt", "uploaderId", "uploaderName", "views", "wordCount", "year") SELECT "authorId", "authorName", "categories", "contentType", "cover", "createdAt", "featured", "featuredOrder", "genres", "id", "isFree", "isbn", "language", "literaryAuthorId", "pageCount", "pdfUrl", "publisher", "rating", "readCount", "seoDescription", "seoKeywords", "seoTitle", "showUploader", "slug", "sourceKind", "status", "subtitle", "synopsis", "tags", "title", "updatedAt", "uploaderId", "uploaderName", "views", "wordCount", "year" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'Butakia',
    "paypalLink" TEXT,
    "yapeNumber" TEXT,
    "yapeQrUrl" TEXT,
    "allowGuestPlayback" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "totalDonations" REAL NOT NULL DEFAULT 0,
    "donationSharePercent" REAL NOT NULL DEFAULT 10,
    "uploadGoal" INTEGER NOT NULL DEFAULT 50,
    "thankYouMessage" TEXT NOT NULL DEFAULT '¡Gracias por tu aporte a la comunidad! Sigue subiendo contenido para desbloquear más insignias.',
    "premiumPriceMonthly" REAL NOT NULL DEFAULT 4.99,
    "premiumEnabled" BOOLEAN NOT NULL DEFAULT true,
    "profilesPremiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "maxProfilesFree" INTEGER NOT NULL DEFAULT 4,
    "accentColor" TEXT NOT NULL DEFAULT '#e50914',
    "siteTagline" TEXT NOT NULL DEFAULT '',
    "librosTagline" TEXT NOT NULL DEFAULT 'Libros',
    "librosHeroMessage" TEXT NOT NULL DEFAULT '',
    "adsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "donationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "fakeVisitorsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fakeVisitorsMin" INTEGER NOT NULL DEFAULT 20,
    "fakeVisitorsMax" INTEGER NOT NULL DEFAULT 50
);
INSERT INTO "new_SiteSettings" ("accentColor", "adsEnabled", "allowGuestPlayback", "donationSharePercent", "fakeVisitorsEnabled", "fakeVisitorsMax", "fakeVisitorsMin", "id", "librosHeroMessage", "librosTagline", "maxProfilesFree", "paypalLink", "premiumEnabled", "premiumPriceMonthly", "profilesPremiumOnly", "requireApproval", "siteName", "siteTagline", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl") SELECT "accentColor", "adsEnabled", "allowGuestPlayback", "donationSharePercent", "fakeVisitorsEnabled", "fakeVisitorsMax", "fakeVisitorsMin", "id", "librosHeroMessage", "librosTagline", "maxProfilesFree", "paypalLink", "premiumEnabled", "premiumPriceMonthly", "profilesPremiumOnly", "requireApproval", "siteName", "siteTagline", "thankYouMessage", "totalDonations", "uploadGoal", "yapeNumber", "yapeQrUrl" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");
