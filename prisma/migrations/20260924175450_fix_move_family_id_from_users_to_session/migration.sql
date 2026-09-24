/*
  Warnings:

  - You are about to drop the column `familyId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "familyId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "familyId";
