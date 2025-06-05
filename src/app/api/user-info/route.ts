import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { email },
    select: {
      name: true,
      badges: true,
    },
  });

  return NextResponse.json(player);
}
