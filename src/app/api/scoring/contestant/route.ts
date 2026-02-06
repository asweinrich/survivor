import { NextResponse } from 'next/server';
import { totalPointsForContestantSeason, totalsByWeek, totalsByCategory } from '@/lib/scoring/weekly';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contestantId = Number(searchParams.get('contestantId'));
    const season = Number(searchParams.get('season'));
    if (!contestantId || !season) {
      return NextResponse.json({ error: 'Missing contestantId or season' }, { status: 400 });
    }
    const total = await totalPointsForContestantSeason(contestantId, season);
    const byWeek = await totalsByWeek(contestantId, season);
    const byCategory = await totalsByCategory(contestantId, season);
    return NextResponse.json({ total, byWeek, byCategory });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}