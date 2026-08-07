-- CreateTable
CREATE TABLE "SiteVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SiteVisit_createdAt_idx" ON "SiteVisit"("createdAt");
