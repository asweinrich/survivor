/*
  Warnings:

  - You are about to drop the column `removed` on the `Contestant` table. All the data in the column will be lost.
  - The `tribes` column on the `Contestant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `color` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `tribeName` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the `PlayerPick` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerPick" DROP CONSTRAINT "PlayerPick_playerId_fkey";

-- DropIndex
DROP INDEX "Player_tribeName_key";

-- AlterTable
ALTER TABLE "Contestant" DROP COLUMN "removed",
ADD COLUMN     "advantates" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "episodes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "madeFire" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "tribes",
ADD COLUMN     "tribes" INTEGER[];

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "color",
DROP COLUMN "tribeName",
ADD COLUMN     "playerTribes" INTEGER[];

-- DropTable
DROP TABLE "PlayerPick";

-- CreateTable
CREATE TABLE "PlayerTribe" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "tribeName" TEXT NOT NULL,
    "tribe" INTEGER[],
    "color" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "season" TEXT NOT NULL,

    CONSTRAINT "PlayerTribe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowTribe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowTribe_pkey" PRIMARY KEY ("id")
);
