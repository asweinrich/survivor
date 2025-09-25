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

    // 1. Get all scored PickEms for the season (answers set and non-empty)
    const pickEms = await prisma.pickEm.findMany({
      where: {
        season,
        answers: { isEmpty: false },
      },
      select: {
        id: true,
        week: true,
        options: true,      // Array of options (id, type, pointValue, value, label)
        answers: true,      // Array of correct option IDs
      }
    });

    if (!pickEms.length) {
      return NextResponse.json([]);
    }

    // 2. Get all playerTribes for the season (with player relation for name)
    const playerTribes = await prisma.playerTribe.findMany({
      where: { season },
      select: {
        id: true,
        playerId: true,
        tribeName: true,
        emoji: true,
        color: true,
        paid: true,
        player: {
          select: {
            name: true
          }
        }
      }
    });

    // Build a map of playerId -> playerTribeId
    const playerIdToTribeId: Record<number, number> = {};
    playerTribes.forEach((tribe) => {
      if (tribe.playerId) playerIdToTribeId[tribe.playerId] = tribe.id;
    });

    // 3. Get all Picks for these PickEms
    const allPickEmIds = pickEms.map(pe => pe.id);
    const picks = await prisma.pick.findMany({
      where: { pickId: { in: allPickEmIds } },
      select: {
        playerId: true,
        pickId: true,
        selection: true,
      }
    });

    // 4. Build a map of pickEmId -> pickEm
    const pickEmMap = Object.fromEntries(pickEms.map(pe => [pe.id, pe]));

    // 5. For each pick, score it and aggregate by playerTribeId
    const tribeScores: Record<number, number> = {}; // playerTribeId -> total points
    for (const pick of picks) {
      const pickEm = pickEmMap[pick.pickId];
      if (!pickEm) continue;

      const answers: number[] = Array.isArray(pickEm.answers) ? pickEm.answers : [];
      const isCorrect = answers.includes(pick.selection);

      const options: any[] = Array.isArray(pickEm.options) ? pickEm.options : [];
      const option = options.find((opt) => opt && typeof opt === "object" && "id" in opt && opt.id === pick.selection);
      if (!option) continue;

      const pointValue = typeof option.pointValue === "number" ? option.pointValue : 0;
      const type = typeof option.type === "string" ? option.type : "";

      let points = 0;
      if (isCorrect) {
        points = pointValue;
      } else {
        points = -getPenalty(pointValue, type);
      }

      // Find the playerTribeId for this pick's playerId
      const tribeId = playerIdToTribeId[pick.playerId];
      if (!tribeId) continue;

      if (!tribeScores[tribeId]) tribeScores[tribeId] = 0;
      tribeScores[tribeId] += points;
    }

    // 6. Build the leaderboard
    const leaderboard = playerTribes.map(t => ({
      id: t.id,
      tribeName: t.tribeName,
      playerName: t.player?.name ?? "Unknown",
      emoji: t.emoji,
      color: t.color,
      paid: t.paid,
      pickemPoints: tribeScores[t.id] || 0,
    }))
    .sort((a, b) => b.pickemPoints - a.pickemPoints)
    .map((t, idx) => ({ ...t, rank: idx + 1 }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error computing pick-em leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}