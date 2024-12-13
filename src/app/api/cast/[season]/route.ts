import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await params;

    console.log(`Fetching contestants for season: ${season}`); // Debug log

    // Fetch contestants sorted by voteOutOrder (nulls last), then by inPlay and name
    const contestants = await prisma.contestant.findMany({
      where: { season },
      orderBy: [
        { voteOutOrder: { sort: 'desc', nulls: 'first' } }, // Vote-out order (nulls last)
        { inPlay: 'desc' },                              // In-play contestants first
        { name: 'asc' },                                 // Alphabetical order by name
      ],
    });

    return NextResponse.json(contestants);
  } catch (error) {
    console.error('Error fetching contestants:', error);
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 });
  }
}
