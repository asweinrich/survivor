import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {

    // Unpack the season parameter
    const { season } = await params;
    const seasonInt = parseInt(season, 10);
    if (isNaN(seasonInt)) {
      return NextResponse.json({ error: 'Invalid season parameter' }, { status: 400 });
    }

    console.log(`Fetching recaps for season: ${seasonInt}`); // Debug log

    // Fetch contestants sorted by voteOutOrder (nulls last), then by name and inPlay
    const recaps = await prisma.weeklyRecap.findMany({
      where: { season: seasonInt },
      orderBy: [
        { week: 'asc' },
      ],
    });

    if (!recaps || recaps.length === 0) {
      return NextResponse.json({ error: 'No recaps found for this season' }, { status: 404 });
    }

    return NextResponse.json(recaps);
  } catch (error) {
    console.error('Error fetching recaps:', error);
    return NextResponse.json({ error: 'Failed to fetch recaps' }, { status: 500 });
  }
}
