/*
  Warnings:

  - Changed the type of `season` on the `Contestant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `season` on the `PlayerTribe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Contestant" DROP COLUMN "season",
ADD COLUMN     "season" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlayerTribe" DROP COLUMN "season",
ADD COLUMN     "season" INTEGER NOT NULL;
