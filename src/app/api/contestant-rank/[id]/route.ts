import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contestantId = parseInt(id, 10);

    if (isNaN(contestantId)) {
      return NextResponse.json({ error: 'Invalid contestant parameter' }, { status: 400 });
    }

    const contestant = await prisma.contestant.findUnique({
      where: { id: contestantId },
    });

    if (!contestant) {
      return NextResponse.json({ error: 'No contestants found' }, { status: 404 });
    }

    const seasonId = contestant.season;

    // Season 50+: rank by weekly ledger totals
    if (seasonId >= 50) {
      const seasonContestants = await prisma.contestant.findMany({
        where: { season: seasonId },
        select: { id: true },
      });

      if (!seasonContestants.length) {
        return NextResponse.json({ error: 'No contestants found for this season' }, { status: 404 });
      }

      const weeklyTotals = await prisma.weeklyScore.groupBy({
        by: ['contestantId'],
        where: { season: seasonId },
        _sum: { points: true },
      });

      const pointsById = new Map<number, number>(
        weeklyTotals.map((r) => [r.contestantId, r._sum.points ?? 0])
      );

      const contestantScores = seasonContestants.map((c) => ({
        id: c.id,
        score: pointsById.get(c.id) ?? 0,
      }));

      // If everyone has 0, preserve your old behavior
      const allScoresAreZero = contestantScores.every((c) => c.score === 0);
      if (allScoresAreZero) return NextResponse.json({ rank: '--' });

      // Sort desc by score
      contestantScores.sort((a, b) => b.score - a.score);

      // Assign competition ranks with tie handling
      let rank = 1;
      const rankedScores = contestantScores.map((c, index) => {
        if (index > 0 && c.score < contestantScores[index - 1].score) {
          rank = index + 1;
        }
        return { ...c, rank };
      });

      const contestantRank = rankedScores.find((c) => c.id === contestantId);
      return NextResponse.json(contestantRank ?? { id: contestantId, rank: '--', score: 0 });
    }

    // Seasons 49 and earlier: legacy scoring (existing logic)
    const contestants = await prisma.contestant.findMany({
      where: { season: seasonId },
    });

    if (!contestants || contestants.length === 0) {
      return NextResponse.json({ error: 'No contestants found for this season' }, { status: 404 });
    }

    const scoringCategories = await import('../../../scoring/values.json').then((mod) => mod.default);

    const contestantScores = contestants.map((c) => {
      const totalPoints = scoringCategories.reduce((total: number, category: any) => {
        const value = c[category.schemaKey as keyof typeof c];
        if (value === null || value === undefined) return total;

        if (typeof value === 'boolean') return total + (value ? category.points : 0);
        if (typeof value === 'number') return total + value * category.points;

        return total;
      }, 0);

      return { id: c.id, score: totalPoints };
    });

    const allScoresAreZero = contestantScores.every((c) => c.score === 0);
    if (allScoresAreZero) {
      return NextResponse.json({ rank: '--' });
    }

    contestantScores.sort((a, b) => b.score - a.score);

    let rank = 1;
    const rankedScores = contestantScores.map((c, index) => {
      if (index > 0 && c.score < contestantScores[index - 1].score) {
        rank = index + 1;
      }
      return { ...c, rank };
    });

    const contestantRank = rankedScores.find((c) => c.id === contestantId);
    return NextResponse.json(contestantRank);
  } catch (error) {
    console.error('Error fetching contestant:', error);
    return NextResponse.json({ error: 'Failed to fetch contestant' }, { status: 500 });
  }
}