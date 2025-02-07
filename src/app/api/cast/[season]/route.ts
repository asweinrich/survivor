import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import scoringCategories from '../../../scoring/values.json'; // Adjust path if needed

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {
    // Unpack the season parameter
    const { season } = await params;
    const seasonInt = parseInt(season, 10);
    if (isNaN(seasonInt)) {
      return NextResponse.json({ error: 'Invalid season parameter' }, { status: 400 });
    }

    console.log(`Fetching contestants for season: ${seasonInt}`);

    // Fetch contestants with the desired sorting
    const contestants = await prisma.contestant.findMany({
      where: { season: seasonInt },
      orderBy: [
        { voteOutOrder: { sort: 'desc', nulls: 'first' } },
        { name: 'asc' },
        { inPlay: 'desc' },
      ],
    });

    console.log('Contestants:', contestants);

    if (!contestants || contestants.length === 0) {
      return NextResponse.json({ error: 'No contestants found for this season' }, { status: 404 });
    }

    // Merge in the updated points by iterating over each contestant and calculating totalPoints.
    const updatedContestants = contestants.map((contestant) => {
      const totalPoints = scoringCategories.reduce((total, category) => {
        // Dynamically access the contestant value based on the schema key
        const value = contestant[category.schemaKey as keyof typeof contestant];
        if (value === null || value === undefined) {
          return total;
        }
        if (typeof value === 'boolean') {
          return total + (value ? category.points : 0);
        }
        if (typeof value === 'number') {
          return total + value * category.points;
        }
        return total;
      }, 0);

      return { ...contestant, points: totalPoints };
    });

    return NextResponse.json(updatedContestants);
  } catch (error) {
    console.error('Error fetching contestants:', error);
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 });
  }
}
