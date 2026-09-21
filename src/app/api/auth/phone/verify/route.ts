import { NextResponse } from 'next/server';
import { twilioClient, verifyServiceSidValue, toE164 } from '@/lib/twilio';
import { issuePhoneVerificationToken } from '@/lib/verifyToken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ message: 'Phone and code required' }, { status: 400 });
    }

    const formattedPhone = toE164(phone);

    if (!formattedPhone) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    const check = await twilioClient.verify.v2
      .services(verifyServiceSidValue)
      .verificationChecks.create({ to: formattedPhone, code });

    if (check.status !== 'approved') {
      return NextResponse.json({ message: 'Invalid or expired code' }, { status: 401 });
    }

    const verificationToken = issuePhoneVerificationToken(formattedPhone);

    return NextResponse.json({ message: 'Verified', phone: formattedPhone, verificationToken });
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}