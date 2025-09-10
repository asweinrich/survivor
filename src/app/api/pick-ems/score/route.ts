import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computePickEmScore } from '@/lib/utils/pickEmScoring';
import { PickEmScoreBreakdown } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const season = parseInt(searchParams.get('season') || '', 10);
    const week = parseInt(searchParams.get('week') || '', 10);

    if (!season || !week) {
      return NextResponse.json({ error: 'Missing season or week' }, { status: 400 });
    }

    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      select: {
        id: true,
        options: true,    // Array of PickEmOption
        answers: true,    // Array of correct option IDs
        question: true,   // Optional: question or label text
      }
    });

    const picks = await prisma.pick.findMany({
      where: { pickId: { in: pickEms.map(pe => pe.id) } },
      select: { pickId: true, playerId: true, selection: true }
    });

    // Group breakdowns per player
    const breakdowns: Record<number, PickEmScoreBreakdown[]> = {};

    for (const pick of picks) {
      const pickEm = pickEms.find(pe => pe.id === pick.pickId);
      if (!pickEm) continue;
      if (!Array.isArray(pickEm.options)) continue;
      const option = pickEm.options.find((opt: any) => opt.id === pick.selection) as { id: number; [key: string]: any};
      if (!option) continue;;

      // Handle empty/null answers: do not score or penalize
      const validAnswers = Array.isArray(pickEm.answers) && pickEm.answers.length > 0 && pickEm.answers.some(a => typeof a === "number");
      const answers = pickEm.answers as number[];
      const isCorrect = validAnswers
        ? answers.includes(option.id)
        : false;
      const points = validAnswers
        ? computePickEmScore(
            { optionId: option.id },
            { id: pickEm.id, options: pickEm.options, answers: pickEm.answers }
          )
        : 0;

      // Only include breakdown if the pickEm has valid answers
      if (validAnswers) {
        const breakdown: PickEmScoreBreakdown = {
          pickEmId: pickEm.id,
          optionId: option.id,
          isCorrect,
          points,
          value: option.value,
          question: pickEm.question,
          type: option.type,
          label: option.label ?? option.value?.toString() ?? undefined,
        };
        if (!breakdowns[pick.playerId]) breakdowns[pick.playerId] = [];
        breakdowns[pick.playerId].push(breakdown);
      }
    }

    // Compute total scores per player
    const scores: Record<number, number> = {};
    Object.keys(breakdowns).forEach(pid => {
      scores[Number(pid)] = breakdowns[Number(pid)].reduce((acc, br) => acc + br.points, 0);
    });

    return NextResponse.json({ season, week, scores, breakdowns });
  } catch (error) {
    console.error('Error scoring pick-ems:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}