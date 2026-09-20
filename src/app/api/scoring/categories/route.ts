import { NextResponse } from 'next/server';
import { loadCategoriesForSeason } from '@/lib/scoring/categories';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    if (!Number.isFinite(season)) {
      return NextResponse.json({ error: 'Missing season' }, { status: 400 });
    }
    const categories = await loadCategoriesForSeason(season);
    return NextResponse.json({ season, categories });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}