-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tribeName" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPick" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "nonMerge" INTEGER[],
    "merge" INTEGER[],
    "top3" INTEGER[],
    "soleSurvivor" INTEGER,
    "removed" INTEGER,
    "immunityWins" INTEGER[],
    "tribalWins" INTEGER[],
    "hiddenIdols" INTEGER[],
    "rewards" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contestant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "hometown" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "tribes" TEXT[],
    "inPlay" BOOLEAN NOT NULL DEFAULT true,
    "madeMerge" BOOLEAN NOT NULL DEFAULT false,
    "top3" BOOLEAN NOT NULL DEFAULT false,
    "soleSurvivor" BOOLEAN NOT NULL DEFAULT false,
    "immunityWins" INTEGER NOT NULL DEFAULT 0,
    "tribalWins" INTEGER NOT NULL DEFAULT 0,
    "hiddenIdols" INTEGER NOT NULL DEFAULT 0,
    "rewards" INTEGER NOT NULL DEFAULT 0,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "voteOutOrder" INTEGER,

    CONSTRAINT "Contestant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- AddForeignKey
ALTER TABLE "PlayerPick" ADD CONSTRAINT "PlayerPick_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
