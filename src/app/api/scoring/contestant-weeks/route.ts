import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contestantId = Number(searchParams.get('contestantId'));
    const season = Number(searchParams.get('season'));
    if (!Number.isFinite(contestantId) || !Number.isFinite(season)) {
      return NextResponse.json({ error: 'Missing contestantId or season' }, { status: 400 });
    }

    const events = await prisma.weeklyScore.findMany({
      where: { contestantId, season },
      orderBy: [{ week: 'desc' }, { category: 'asc' }],
      select: { week: true, category: true, type: true, value: true, points: true },
    });

    // Group by week, only include events that actually happened (nonzero value/points)
    const byWeek = new Map<number, typeof events>();
    for (const ev of events) {
      if (!ev.value && !ev.points) continue;
      if (!byWeek.has(ev.week)) byWeek.set(ev.week, []);
      byWeek.get(ev.week)!.push(ev);
    }

    const weeks = Array.from(byWeek.entries())
      .sort((a, b) => b[0] - a[0]) // descending: most recent week first
      .map(([week, events]) => ({ week, events }));

    return NextResponse.json({ weeks });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}