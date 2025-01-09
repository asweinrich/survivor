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

    // If there are no tribes in the season, return 0% roster percentage
    if (totalTribes === 0) {
      return NextResponse.json({ rosterPercentage: 0 });
    }

    // Count how many player tribes have drafted the given player
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

    return NextResponse.json({ rosterPercentage });
  } catch (error) {
    console.error('Error fetching roster percentage:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
