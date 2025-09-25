import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { season: string } }
) {
  try {
    const { season } = context.params;
    const seasonInt = parseInt(season, 10);

    if (isNaN(seasonInt)) {
      return NextResponse.json({ message: 'Invalid season parameter' }, { status: 400 });
    }

    // Get all players who have playerTribes for this season
    const playerTribes = await prisma.playerTribe.findMany({
      where: { season: seasonInt },
      include: { player: true },
    });

    // Use a Map to dedupe players by id
    const playerMap = new Map<number, { id: number; email: string; name: string }>();
    playerTribes.forEach(pt => {
      if (pt.player) {
        playerMap.set(pt.player.id, {
          id: pt.player.id,
          email: pt.player.email,
          name: pt.player.name,
        });
      }
    });

    const players = Array.from(playerMap.values());

    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching fantasy players:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}