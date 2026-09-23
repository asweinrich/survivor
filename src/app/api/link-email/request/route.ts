import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { issueEmailLinkToken } from '@/lib/emailLinkToken';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const targetPlayerId = (session?.user as any)?.playerId;

    if (!targetPlayerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    // Always respond the same way regardless of match, to avoid leaking
    // whether an email has played before.
    const genericResponse = NextResponse.json({
      message: 'Thanks! If that email has past tribes, a tribe transfer link has been sent. Please check your email. The transfer link will expire after 30 minutes.',
    });

    if (!email) return genericResponse;

    const oldPlayer = await prisma.player.findUnique({ where: { email } });
    if (!oldPlayer || oldPlayer.id === targetPlayerId) return genericResponse;
    if (!oldPlayer.playerTribes || oldPlayer.playerTribes.length === 0) return genericResponse;

    const token = issueEmailLinkToken({ email, targetPlayerId: Number(targetPlayerId) });
    const host = process.env.NEXTAUTH_URL || 'https://survivorfantasy.app';
    const confirmUrl = `${host}/link-email/confirm?token=${encodeURIComponent(token)}`;

    const transport = nodemailer.createTransport(process.env.EMAIL_SERVER as any);
    await transport.sendMail({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Link past Survivor Fantasy Tribes',
      text: `Click to confirm and link your past tribes to your new Season 51 account:\n${confirmUrl}\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family:system-ui;padding:24px;background:#0c0a09;color:#e7e5e4">
          <h1 style="margin:0 0 12px;font-size:20px;">Link your past tribes</h1>
          <p>Click below to confirm and transfer your past Survivor Fantasy tribes to your new Season 51 account:</p>
          <p><a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#22c55e;color:#0c0a09;text-decoration:none;font-weight:600">Link my tribes</a></p>
          <p style="margin-top:12px;font-size:12px;opacity:.7">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return genericResponse;
  } catch (error: any) {
    console.error('link-email/request error', error);
    return NextResponse.json({
      message: 'Thanks! If that email has past tribes, a tribe transfer link has been sent. Please check your email. The transfer link will expire after 30 minutes.',
    });
  }
}