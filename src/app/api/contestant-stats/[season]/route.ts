import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await params;
    console.log('Requested Season:', season);

    const seasonInt = parseInt(season, 10);
    if (isNaN(seasonInt)) {
      return NextResponse.json({ message: 'Invalid season parameter' }, { status: 400 });
    }

    // Fetch PlayerTribes for the specified season
    const playerTribes = await prisma.playerTribe.findMany({
      where: { season: seasonInt },
      
    })

   if (!playerTribes) {
      return NextResponse.json(
        { error: 'No tribes found' },
        { status: 404 }
      );
    }

    // Fetch all contestants
    const contestants = await prisma.contestant.findMany({
      where: { season: seasonInt },
      
    })

    if (!contestants) {
      return NextResponse.json(
        { error: 'No tribes found' },
        { status: 404 }
      );
    }

    if (playerTribes.length === 0 || contestants.length === 0) {
      return NextResponse.json(
        { message: 'No data found for this season', status: 'no_data' },
        { status: 404 }
      );
    }

    // Initialize counts for each contestant
    const draftCounts: Record<number, number> = {};
    const soleSurvivorCounts: Record<number, number> = {};

    contestants.forEach((contestant) => {
      draftCounts[contestant.id] = 0;
      soleSurvivorCounts[contestant.id] = 0;
    });

    // Calculate draft and sole survivor counts using tribeArray (with fallback if tribeArray is null)
    playerTribes.forEach((tribe) => {
      const picks = tribe.tribeArray || [];
      const uniquePicks = new Set(picks); // Ensure each contestant is counted only once per tribe.
      uniquePicks.forEach((id) => {
        if (draftCounts[id] !== undefined) {
          draftCounts[id]++;
        }
      });
      if (picks.length > 0) {
        const firstId = picks[0];
        if (soleSurvivorCounts[firstId] !== undefined) {
          soleSurvivorCounts[firstId]++;
        }
      }
    });

    const totalTribes = playerTribes.length; // Total number of tribes


    // Prepare the response data in the desired format with safe calculations
    const contestantStats = contestants.map((contestant) => {
      const draftPerc =
        totalTribes > 0 ? (draftCounts[contestant.id] / totalTribes) * 100 : 0;
      const soleSurvivorPerc =
        totalTribes > 0 ? (soleSurvivorCounts[contestant.id] / totalTribes) * 100 : 0;

      return {
        id: contestant.id,
        name: contestant.name,
        stats: {
          draftPercentage: parseFloat(draftPerc.toFixed(2)),
          soleSurvivorPercentage: parseFloat(soleSurvivorPerc.toFixed(2)),
        },
      };
    });

    return NextResponse.json({ data: contestantStats, status: 'success' });
  } catch (error) {
    console.error('Error fetching contestant stats:', error);
    return NextResponse.json(
      { message: 'Internal server error', status: 'error' },
      { status: 500 }
    );
  }
}
