-- AlterTable
ALTER TABLE "Title" ADD COLUMN "uploaderName" TEXT;

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
