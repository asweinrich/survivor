import { prisma } from '@/lib/prisma';

type ScoringCategory = {
  schemaKey: string;
  points: number;
  type?: 'boolean' | 'count' | 'scalar';
};

async function loadCategories(): Promise<ScoringCategory[]> {
  const mod = await import('@/app/scoring/values50.json');
  return (mod.default || mod) as ScoringCategory[];
}

function inferTypeForKey(schemaKey: string): 'boolean' | 'count' {
  const booleanKeys = new Set(['soleSurvivor', 'top3', 'madeFire', 'madeMerge']);
  return booleanKeys.has(schemaKey) ? 'boolean' : 'count';
}

export async function awardEvent(params: {
  contestantId: number;
  season: number;
  week: number;
  categoryKey: string;
  type?: 'boolean' | 'count' | 'scalar';
  value: number; // 1/0 for boolean; N for counts
}) {
  const cats = await loadCategories();
  const cat = cats.find((c) => c.schemaKey === params.categoryKey);
  if (!cat) throw new Error(`Unknown category ${params.categoryKey}`);

  const type = params.type || (cat.type as any) || inferTypeForKey(params.categoryKey);
  const value = type === 'boolean' ? (params.value ? 1 : 0) : params.value;
  const points = Math.round((cat.points || 0) * value);

  // Optional safeguard for boolean categories: avoid duplicates per contestant-season-category
  if (type === 'boolean') {
    const existing = await prisma.weeklyScore.findFirst({
      where: { contestantId: params.contestantId, season: params.season, category: params.categoryKey },
      select: { id: true },
    });
    if (existing) return existing;
  }

  return prisma.weeklyScore.create({
    data: {
      contestantId: params.contestantId,
      season: params.season,
      week: params.week,
      category: params.categoryKey,
      type,
      value,
      points,
    },
  });
}

export async function totalPointsForContestantSeason(contestantId: number, season: number) {
  const agg = await prisma.weeklyScore.aggregate({
    where: { contestantId, season },
    _sum: { points: true },
  });
  return agg._sum.points || 0;
}

export async function totalsByWeek(contestantId: number, season: number) {
  return prisma.weeklyScore.groupBy({
    by: ['week'],
    where: { contestantId, season },
    _sum: { points: true },
    orderBy: { week: 'asc' },
  });
}

export async function totalsByCategory(contestantId: number, season: number) {
  return prisma.weeklyScore.groupBy({
    by: ['category'],
    where: { contestantId, season },
    _sum: { points: true },
    orderBy: { category: 'asc' },
  });
}

export async function leaderboardForSeason(season: number) {
  const rows = await prisma.weeklyScore.groupBy({
    by: ['contestantId'],
    where: { season },
    _sum: { points: true },
    orderBy: { contestantId: 'asc' },
  });
  return rows.map((r) => ({ contestantId: r.contestantId, points: r._sum.points || 0 }));
}

/** New: weekly leaderboard for a given season/week */
export async function leaderboardForSeasonWeek(season: number, week: number) {
  const rows = await prisma.weeklyScore.groupBy({
    by: ['contestantId'],
    where: { season, week },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
  });
  return rows.map((r) => ({ contestantId: r.contestantId, points: r._sum.points || 0 }));
}