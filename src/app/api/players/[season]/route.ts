import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await params;

    if (!season) {
      return NextResponse.json({ error: 'Season parameter is required' }, { status: 400 });
    }

    console.log(`Fetching players for season: ${season}`); // Debug log

    // Fetch players and their picks for the given season
    const playerPicks = await prisma.contestant.findMany({
      where: { season },
      orderBy: [
        { voteOutOrder: { sort: 'desc', nulls: 'first' } }, // Vote-out order (nulls last)
        { inPlay: 'desc' },                              // In-play contestants first
        { name: 'asc' },                                 // Alphabetical order by name
      ],
    });

    console.log(`Query result:`, playerPicks);

    if (!playerPicks || playerPicks.length === 0) {
      return NextResponse.json({ error: 'No picks found for this season' }, { status: 404 });
    }

    if (playerPicks) {
      return NextResponse.json(playerPicks);
    } else {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
