import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: 'Email required' }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!player) {
    return NextResponse.json({ color: null, emoji: null });
  }

  const latestTribe = await prisma.playerTribe.findFirst({
    where: { playerId: player.id },
    orderBy: { createdAt: 'desc' },
    select: { color: true, emoji: true, tribeName: true, season: true },
  });

  return NextResponse.json({
    color: latestTribe?.color ?? null,
    emoji: latestTribe?.emoji ?? null,
    tribeName: latestTribe?.tribeName ?? null,
    season: latestTribe?.season ?? null,
  });
}