import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { season: number } }) {
  try {
    const seasonInt = parseInt(params.season, 10);

    if (isNaN(seasonInt)) {
      return NextResponse.json({ error: 'Invalid season parameter' }, { status: 400 });
    }

    console.log(`Fetching contestants for season: ${seasonInt}`); // Debug log

    // Fetch contestants sorted by voteOutOrder (nulls last), then by name and inPlay
    const contestants = await prisma.contestant.findMany({
      where: { season: seasonInt },
      orderBy: [
        { voteOutOrder: { sort: 'desc', nulls: 'first' } }, // Vote-out order (nulls last)
        { name: 'asc' },                                   // Alphabetical order
        { inPlay: 'desc' },                                // In-play contestants first
      ],
    });

    console.log('Contestants:', contestants); // Log fetched data for debugging

    if (!contestants || contestants.length === 0) {
      return NextResponse.json({ error: 'No contestants found for this season' }, { status: 404 });
    }

    return NextResponse.json(contestants);
  } catch (error) {
    console.error('Error fetching contestants:', error);
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 });
  }
}
