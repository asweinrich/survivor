import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { season: string } }
) {
  try {
    const { season } = params;
    const contestants = await prisma.contestant.findMany({
      where: { season },
    });
    return NextResponse.json(contestants);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 });
  }
}
