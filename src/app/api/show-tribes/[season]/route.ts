import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { season: string } }) {
  try {
    const { season } = params;

    if (!season) {
      return NextResponse.json({ error: 'Season parameter is required' }, { status: 400 });
    }

    console.log(`Fetching show tribes for season: ${season}`); // Debug log

    // Fetch show tribes where the season matches
    const tribes = await prisma.showTribe.findMany({
      where: { season: parseInt(season, 10) }, // Ensure season is treated as an integer
      select: { id: true, name: true, color: true }, // Only fetch necessary fields
    });

    if (!tribes || tribes.length === 0) {
      return NextResponse.json({ error: 'No show tribes found for this season' }, { status: 404 });
    }

    return NextResponse.json(tribes);
  } catch (error) {
    console.error('Error fetching show tribes:', error);
    return NextResponse.json({ error: 'Failed to fetch show tribes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
