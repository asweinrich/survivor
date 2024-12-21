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
      return res.status(404).json({ error: 'Contestant not found' });
    }

    const seasonId = contestant.seasonId;
    const contestants = await prisma.contestant.findMany({
      where: { seasonId },
    });

    if (!contestants || contestants.length === 0) {
      return NextResponse.json(
        { error: 'No contestants found for this season' },
        { status: 404 }
      );
    }

    // Fetch scoring categories
    const scoringCategories = await import('../../../scoring/values.json').then(
      (mod) => mod.default
    );

    // Calculate scores for all contestants
    const contestantScores = contestants.map((c) => {
      const totalPoints = scoringCategories.reduce((total: number, category) => {
        const value = c[category.schemaKey as keyof typeof c];
        if (value === null) return total;
        if (typeof value === 'boolean') {
          return total + (value ? category.points : 0);
        }
        if (typeof value === 'number') {
          return total + value * category.points;
        }
        return total;
      }, 0);

      return { id: c.id, score: totalPoints };
    });

    // Check if all scores are zero
    const allScoresAreZero = contestantScores.every((c) => c.score === 0);

    if (allScoresAreZero) {
      return NextResponse.json('even');
    }

    // Sort by scores in descending order
    contestantScores.sort((a, b) => b.score - a.score);

    // Assign ranks while handling ties
    let rank = 1;
    const rankedScores = contestantScores.map((c, index) => {
      if (index > 0 && c.score < contestantScores[index - 1].score) {
        rank = index + 1;
      }
      return { ...c, rank };
    });

    // Find the rank of the specified contestant
    const contestantRank = rankedScores.find(
      (c) => c.id === contestantId
    );

    return NextResponse.json(contestantRank);
  } catch (error) {
    console.error('Error fetching contestant:', error);
    return NextResponse.json({ error: 'Failed to fetch contestant' }, { status: 500 });
  }
}
