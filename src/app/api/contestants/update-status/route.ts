import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase() || '';
    if (!email || email !== 'asweinrich@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Validate and normalize
    const ops = updates
      .map((u: any) => {
        const id = Number(u?.id);
        if (!Number.isFinite(id)) return null;
        const inPlay = Boolean(u?.inPlay);
        const voteOutOrderRaw = u?.voteOutOrder;
        const voteOutOrder =
          voteOutOrderRaw === null || voteOutOrderRaw === undefined
            ? null
            : Number(voteOutOrderRaw);
        if (voteOutOrder !== null && !Number.isFinite(voteOutOrder)) return null;

        return prisma.contestant.update({
          where: { id },
          data: { inPlay, voteOutOrder },
        });
      })
      .filter(Boolean) as ReturnType<typeof prisma.contestant.update>[];

    if (ops.length === 0) {
      return NextResponse.json({ error: 'No valid updates' }, { status: 400 });
    }

    await prisma.$transaction(ops);

    return NextResponse.json({ status: 'ok', count: ops.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}