/*
  Warnings:

  - A unique constraint covering the columns `[githubRepoId]` on the table `Stack` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubOwnerId]` on the table `Stack` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Stack" ADD COLUMN     "githubOwnerId" TEXT,
ADD COLUMN     "githubRepoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Stack_githubRepoId_key" ON "public"."Stack"("githubRepoId");

-- CreateIndex
CREATE UNIQUE INDEX "Stack_githubOwnerId_key" ON "public"."Stack"("githubOwnerId");
