/*
  Warnings:

  - You are about to drop the column `effectiveFrom` on the `BillingSetting` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `BillingSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `BillingSetting` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BasicUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "weeklyCount" INTEGER NOT NULL,
    "weekdays" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BasicUsage_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BillingSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "basicPrices" JSONB NOT NULL,
    "spotPrices" JSONB NOT NULL,
    "optionPrices" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BillingSetting" ("basicPrices", "createdAt", "id", "optionPrices", "spotPrices") SELECT "basicPrices", "createdAt", "id", "optionPrices", "spotPrices" FROM "BillingSetting";
DROP TABLE "BillingSetting";
ALTER TABLE "new_BillingSetting" RENAME TO "BillingSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BasicUsage_childId_month_key" ON "BasicUsage"("childId", "month");

-- CreateIndex
CREATE INDEX "Reservation_date_idx" ON "Reservation"("date");

-- CreateIndex
CREATE INDEX "Reservation_childId_date_idx" ON "Reservation"("childId", "date");
