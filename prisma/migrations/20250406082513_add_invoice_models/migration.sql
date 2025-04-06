-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "breakdown" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "finalizedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "diff" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvoiceRevision_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Invoice_childId_month_idx" ON "Invoice"("childId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_childId_month_key" ON "Invoice"("childId", "month");

-- CreateIndex
CREATE INDEX "InvoiceRevision_childId_month_idx" ON "InvoiceRevision"("childId", "month");
