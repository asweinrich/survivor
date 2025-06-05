// /app/api/dashboard-tribes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const player = await prisma.player.findUnique({
    where: { email },
    include: {
      playerTribesRel: true, // or `playerTribes` if renamed
    },
  });

  const contestants = await prisma.contestant.findMany({
    where: {
      season: 48, // or dynamically filter later
    },
  });

  return NextResponse.json({
    playerTribes: player?.playerTribesRel || [],
    contestants,
  });
}
