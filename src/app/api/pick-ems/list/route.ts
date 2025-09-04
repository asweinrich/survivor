import { NextResponse } from 'next/server';
import { PrismaClient, PickEmStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'; // <-- if you use a shared authOptions, import it

const prisma = new PrismaClient();

// Helper: resolve the current player's Player.id from the session.
// Adjust this to match your schema (e.g., look up by userId or email).
async function getCurrentPlayerIdOrNull(session: any) {
  if (!session?.user) return null;

  

  // EXAMPLE 2: fallback by email (if unique)
  if (session.user.email) {
    const player = await prisma.player.findFirst({ where: { email: session.user.email }, select: { id: true } });
    if (player) return player.id;
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonStr = searchParams.get('season');
    const weekStr = searchParams.get('week');

    if (!seasonStr || !weekStr) {
      return NextResponse.json({ error: 'Missing ?season=&week=' }, { status: 400 });
    }
    const season = Number(seasonStr);
    const week = Number(weekStr);
    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Invalid season or week' }, { status: 400 });
    }

    // Session (optional): used only to prefill existing selections
    const session = await getServerSession(authOptions);
    const playerId = await getCurrentPlayerIdOrNull(session);

    // 1) Pull the week’s pick-ems
    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        question: true,
        options: true,
        status: true,
      },
    });

    if (pickEms.length === 0) {
      return NextResponse.json({ pickEms: [], existingSelections: {} });
    }

    // 2) Prefill any existing selections for the signed-in user
    let existingSelections: Record<number, number> = {};
    if (playerId) {
      const picks = await prisma.pick.findMany({
        where: { playerId, pickId: { in: pickEms.map(pe => pe.id) } },
        select: { pickId: true, selection: true },
      });
      existingSelections = picks.reduce((acc, p) => {
        acc[p.pickId] = p.selection;
        return acc;
      }, {} as Record<number, number>);
    }

    
    // Shape for the modal
    const payload = {
      pickEms: pickEms.map(pe => ({
        id: pe.id,
        question: pe.question,
        options: pe.options, // [{ id, label, type, value, pointValue, ... }]
        status: pe.status,
      })),
      existingSelections, // { [pickEmId]: optionId }
    };

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('pickems/list GET error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
