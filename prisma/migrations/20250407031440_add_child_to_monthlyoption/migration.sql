-- CreateTable
CREATE TABLE "MonthlyOptionUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "optionType" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "basicUsageId" TEXT,
    CONSTRAINT "MonthlyOptionUsage_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MonthlyOptionUsage_basicUsageId_fkey" FOREIGN KEY ("basicUsageId") REFERENCES "BasicUsage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MonthlyOptionUsage_childId_month_idx" ON "MonthlyOptionUsage"("childId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyOptionUsage_childId_month_optionType_key" ON "MonthlyOptionUsage"("childId", "month", "optionType");
