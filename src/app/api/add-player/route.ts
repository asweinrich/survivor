import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {
    const body = await req.json();
    console.log('Request Body:', body);

    const { email, name, tribeName, color, emoji, tribeArray } = body;

    const season = 48;

    if (!email || !name || !tribeName || !color || !emoji || !season || !tribeArray) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if the player already exists
    let player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      // Create a new player if they don't exist
      player = await prisma.player.create({
        data: {
          email,
          name,
          passwordHash: '',
          playerTribes: [], // Initialize as empty
        },
      });
    }

    // Add a new PlayerTribe
    const newPlayerTribe = await prisma.playerTribe.create({
      data: {
        playerId: player.id,
        tribeName,
        tribeArray, // Array of contestant IDs
        color,
        emoji,
        season
      },
    });

    // Update the player's playerTribes field
    await prisma.player.update({
      where: { id: player.id },
      data: {
        playerTribes: [...player.playerTribes, newPlayerTribe.id], // Add the new PlayerTribe ID
      },
    });

    return NextResponse.json({ 
      message: 'Player and PlayerTribe updated successfully',
      tribeId: newPlayerTribe.id 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
