/*
  Warnings:

  - Added the required column `season` to the `PlayerPick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerPick" ADD COLUMN     "season" TEXT NOT NULL;
