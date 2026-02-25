import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const contestantIdRaw = searchParams.get('contestantId');
    const seasonRaw = searchParams.get('season');

    if (!contestantIdRaw || !seasonRaw) {
      return NextResponse.json(
        { error: 'Missing required query params: contestantId, season' },
        { status: 400 }
      );
    }

    const contestantId = Number(contestantIdRaw);
    const season = Number(seasonRaw);

    if (!Number.isFinite(contestantId) || !Number.isFinite(season)) {
      return NextResponse.json(
        { error: 'Invalid query params: contestantId and season must be numbers' },
        { status: 400 }
      );
    }

    const rows = await prisma.weeklyScore.groupBy({
      by: ['category'],
      where: { contestantId, season },
      _sum: { value: true, points: true },
      orderBy: { category: 'asc' },
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error computing weekly totals by category:', error);
    return NextResponse.json(
      { error: 'Failed to compute weekly totals by category' },
      { status: 500 }
    );
  }
}