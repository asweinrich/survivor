import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonStr = searchParams.get('season');
    const weekStr = searchParams.get('week');

    if (!seasonStr || !weekStr) {
      return NextResponse.json({ error: 'Missing ?season=&week=' }, { status: 400 });
    }

    const season = parseInt(seasonStr, 10);
    const week = parseInt(weekStr, 10);
    if (Number.isNaN(season) || Number.isNaN(week)) {
      return NextResponse.json({ error: 'Invalid season or week' }, { status: 400 });
    }

    // 1) All pick-ems for this season/week
    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      select: { id: true, status: true },
    });

    // Early return when no markets exist yet
    if (pickEms.length === 0) {
      return NextResponse.json({
        season,
        week,
        submittedTribeIds: [],
        byTribe: [],
      });
    }

    const pickIds = pickEms.map(p => p.id);

    // 2) All picks made for those pick-ems
    const picks = await prisma.pick.findMany({
      where: { pickId: { in: pickIds } },
      select: {
        pickId: true,
        playerId: true,
        selection: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3) PlayerTribes for this season (to translate playerId -> tribeId)
    const tribes = await prisma.playerTribe.findMany({
      where: { season },
      select: { id: true, playerId: true, tribeName: true, color: true, emoji: true, playerName: true },
    });

    const tribeByPlayerId = new Map<number, (typeof tribes)[number]>();
    tribes.forEach(t => tribeByPlayerId.set(t.playerId, t));

    // 4) Which tribes have submitted (any pick counts as "submitted")
    const submittedTribeIdsSet = new Set<number>();
    const picksByPlayer = new Map<number, Array<{ pickId: number; selection: number; createdAt: Date }>>();

    for (const p of picks) {
      const arr = picksByPlayer.get(p.playerId) ?? [];
      arr.push({ pickId: p.pickId, selection: p.selection, createdAt: p.createdAt });
      picksByPlayer.set(p.playerId, arr);

      const tribe = tribeByPlayerId.get(p.playerId);
      if (tribe) submittedTribeIdsSet.add(tribe.id);
    }

    // 5) Optionally return a by-tribe breakdown
    const byTribe = tribes.map(t => {
      const playerPicks = picksByPlayer.get(t.playerId) ?? [];
      return {
        tribeId: t.id,
        playerId: t.playerId,
        tribeName: t.tribeName,
        color: t.color,
        emoji: t.emoji,
        playerName: t.playerName,
        submitted: submittedTribeIdsSet.has(t.id),
        picks: playerPicks, // [{ pickId, selection, createdAt }]
      };
    });

    return NextResponse.json({
      season,
      week,
      submittedTribeIds: Array.from(submittedTribeIdsSet),
      byTribe,
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    console.error('pickems/status GET error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
