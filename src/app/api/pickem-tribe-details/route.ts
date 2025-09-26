import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getPenalty(pointValue: number, type: string) {
  if (!pointValue || !type) return 0;
  switch (type.toLowerCase()) {
    case 'tribe':
    case 'boolean':
      return Math.floor(pointValue / 2);
    case 'contestant':
      return Math.floor(pointValue / 4);
    default:
      return 0;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = parseInt(searchParams.get('season') || '', 10);
    if (!season) return NextResponse.json({ error: 'Missing season' }, { status: 400 });

    // Get all tribes
    const playerTribes = await prisma.playerTribe.findMany({
      where: { season },
      select: {
        id: true,
        playerId: true,
        tribeName: true,
        emoji: true,
        color: true,
        paid: true,
        player: { select: { name: true } }
      }
    });

    // Get all PickEms for the season (scored/weeks)
    const pickEms = await prisma.pickEm.findMany({
      where: { season },
      select: {
        id: true,
        week: true,
        options: true, // Array of options (id, type, pointValue, value, label)
        answers: true, // Array of correct option IDs
      }
    });
    const pickEmMap = Object.fromEntries(pickEms.map(pe => [pe.id, pe]));

    // Get all Picks for these PickEms
    const allPickEmIds = pickEms.map(pe => pe.id);
    const picks = await prisma.pick.findMany({
      where: { pickId: { in: allPickEmIds } },
      select: {
        playerId: true,
        pickId: true,
        selection: true,
      }
    });

    // Build a map of playerId -> playerTribeId
    const playerIdToTribeId: Record<number, number> = {};
    playerTribes.forEach((tribe) => {
      if (tribe.playerId) playerIdToTribeId[tribe.playerId] = tribe.id;
    });

    // Group picks by tribe and week
    const picksByTribeWeek: Record<number, Record<number, any[]>> = {}; // tribeId -> week -> [picks]
    for (const pick of picks) {
      const pickEm = pickEmMap[pick.pickId];
      if (!pickEm) continue;
      const tribeId = playerIdToTribeId[pick.playerId];
      if (!tribeId) continue;
      const week = pickEm.week;

      if (!picksByTribeWeek[tribeId]) picksByTribeWeek[tribeId] = {};
      if (!picksByTribeWeek[tribeId][week]) picksByTribeWeek[tribeId][week] = [];
      picksByTribeWeek[tribeId][week].push({
        ...pick,
        pickEm,
      });
    }

    // Build the pickemWeeks array for each tribe
    const tribeDetails = playerTribes.map(tribe => {
      const pickemWeeks: any[] = [];
      const weeks = picksByTribeWeek[tribe.id] ? Object.keys(picksByTribeWeek[tribe.id]).map(Number) : [];
      weeks.sort((a, b) => a - b);

      for (const week of weeks) {
        const picks = picksByTribeWeek[tribe.id][week];
        const weekPicks = picks.map(pick => {
          const pickEm = pick.pickEm;
          const answers: number[] = Array.isArray(pickEm.answers) ? pickEm.answers : [];
          const isCorrect = answers.includes(pick.selection);

          const options: any[] = Array.isArray(pickEm.options) ? pickEm.options : [];
          const option = options.find((opt) => opt && typeof opt === "object" && "id" in opt && opt.id === pick.selection);

          const pointValue = typeof option?.pointValue === "number" ? option.pointValue : 0;
          const type = typeof option?.type === "string" ? option.type : "";

          let points = 0;
          let answered = pick.selection !== undefined && pick.selection !== null;
          let pending = !answers.length; // true if not yet scored
          if (answered && !pending) {
            points = isCorrect ? pointValue : -getPenalty(pointValue, type);
          }

          return {
            questionId: pick.pickId,
            answered,
            pending,
            isCorrect: answered && !pending ? isCorrect : undefined,
            points,
          };
        });

        // Week score is sum of points for answered and scored picks
        const score = weekPicks.reduce((sum, p) => sum + (p.answered && !p.pending ? p.points : 0), 0);

        pickemWeeks.push({
          week,
          picks: weekPicks,
          score,
        });
      }

      return {
        id: tribe.id,
        tribeName: tribe.tribeName,
        playerName: tribe.player?.name ?? "Unknown",
        emoji: tribe.emoji,
        color: tribe.color,
        paid: tribe.paid,
        pickemWeeks,
      };
    });

    return NextResponse.json(tribeDetails);
  } catch (error) {
    console.error('Error computing pick-em tribe details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}