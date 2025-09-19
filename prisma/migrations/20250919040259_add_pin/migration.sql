-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" DATETIME,
    CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Announcement" ("authorId", "content", "createdAt", "id", "title") SELECT "authorId", "content", "createdAt", "id", "title" FROM "Announcement";
DROP TABLE "Announcement";
ALTER TABLE "new_Announcement" RENAME TO "Announcement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
