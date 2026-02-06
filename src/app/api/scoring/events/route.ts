import { NextResponse } from 'next/server';
import { awardEvent } from '@/lib/scoring/weekly';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contestantId, season, week, category, type, value } = body || {};
    if (!contestantId || !season || !week || !category || value == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const row = await awardEvent({
      contestantId: Number(contestantId),
      season: Number(season),
      week: Number(week),
      categoryKey: String(category),
      type,
      value: Number(value),
    });
    return NextResponse.json({ status: 'ok', event: row });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}