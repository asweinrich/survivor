import { prisma } from '@/lib/prisma';

/** Sum points for all contestants in a tribe for a season (batched in one query). */
export async function tribeSeasonPoints(tribeContestantIds: number[], season: number) {
  if (tribeContestantIds.length === 0) return 0;
  const rows = await prisma.weeklyScore.groupBy({
    by: ['contestantId'],
    where: { season, contestantId: { in: tribeContestantIds } },
    _sum: { points: true },
  });
  return rows.reduce((sum, r) => sum + (r._sum.points || 0), 0);
}

/** Optional: per-week tribe points (for week-by-week views). */
export async function tribeWeekPoints(tribeContestantIds: number[], season: number, week: number) {
  if (tribeContestantIds.length === 0) return 0;
  const rows = await prisma.weeklyScore.groupBy({
    by: ['contestantId'],
    where: { season, week, contestantId: { in: tribeContestantIds } },
    _sum: { points: true },
  });
  return rows.reduce((sum, r) => sum + (r._sum.points || 0), 0);
}