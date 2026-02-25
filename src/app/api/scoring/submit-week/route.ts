import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

type ScoringCategory = { schemaKey: string; points: number; type?: 'boolean' | 'count' | 'scalar' };

function inferTypeForKey(schemaKey: string): 'boolean' | 'count' {
  const booleanKeys = new Set(['soleSurvivor', 'top3', 'madeFire', 'madeMerge']);
  return booleanKeys.has(schemaKey) ? 'boolean' : 'count';
}

const tagForWeek = (season: number, week: number) => `leaderboard-week-${season}-${week}`;
const seasonTag = (season: number) => `leaderboard-season-${season}`;
const tagForWeeks = (season: number) => `weeks-season-${season}`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase() || '';
    if (!email || email !== 'asweinrich@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const season = Number(body?.season);
    const week = Number(body?.week);
    const entries = Array.isArray(body?.entries) ? body.entries : [];

    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Missing season or week' }, { status: 400 });
    }
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
    }

    const mod = await import('@/app/scoring/values50.json');
    const categories = ((mod as any).default || mod) as ScoringCategory[];
    const catMap = new Map<string, ScoringCategory>();
    categories.forEach((c) => catMap.set(c.schemaKey, c));

    const rows: Array<{
      contestantId: number;
      season: number;
      week: number;
      category: string;
      type: string;
      value: number;
      points: number;
    }> = [];

    for (const e of entries) {
      const contestantId = Number(e?.contestantId);
      const categoryKey = String(e?.category || '');
      if (!contestantId || !categoryKey) continue;
      const cat = catMap.get(categoryKey);
      if (!cat) {
        return NextResponse.json({ error: `Unknown category ${categoryKey}` }, { status: 400 });
      }
      const type: 'boolean' | 'count' | 'scalar' =
        (e?.type as any) || (cat.type as any) || inferTypeForKey(categoryKey);

      let value = Number(e?.value ?? 0);
      if (type === 'boolean') value = value ? 1 : 0;
      if (!Number.isFinite(value)) value = 0;

      const points = Math.round((cat.points || 0) * value);
      rows.push({ contestantId, season, week, category: categoryKey, type, value, points });
    }

    await prisma.$transaction([
      prisma.weeklyScore.deleteMany({ where: { season, week } }),
      prisma.weeklyScore.createMany({ data: rows, skipDuplicates: true }),
    ]);

    // Invalidate cached leaderboards and week index
    revalidateTag(tagForWeek(season, week));
    revalidateTag(seasonTag(season));
    revalidateTag(tagForWeeks(season));

    return NextResponse.json({ status: 'ok', season, week, count: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}