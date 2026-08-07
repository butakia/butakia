-- CreateTable
CREATE TABLE "Title" (
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
    "hasTrailer" BOOLEAN NOT NULL DEFAULT false,
    "galleryCount" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TEXT,
    "relatedSlugs" TEXT NOT NULL DEFAULT '[]',
    "sourceKind" TEXT,
    "sourceValue" TEXT,
    "playback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatarSeed" TEXT NOT NULL,
    "uploads" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TEXT NOT NULL,
    "badge" TEXT
);

-- CreateTable
CREATE TABLE "PendingSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "playerLink" TEXT NOT NULL,
    "description" TEXT,
    "submittedBy" TEXT NOT NULL DEFAULT 'Anónimo',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Title_slug_key" ON "Title"("slug");
