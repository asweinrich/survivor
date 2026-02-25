import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import scoringCategories from '../../../scoring/values.json'; // S49 and earlier

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contestantId = parseInt(id, 10);

    if (isNaN(contestantId)) {
      return NextResponse.json({ error: 'Invalid contestant ID' }, { status: 400 });
    }

    // Fetch contestant (includes season)
    const contestant = await prisma.contestant.findUnique({
      where: { id: contestantId },
    });

    if (!contestant) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
    }

    // S50+: sum weekly ledger points (to-date)
    if (contestant.season >= 50) {
      const agg = await prisma.weeklyScore.aggregate({
        where: {
          contestantId: contestant.id,
          season: contestant.season,
        },
        _sum: { points: true },
      });

      const totalPoints = agg._sum.points ?? 0;
      return NextResponse.json({ contestantId, totalPoints });
    }

    // S49 and earlier: derive from contestant fields + values.json
    const totalPoints = scoringCategories.reduce((total, category) => {
      const value = contestant[category.schemaKey as keyof typeof contestant];

      if (value === null || value === undefined) return total;

      if (typeof value === 'boolean') return total + (value ? category.points : 0);

      if (typeof value === 'number') return total + value * category.points;

      console.warn(`Unhandled value type for ${category.schemaKey}:`, value);
      return total;
    }, 0);

    return NextResponse.json({ contestantId, totalPoints });
  } catch (error) {
    console.error('Error fetching contestant points:', error);
    return NextResponse.json({ error: 'Failed to calculate points' }, { status: 500 });
  }
}