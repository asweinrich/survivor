import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season'));
    const week = Number(searchParams.get('week'));
    const tribeId = Number(searchParams.get('tribeId'));

    if (!Number.isFinite(season) || !Number.isFinite(week) || !Number.isFinite(tribeId)) {
      return NextResponse.json({ error: 'Missing or invalid season/week/tribeId' }, { status: 400 });
    }

    // 1) Resolve PlayerTribe → playerId (and sanity-check season if you want)
    const pt = await prisma.playerTribe.findUnique({
      where: { id: tribeId },
      select: { id: true, season: true, playerId: true },
    });
    if (!pt) {
      return NextResponse.json({ error: 'Tribe not found' }, { status: 404 });
    }
    // Optional: enforce matching seasons
    // if (pt.season !== season) {
    //   return NextResponse.json({ error: 'Tribe does not belong to this season' }, { status: 400 });
    // }

    // 2) All pick-ems for this (season, week)
    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      select: { id: true, question: true, options: true },
    });
    const pickEmIds = pickEms.map((pe) => pe.id);
    if (pickEmIds.length === 0) {
      return NextResponse.json({ picks: [], counts: { totalPickEms: 0, submitted: 0 } });
    }

    // Map for quick joins
    const peById = new Map(pickEms.map((pe) => [pe.id, pe]));

    // 3) Player's picks for those pick-ems
    const picks = await prisma.pick.findMany({
      where: { playerId: pt.playerId, pickId: { in: pickEmIds } },
      select: { pickId: true, selection: true },
    });

    // 4) Shape for UI: resolve chosen option object from pickEm.options
    const resolved = picks.map((p) => {
      const pe = peById.get(p.pickId);
      const options: any[] = Array.isArray(pe?.options) ? (pe!.options as any[]) : [];
      const optionObj = options.find((o) => Number(o?.id) === Number(p.selection)) ?? {
        id: p.selection,
        label: String(p.selection),
        type: 'text',
        value: p.selection,
      };

      return {
        pickEmId: p.pickId,
        question: pe?.question ?? 'Question',
        option: optionObj,
      };
    });

    return NextResponse.json({
      picks: resolved,
      counts: { totalPickEms: pickEmIds.length, submitted: resolved.length },
    });
  } catch (err: any) {
    console.error('pick-ems/summary GET error', err);
    const msg = typeof err?.message === 'string' ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
