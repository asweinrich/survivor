import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {
    const body = await req.json();
    console.log('Request Body:', body);


    const { email, name, tribeName, color, emoji, tribeArray } = req.body;

    const season = 48;

    if (!email || !name || !tribeName || !color || !emoji || !season || !tribeArray) {
      return res.status(400).json({ message: 'Missing required fields' });
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

    return res.status(200).json({ message: 'Player and PlayerTribe updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
