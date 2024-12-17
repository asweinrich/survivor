/*
  Warnings:

  - You are about to drop the column `advantates` on the `Contestant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contestant" DROP COLUMN "advantates",
ADD COLUMN     "advantages" INTEGER NOT NULL DEFAULT 0;
