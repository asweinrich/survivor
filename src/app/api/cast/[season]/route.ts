import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import scoringCategories from '../../../scoring/values.json'; // S49 and earlier

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await params;
    const seasonInt = parseInt(season, 10);

    if (isNaN(seasonInt)) {
      return NextResponse.json({ error: 'Invalid season parameter' }, { status: 400 });
    }

    // Fetch contestants for season
    const contestants = await prisma.contestant.findMany({
      where: { season: seasonInt },
      orderBy: [
        { voteOutOrder: { sort: 'desc', nulls: 'first' } },
        { name: 'asc' },
        { inPlay: 'desc' },
      ],
    });

    if (!contestants || contestants.length === 0) {
      return NextResponse.json({ error: 'No contestants found for this season' }, { status: 404 });
    }

    // S50+: weekly scoring (sum WeeklyScore.points to-date)
    if (seasonInt >= 50) {
      const weeklyTotals = await prisma.weeklyScore.groupBy({
        by: ['contestantId'],
        where: { season: seasonInt },
        _sum: { points: true },
      });

      const pointsByContestantId = new Map<number, number>(
        weeklyTotals.map((r) => [r.contestantId, r._sum.points ?? 0])
      );

      const updatedContestants = contestants.map((contestant) => ({
        ...contestant,
        points: pointsByContestantId.get(contestant.id) ?? 0,
      }));

      return NextResponse.json(updatedContestants);
    }

    // S49 and earlier: derive from contestant columns + values.json
    const updatedContestants = contestants.map((contestant) => {
      const totalPoints = scoringCategories.reduce((total, category) => {
        const value = contestant[category.schemaKey as keyof typeof contestant];

        if (value === null || value === undefined) return total;

        if (typeof value === 'boolean') return total + (value ? category.points : 0);

        if (typeof value === 'number') return total + value * category.points;

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