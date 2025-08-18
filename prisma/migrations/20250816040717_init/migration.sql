/*
  Warnings:

  - You are about to drop the column `userId` on the `Stack` table. All the data in the column will be lost.
  - Added the required column `clerkId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `Stack` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_stackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stack" DROP CONSTRAINT "Stack_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "clerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Stack" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "files" JSONB,
ADD COLUMN     "template" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Stack" ADD CONSTRAINT "Stack_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "public"."Stack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
