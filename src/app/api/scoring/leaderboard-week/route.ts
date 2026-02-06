import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { leaderboardForSeasonWeek } from '@/lib/scoring/weekly';
import { prisma } from '@/lib/prisma';

const tagFor = (season: number, week: number) => `leaderboard-week-${season}-${week}`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    const week = Number(searchParams.get('week'));
    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Missing season or week' }, { status: 400 });
    }

    // Cache leaderboard rows
    const getCached = unstable_cache(
      async (s: number, w: number) => {
        const rows = await leaderboardForSeasonWeek(s, w);
        // Join with contestant display info (single batched query)
        const ids = rows.map((r) => r.contestantId);
        const contestants = await prisma.contestant.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, img: true, inPlay: true, voteOutOrder: true },
        });
        const map = new Map(contestants.map((c) => [c.id, c]));
        return rows.map((r) => ({
          contestantId: r.contestantId,
          points: r.points,
          contestant: map.get(r.contestantId) || null,
        }));
      },
      // Cache key and tags:
      undefined,
      { tags: [tagFor(season, week)], revalidate: 60 } // 60s revalidate; tune as needed
    );

    const leaderboard = await getCached(season, week);
    return NextResponse.json({ season, week, leaderboard });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}