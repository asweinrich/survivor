import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Body = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(24, 'Name must be ≤ 24 characters.'),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;

    const result = await prisma.player.updateMany({
      where: { email },   
      data: { name },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'No Player found for that email.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, updated: result.count, name });
  } catch (err) {
    console.error('player/update-name error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
