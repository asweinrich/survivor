import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const tagForWeeks = (season: number) => `weeks-season-${season}`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    if (!Number.isFinite(season)) {
      return NextResponse.json({ error: 'Missing season' }, { status: 400 });
    }

    const getCachedWeeks = unstable_cache(
      async (s: number) => {
        const rows = await prisma.weeklyScore.groupBy({
          by: ['week'],
          where: { season: s },
          _sum: { points: true },
        });
        const weeksWithScores = rows
          .filter((r) => (r._sum.points || 0) > 0)
          .map((r) => r.week)
          .sort((a, b) => a - b);
        return weeksWithScores;
      },
      undefined,
      { tags: [tagForWeeks(season)], revalidate: 300 } // 5m cache for week index
    );

    const weeks = await getCachedWeeks(season);
    return NextResponse.json({ season, weeks });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}