import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { weeklyLockAtPT } from '@/lib/pick-em/lock';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    const week = Number(searchParams.get('week'));

    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Missing or invalid season/week' }, { status: 400 });
    }

    // Compute a single canonical lock for this (season, week)
    // weeklyLockAtPT returns a Date object for 5pm PT (Pacific Time) on the correct Wednesday.
    // .toISOString() automatically converts this to a UTC ISO string.
    const lockAtPT = weeklyLockAtPT(season, week); // PT-local date
    const lockAtUTC = lockAtPT.toISOString(); // UTC ISO string

    // Find all pick-em ids for this week
    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      select: { id: true },
    });

    if (pickEms.length === 0) {
      return NextResponse.json({ submittedTribeIds: [], lockAt: lockAtUTC });
    }

    const pickEmIds = pickEms.map((pe) => pe.id);

    // Which players have any picks for these pick-ems?
    const picksByPlayer = await prisma.pick.findMany({
      where: { pickId: { in: pickEmIds } },
      select: { playerId: true },
      distinct: ['playerId'],
    });

    if (picksByPlayer.length === 0) {
      return NextResponse.json({ submittedTribeIds: [], lockAt: lockAtUTC });
    }

    const playerIds = picksByPlayer.map((p) => p.playerId);

    // Map those players to their PlayerTribe ids for the given season
    // (Assumes a Prisma model named PlayerTribe with fields: id, season, playerId)
    const playerTribes = await prisma.playerTribe.findMany({
      where: { season, playerId: { in: playerIds } },
      select: { id: true },
    });

    const submittedTribeIds = playerTribes.map((pt) => pt.id);

    return NextResponse.json({ submittedTribeIds, lockAt: lockAtUTC });
  } catch (err: any) {
    console.error('pick-ems/status GET error', err);
    const msg = typeof err?.message === 'string' ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}