import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type OptionIn = {
  id?: number;
  type: 'contestant' | 'tribe' | 'boolean';
  value: number | null;
  label?: string;
  pointValue: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const season = Number(body?.season);
    const week = Number(body?.week);
    const question = String(body?.question ?? '').trim();
    const description = String(body?.description ?? '').trim();
    const options: OptionIn[] = Array.isArray(body?.options) ? body.options : [];

    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Invalid season or week' }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    if (options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 });
    }

    // Reindex IDs so each pick-em has option ids 0..n-1
    const normalizedOptions = options.map((o, idx) => {
      const type = o?.type;
      const pointValue = Number(o?.pointValue);

      if (!['contestant', 'tribe', 'boolean'].includes(type)) {
        throw new Error(`Option ${idx + 1} has invalid type`);
      }
      if (!Number.isFinite(pointValue)) {
        throw new Error(`Option ${idx + 1} has invalid pointValue`);
      }

      if (type === 'boolean') {
        const label = String(o?.label ?? '').trim();
        if (!label) throw new Error(`Option ${idx + 1} is missing a label`);
        return { id: idx, type, value: null, label, pointValue };
      }

      // contestant / tribe: value is the contestant/tribe id,
      // and label is that id as a string (WeeklyStats does Number(opt.label))
      const value = Number(o?.value);
      if (!Number.isFinite(value)) {
        throw new Error(`Option ${idx + 1} must have a numeric value`);
      }
      return { id: idx, type, value, label: String(value), pointValue };
    });

    const created = await prisma.pickEm.create({
      data: {
        season,
        week,
        question,
        description: description || null,
        options: normalizedOptions,
      },
    });

    return NextResponse.json({ status: 'ok', id: created.id });
  } catch (e: any) {
    console.error('admin pick-ems POST error', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}