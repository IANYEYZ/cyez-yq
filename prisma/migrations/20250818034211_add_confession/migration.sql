-- CreateTable
CREATE TABLE "Confession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Confession_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfessionLike" (
    "confessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("confessionId", "userId"),
    CONSTRAINT "ConfessionLike_confessionId_fkey" FOREIGN KEY ("confessionId") REFERENCES "Confession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConfessionLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfessionReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "confessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfessionReport_confessionId_fkey" FOREIGN KEY ("confessionId") REFERENCES "Confession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConfessionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfessionReport_confessionId_userId_key" ON "ConfessionReport"("confessionId", "userId");
