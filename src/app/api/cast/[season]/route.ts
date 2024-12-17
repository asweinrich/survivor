import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { season: string } } // Use explicit context typing
) {
  try {
    const { season } = context.params;

    if (!season) {
      return NextResponse.json({ error: 'Season parameter is required' }, { status: 400 });
    }

    const seasonInt = parseInt(season, 10);

    if (isNaN(seasonInt)) {
      return NextResponse.json({ error: 'Invalid season parameter' }, { status: 400 });
    }

    console.log(`Fetching contestants for season: ${seasonInt}`);

    const contestants = await prisma.contestant.findMany({
      where: { season: seasonInt },
      orderBy: [
        { voteOutOrder: { sort: 'desc', nulls: 'first' } },
        { name: 'asc' },
        { inPlay: 'desc' },
      ],
    });

    if (!contestants || contestants.length === 0) {
      return NextResponse.json({ error: 'No contestants found' }, { status: 404 });
    }

    return NextResponse.json(contestants);
  } catch (error) {
    console.error('Error fetching contestants:', error);
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
