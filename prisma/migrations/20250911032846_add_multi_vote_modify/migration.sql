/*
  Warnings:

  - A unique constraint covering the columns `[pollId,userId,optionId]` on the table `PollVote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PollVote_pollId_userId_key";

-- DropIndex
DROP INDEX "PollVote_optionId_idx";

-- CreateIndex
CREATE INDEX "PollVote_pollId_userId_idx" ON "PollVote"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_pollId_userId_optionId_key" ON "PollVote"("pollId", "userId", "optionId");
