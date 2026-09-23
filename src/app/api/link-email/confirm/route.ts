import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyEmailLinkToken } from '@/lib/emailLinkToken';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ message: 'Missing token' }, { status: 400 });

    const payload = verifyEmailLinkToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Link expired or invalid. Please request a new one.' }, { status: 401 });
    }

    const { email, targetPlayerId } = payload;

    const oldPlayer = await prisma.player.findUnique({ where: { email } });
    const newPlayer = await prisma.player.findUnique({ where: { id: targetPlayerId } });

    if (!oldPlayer || !newPlayer) {
      return NextResponse.json({ message: 'Account not found.' }, { status: 404 });
    }

    if (oldPlayer.id === newPlayer.id) {
      return NextResponse.json({ message: 'Already linked.', tribesTransferred: 0 });
    }

    const tribesToMove = await prisma.playerTribe.findMany({ where: { playerId: oldPlayer.id } });

    // Atomic transfer: FK reassignment for tribes + picks, then the
    // denormalized Player.playerTribes array is manually rewritten on
    // both sides since it never auto-syncs from the FK change. Email is
    // moved the same way (unique constraint means it must be cleared on
    // the old row in the same transaction it's written to the new one).
    await prisma.$transaction([
      prisma.playerTribe.updateMany({
        where: { playerId: oldPlayer.id },
        data: { playerId: newPlayer.id },
      }),
      prisma.pick.updateMany({
        where: { playerId: oldPlayer.id },
        data: { playerId: newPlayer.id },
      }),
      prisma.player.update({
        where: { id: newPlayer.id },
        data: {
          playerTribes: Array.from(new Set([...newPlayer.playerTribes, ...oldPlayer.playerTribes])),
          email: oldPlayer.email,
        },
      }),
      prisma.player.update({
        where: { id: oldPlayer.id },
        data: { playerTribes: [], email: null },
      }),
    ]);

    return NextResponse.json({
      message: 'Tribes linked successfully.',
      tribesTransferred: tribesToMove.length,
    });
  } catch (error: any) {
    console.error('link-email/confirm error', error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}