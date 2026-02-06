import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    const week = Number(searchParams.get('week'));
    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Missing season or week' }, { status: 400 });
    }
    const events = await prisma.weeklyScore.findMany({
      where: { season, week },
      orderBy: [{ contestantId: 'asc' }, { category: 'asc' }],
      select: { id: true, contestantId: true, category: true, type: true, value: true, points: true },
    });
    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}