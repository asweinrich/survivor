import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

const seasonTag = (season: number) => `leaderboard-season-${season}`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    if (!Number.isFinite(season)) {
      return NextResponse.json({ error: 'Missing season' }, { status: 400 });
    }

    const getCachedSeasonLeaderboard = unstable_cache(
      async (s: number) => {
        const rows = await prisma.weeklyScore.groupBy({
          by: ['contestantId'],
          where: { season: s },
          _sum: { points: true },
          orderBy: { _sum: { points: 'desc' } },
        });

        const ids = rows.map((r) => r.contestantId);
        const contestants = await prisma.contestant.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, img: true, inPlay: true, voteOutOrder: true },
        });
        const map = new Map(contestants.map((c) => [c.id, c]));
        return rows.map((r) => ({
          contestantId: r.contestantId,
          points: r._sum.points || 0,
          contestant: map.get(r.contestantId) || null,
        }));
      },
      undefined,
      { tags: [seasonTag(season)], revalidate: 120 } // 2m cache for season totals
    );

    const leaderboard = await getCachedSeasonLeaderboard(season);
    return NextResponse.json({ season, leaderboard });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}