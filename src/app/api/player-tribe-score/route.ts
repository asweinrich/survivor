import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tribeArray } = body;

    if (!Array.isArray(tribeArray) || tribeArray.length === 0) {
      return NextResponse.json({ message: 'Invalid tribeArray provided' }, { status: 400 });
    }

    // Fetch scoring rules from the JSON file
    const res = await fetch('/scoring/values.json'); // Replace with your actual endpoint
    const scoringRules = await res.json();

    // Create a mapping of schema keys to their point values
    const scoringMap = scoringRules.reduce((map: Record<string, number>, rule: any) => {
      map[rule.schemaKey] = rule.points;
      return map;
    }, {});

    // Fetch contestants in the tribe
    const contestants = await prisma.contestant.findMany({
      where: {
        id: { in: tribeArray },
      },
    });

    // Calculate scores for each contestant
    const contestantScores: Record<number, { id: number; name: string; score: number }> = {};
    contestants.forEach((contestant) => {
      let score = 0;

      // Add points based on boolean or numeric schema keys
      if (contestant.soleSurvivor) score += scoringMap['soleSurvivor'] || 0;
      if (contestant.top3) score += scoringMap['top3'] || 0;
      if (contestant.madeMerge) score += scoringMap['madeMerge'] || 0;
      if (contestant.madeFire) score += scoringMap['madeFire'] || 0;

      // Add points based on numeric schema keys
      score += (contestant.immunityWins || 0) * (scoringMap['immunityWins'] || 0);
      score += (contestant.rewards || 0) * (scoringMap['rewards'] || 0);
      score += (contestant.hiddenIdols || 0) * (scoringMap['hiddenIdols'] || 0);
      score += (contestant.tribalWins || 0) * (scoringMap['tribalWins'] || 0);
      score += (contestant.episodes || 0) * (scoringMap['episodes'] || 0);
      score += (contestant.advantages || 0) * (scoringMap['advantages'] || 0);

      // Handle removal penalty
      if (!contestant.inPlay) score += scoringMap['removedPenalty'] || 0;

      // Store the calculated score along with contestant ID and name
      contestantScores[contestant.id] = { id: contestant.id, name: contestant.name, score };
    });

    // Calculate total score for the tribe
    const totalScore = tribeArray.reduce((sum, contestantId) => {
      return sum + (contestantScores[contestantId]?.score || 0);
    }, 0);

    return NextResponse.json({
      totalScore,
      contestantScores, // Contestant scores mapped by ID
    });
  } catch (error) {
    console.error('Error calculating tribe score:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
