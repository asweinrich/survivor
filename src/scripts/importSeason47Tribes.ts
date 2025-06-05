import { PrismaClient } from '@prisma/client';
import season47Scores from '../app/scoring/47scores.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function importSeason47Tribes() {
  for (const tribe of season47Scores) {
    let player = await prisma.player.findUnique({
      where: { email: tribe.email },
    });

    if (!player) {
      player = await prisma.player.create({
        data: {
          email: tribe.email,
          name: tribe.playerName,
          passwordHash: '', // assuming you're not setting passwords now
          playerTribes: [],
        },
      });
      console.log(`Created new player for email: ${tribe.email}`);
    }

    await prisma.playerTribe.create({
      data: {
        tribeName: tribe.tribeName,
        emoji: tribe.emoji,
        color: tribe.color,
        tribeArray: tribe.tribeArray,
        pastScore: tribe.score, // renamed from "score"
        paid: tribe.paid,
        createdAt: new Date(tribe.createdAt),
        season: 47,
        player: {
          connect: { id: player.id },
        },
      },
    });

    console.log(`Created tribe ${tribe.tribeName} for ${tribe.email}`);
  }

  console.log('Finished seeding Season 47 tribes.');
}

importSeason47Tribes()
  .catch((err) => {
    console.error('Error inserting season 47 tribes:', err);
  })
  .finally(() => prisma.$disconnect());
