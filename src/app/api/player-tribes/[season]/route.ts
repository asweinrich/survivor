import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await params;
    console.log(season)

    const seasonInt = parseInt(season, 10);

    if (isNaN(seasonInt)) {
      return NextResponse.json({ message: 'Invalid season parameter' }, { status: 400 });
    }

    // Fetch PlayerTribes for the specified season
    const playerTribes = await prisma.playerTribe.findMany({
      where: { season: seasonInt },
      orderBy: {
        createdAt: 'asc',  // Order by creation date in ascending order
      },
    });

    // Fetch all players and find the matching player for each tribe
    const players = await prisma.player.findMany();

    const playerTribesWithPlayer = playerTribes.map((tribe) => {
      const player = players.find((player) => player.playerTribes.includes(tribe.id));

      return {
        id: tribe.id,
        tribeName: tribe.tribeName,
        color: tribe.color,
        emoji: tribe.emoji,
        tribeArray: tribe.tribeArray,
        createdAt: tribe.createdAt,
        playerName: player ? player.name : 'Unknown Player',
        paid: tribe.paid,
      };
    });

    return NextResponse.json(playerTribesWithPlayer);
  } catch (error) {
    console.error('Error fetching PlayerTribes:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
