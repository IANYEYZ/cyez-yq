/*
  Warnings:

  - You are about to alter the column `amountCents` on the `ClassFundTransaction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassFundTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amountCents" BIGINT NOT NULL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "ClassFundTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClassFundTransaction" ("amountCents", "createdAt", "createdById", "id", "memo") SELECT "amountCents", "createdAt", "createdById", "id", "memo" FROM "ClassFundTransaction";
DROP TABLE "ClassFundTransaction";
ALTER TABLE "new_ClassFundTransaction" RENAME TO "ClassFundTransaction";
CREATE INDEX "ClassFundTransaction_createdAt_idx" ON "ClassFundTransaction"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
