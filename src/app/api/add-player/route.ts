import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { toE164 } from '@/lib/twilio';
import { verifyPhoneVerificationToken } from '@/lib/verifyToken';

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {
    const body = await req.json();
    console.log('Request Body:', body);

    const { phone, verificationToken, name, tribeName, color, emoji, tribeArray } = body;

    const season = 51;

    if (!phone || !verificationToken || !name || !tribeName || !color || !emoji || !season || !tribeArray) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const formattedPhone = toE164(phone);

    if (!formattedPhone) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    // Server-side proof of ownership: the client can only get a valid
    // verificationToken by successfully checking a code with Twilio first.
    if (!verifyPhoneVerificationToken(verificationToken, formattedPhone)) {
      return NextResponse.json({ message: 'Phone verification expired or invalid. Please verify again.' }, { status: 401 });
    }

    // Check if the player already exists
    let player = await prisma.player.findUnique({
      where: { phone: formattedPhone },
    });

    if (!player) {
      player = await prisma.player.create({
        data: {
          phone: formattedPhone,
          name,
          passwordHash: '',
          playerTribes: [],
        },
      });
    }

    const newPlayerTribe = await prisma.playerTribe.create({
      data: {
        playerId: player.id,
        tribeName,
        tribeArray,
        color,
        emoji,
        season
      },
    });

    await prisma.player.update({
      where: { id: player.id },
      data: {
        playerTribes: [...player.playerTribes, newPlayerTribe.id],
      },
    });

    return NextResponse.json({ 
      message: 'Player and PlayerTribe updated successfully',
      tribeId: newPlayerTribe.id 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 });
  }
}