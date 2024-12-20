import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params;

    const contestantId = parseInt(id, 10);

    if (isNaN(contestantId)) {
      return NextResponse.json({ error: 'Invalid contestant parameter' }, { status: 400 });
    }

    console.log(`Fetching recaps for contestant id: ${contestantId}`); // Debug log

    // Fetch contestants sorted by voteOutOrder (nulls last), then by name and inPlay
    const recaps = await prisma.recap.findMany({
      where: { contestantId: contestantId },
      orderBy: [
        { created_at: 'desc' },
      ],
    });

    if (!recaps || recaps.length === 0) {
      return NextResponse.json({ error: 'No contestant found for this id' }, { status: 404 });
    }

    return NextResponse.json(recaps);
  } catch (error) {
    console.error('Error fetching contestant:', error);
    return NextResponse.json({ error: 'Failed to fetch contestant' }, { status: 500 });
  }
}
