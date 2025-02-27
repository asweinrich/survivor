import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);
    const { playerTribes } = body;

    if (!playerTribes || !Array.isArray(playerTribes)) {
      return NextResponse.json(
        { message: 'Missing or invalid playerTribes field' },
        { status: 400 }
      );
    }

    // Update the 'paid' status for each player tribe.
    const updatedTribes = await Promise.all(
      playerTribes.map(async (tribe: { id: number; paid: boolean }) => {
        return await prisma.playerTribe.update({
          where: { id: tribe.id },
          data: { paid: tribe.paid },
        });
      })
    );

    return NextResponse.json({
      message: 'Payment statuses updated successfully',
      updatedTribes,
    });
  } catch (error) {
    console.error('Error updating payment statuses:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
