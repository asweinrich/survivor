/*
  Warnings:

  - A unique constraint covering the columns `[tribeName]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Player_tribeName_key" ON "Player"("tribeName");
