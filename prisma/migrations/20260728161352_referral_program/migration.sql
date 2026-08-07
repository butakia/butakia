-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "adminLevel" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "securityQuestion1" TEXT,
    "securityAnswer1Hash" TEXT,
    "securityQuestion2" TEXT,
    "securityAnswer2Hash" TEXT,
    "referralCode" TEXT,
    "referredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("adminLevel", "avatarUrl", "createdAt", "email", "googleId", "id", "isPremium", "name", "passwordHash", "role", "securityAnswer1Hash", "securityAnswer2Hash", "securityQuestion1", "securityQuestion2") SELECT "adminLevel", "avatarUrl", "createdAt", "email", "googleId", "id", "isPremium", "name", "passwordHash", "role", "securityAnswer1Hash", "securityAnswer2Hash", "securityQuestion1", "securityQuestion2" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
