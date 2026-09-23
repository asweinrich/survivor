import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { twilioClient, verifyServiceSidValue, toE164 } from '@/lib/twilio';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ message: 'Phone number required' }, { status: 400 });
    }

    const formattedPhone = toE164(phone);
    if (!formattedPhone) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    // Gate: only allow OTP send if this phone already belongs to a Player
    // who has drafted at least one tribe. This is what keeps random/spam
    // numbers from racking up Twilio Verify charges.
    const player = await prisma.player.findUnique({
      where: { phone: formattedPhone },
      select: { id: true, playerTribes: true },
    });

    if (!player || !player.playerTribes || player.playerTribes.length === 0) {
      return NextResponse.json(
        { message: 'No tribes found for this phone number. Draft a tribe first, then sign in.' },
        { status: 404 }
      );
    }

    await twilioClient.verify.v2
      .services(verifyServiceSidValue)
      .verifications.create({ to: formattedPhone, channel: 'sms' });

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error: any) {
    console.error('Error sending sign-in verification code:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}