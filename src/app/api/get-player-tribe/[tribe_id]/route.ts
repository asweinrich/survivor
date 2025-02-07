import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ tribe_id: string }> }) {
  try {
    const { tribe_id } = await params;
    console.log(tribe_id)

    const tribeInt = parseInt(tribe_id, 10);

    if (isNaN(tribeInt)) {
      return NextResponse.json({ message: 'Invalid tribe parameter' }, { status: 400 });
    }

    // Fetch PlayerTribes for the specified season
    const playerTribes = await prisma.playerTribe.findMany({
      where: { id: tribeInt },
    });

    // Fetch all players and find the matching player for each tribe
    const players = await prisma.player.findMany();

    const playerTribesWithPlayerAndContestants = await Promise.all(
      playerTribes.map(async (tribe) => {
        const player = players.find((player) => player.playerTribes.includes(tribe.id));

        // Fetch contestant details for tribeArray
        const contestants = await prisma.contestant.findMany({
          where: {
            id: {
              in: tribe.tribeArray,
            },
          },
          select: {
            id: true,
            name: true,
            img: true,
            tribes: true, // Assuming contestants have a `tribes` field for their show tribes
            profession: true,
          },
        });

        return {
          id: tribe.id,
          tribeName: tribe.tribeName,
          color: tribe.color,
          emoji: tribe.emoji,
          tribeArray: tribe.tribeArray,
          contestants: contestants.map((contestant) => ({
            id: contestant.id,
            name: contestant.name,
            img: contestant.img,
            tribes: contestant.tribes,
            profession: contestant.profession,
          })),
          createdAt: tribe.createdAt,
          playerName: player ? player.name : 'Unknown Player',
        };
      })
    );

    return NextResponse.json(playerTribesWithPlayerAndContestants);
  } catch (error) {
    console.error('Error fetching PlayerTribes:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}