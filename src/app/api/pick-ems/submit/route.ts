import { NextResponse } from 'next/server';
import { PrismaClient, PickEmStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { weeklyLockAtPT } from '@/lib/pick-em/lock';

const prisma = new PrismaClient();

// Optional: allow submitting past lock in local/dev by setting PICKEMS_IGNORE_LOCK=1
const IGNORE_LOCK =
  process.env.PICKEMS_IGNORE_LOCK === '1' && process.env.NODE_ENV !== 'production';

// Resolve the Player.id for the signed-in user
async function getCurrentPlayerId(session: any) {
  if (!session?.user) throw new Error('Not signed in');

  if (session.user.email) {
    const p = await prisma.player.findFirst({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (p) return p.id;
  }
  throw new Error('No Player record for user');
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const season = Number(body?.season);
    const week = Number(body?.week);
    const picks = Array.isArray(body?.picks) ? body.picks : [];
    const action: 'submit' | 'clear' = body?.action === 'clear' ? 'clear' : 'submit';

    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Missing or invalid payload' }, { status: 400 });
    }
    if (action === 'submit' && picks.length === 0) {
      return NextResponse.json({ error: 'No picks to submit' }, { status: 400 });
    }

    const playerId = await getCurrentPlayerId(session);

    // Fetch pick-ems for validation and scored-lock checks
    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      select: { id: true, status: true, options: true },
    });
    if (pickEms.length === 0) {
      return NextResponse.json({ error: 'No pick-ems found for this week' }, { status: 404 });
    }
    const peById = new Map(pickEms.map((pe) => [pe.id, pe]));
    const weekPickEmIds = pickEms.map((pe) => pe.id);

    // Single canonical lock per (season, week)
    const effectiveLockAt = weeklyLockAtPT(season, week);
    const nowTs = Date.now();

    // --- TIME LOCK (skipped in dev if IGNORE_LOCK=1) ---
    if (!IGNORE_LOCK && effectiveLockAt.getTime() <= nowTs) {
      return NextResponse.json(
        {
          error: 'Picks are locked (time)',
          reason: 'time',
          season,
          week,
          nowIso: new Date(nowTs).toISOString(),
          lockAtIso: effectiveLockAt.toISOString(),
          ignoreLock: IGNORE_LOCK,
        },
        { status: 409 }
      );
    }

    // --- ACTION: CLEAR ---
    if (action === 'clear') {
      // Disallow clearing if any pick-em for the week is already SCORED (unless ignore)
      if (!IGNORE_LOCK && pickEms.some((pe) => pe.status === PickEmStatus.SCORED)) {
        return NextResponse.json(
          { error: 'Picks are locked (scored)', reason: 'scored', season, week },
          { status: 409 }
        );
      }

      const { count } = await prisma.pick.deleteMany({
        where: { playerId, pickId: { in: weekPickEmIds } },
      });

      return NextResponse.json({
        ok: true,
        status: 'cleared',
        count,
        picks: [],
        lockAt: effectiveLockAt,
        ignoreLock: IGNORE_LOCK,
      });
    }

    // --- ACTION: SUBMIT --- (validate each pick)
    for (const { pickId, selection } of picks as Array<{ pickId: number; selection: number }>) {
      if (!Number.isFinite(pickId) || !Number.isFinite(selection)) {
        return NextResponse.json({ error: 'Bad pick payload' }, { status: 400 });
      }

      const pe = peById.get(pickId);
      if (!pe) {
        return NextResponse.json(
          { error: `pickId ${pickId} is not in season ${season}, week ${week}` },
          { status: 400 }
        );
      }

      // --- SCORED LOCK (also skipped in dev if IGNORE_LOCK=1) ---
      if (!IGNORE_LOCK && pe.status === PickEmStatus.SCORED) {
        return NextResponse.json(
          {
            error: 'Picks are locked (scored)',
            reason: 'scored',
            pickId,
            pickEmStatus: pe.status,
            season,
            week,
          },
          { status: 409 }
        );
      }

      // Selection must be one of the option ids
      const opts: any[] = Array.isArray(pe.options) ? pe.options : [];
      const valid = opts.some((o) => Number(o?.id) === Number(selection));
      if (!valid) {
        return NextResponse.json(
          { error: `Selection ${selection} not valid for pickId ${pickId}` },
          { status: 400 }
        );
      }
    }

    // Determine created vs updated *for this week* before we write
    const existingCount = await prisma.pick.count({
      where: { playerId, pickId: { in: weekPickEmIds } },
    });
    const created = existingCount === 0;

    // Replace this player's picks for the week atomically:
    // delete all week picks, then insert the submitted set.
    // (Prevents stale leftovers if they changed answers.)
    const results = await prisma.$transaction([
      prisma.pick.deleteMany({ where: { playerId, pickId: { in: weekPickEmIds } } }),
      prisma.pick.createMany({
        data: (picks as Array<{ pickId: number; selection: number }>).map((p) => ({
          playerId,
          pickId: p.pickId,
          selection: p.selection,
        })),
      }),
    ]);

    // results[1] is the createMany result with a .count
    const createdCount = (results[1] as unknown as { count: number })?.count ?? picks.length;

    return NextResponse.json({
      ok: true,
      status: created ? 'created' : 'updated',
      count: createdCount,
      // Return lockAt for UI confirmation/snackbar
      lockAt: effectiveLockAt,
      ignoreLock: IGNORE_LOCK,
    });
  } catch (err: any) {
    console.error('pickems/submit POST error', err);
    const msg = typeof err?.message === 'string' ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
