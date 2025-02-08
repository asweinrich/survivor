import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);

    const { playerId, season } = body;

    // Validate request body
    if (!playerId || !season) {
      return NextResponse.json(
        { message: 'Missing required fields: playerId and season are required' },
        { status: 400 }
      );
    }

    // Get the total number of player tribes for the given season
    const totalTribes = await prisma.playerTribe.count({
      where: { season },
    });

    // If there are no tribes in the season, return 0% percentages
    if (totalTribes === 0) {
      return NextResponse.json({ rosterPercentage: 0, soleSurvivorPercentage: 0 });
    }

    // Count how many player tribes have drafted the given player anywhere in their tribeArray
    const draftedCount = await prisma.playerTribe.count({
      where: {
        season,
        tribeArray: {
          has: playerId, // Assuming "tribeArray" is an array of contestant IDs
        },
      },
    });

    // Calculate the roster percentage
    const rosterPercentage = (draftedCount / totalTribes) * 100;

    // Get the list of player tribes that include this player (so we can determine sole survivor count)
    const tribesWithContestant = await prisma.playerTribe.findMany({
      where: {
        season,
        tribeArray: {
          has: playerId,
        },
      },
      select: { tribeArray: true },
    });

    // Count those tribes where the first element (sole survivor) is the playerId
    const soleSurvivorCount = tribesWithContestant.filter(
      (pt) => pt.tribeArray[0] === playerId
    ).length;
    const soleSurvivorPercentage = (soleSurvivorCount / totalTribes) * 100;

    return NextResponse.json({ rosterPercentage, soleSurvivorPercentage });
  } catch (error) {
    console.error('Error fetching roster percentage:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
