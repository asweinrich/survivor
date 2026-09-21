import { NextResponse } from 'next/server';
import { twilioClient, verifyServiceSidValue, toE164 } from '@/lib/twilio';

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

    await twilioClient.verify.v2
      .services(verifyServiceSidValue)
      .verifications.create({ to: formattedPhone, channel: 'sms' });

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}