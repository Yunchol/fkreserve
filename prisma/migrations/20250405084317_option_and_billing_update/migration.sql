/*
  Warnings:

  - You are about to drop the column `options` on the `Reservation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "time" TEXT,
    "lessonName" TEXT,
    "reservationId" TEXT NOT NULL,
    CONSTRAINT "Option_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillingSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "effectiveFrom" DATETIME NOT NULL,
    "basicPrices" JSONB NOT NULL,
    "spotPrices" JSONB NOT NULL,
    "optionPrices" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("childId", "createdAt", "date", "id", "type") SELECT "childId", "createdAt", "date", "id", "type" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
