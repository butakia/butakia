-- CreateTable
CREATE TABLE "BookSaleInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "priceUsd" REAL,
    "commercialDesc" TEXT,
    "discountAllowed" BOOLEAN NOT NULL DEFAULT false,
    "promotionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',
    "adminObservations" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookSaleInfo_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "priceUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookOrder_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookEntitlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BookSaleInfo_bookId_key" ON "BookSaleInfo"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookEntitlement_userId_bookId_key" ON "BookEntitlement"("userId", "bookId");
