import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/pick-ems/stats?season=...&week=...
 *
 * Returns aggregated pick statistics for each pick-em in the given season/week.
 *
 * Response shape:
 * {
 *   questions: [
 *     {
 *       id: number,
 *       question: string,
 *       type: string,      // inferred/explicit question type: 'boolean' | 'tribe' | 'contestant' | 'text' | ...
 *       total: number,     // number of participants who made a pick for that question
 *       options: [
 *         { id: any, label: string, count: number, percent: number }
 *       ]
 *     },
 *     ...
 *   ]
 * }
 *
 * The implementation is defensive about option shapes (options may be stored as JSON)
 * and about how a pick's `selection` relates to an option (selection can match
 * option.id or option.value). Percent is returned as an integer (0-100).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const seasonStr = searchParams.get('season')
    const weekStr = searchParams.get('week')

    if (!seasonStr || !weekStr) {
      return NextResponse.json({ error: 'Missing ?season=&week=' }, { status: 400 })
    }

    const season = Number(seasonStr)
    const week = Number(weekStr)
    if (!Number.isFinite(season) || !Number.isFinite(week)) {
      return NextResponse.json({ error: 'Invalid season or week' }, { status: 400 })
    }

    // 1) Load pick-ems for this week
    const pickEms = await prisma.pickEm.findMany({
      where: { season, week },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        question: true,
        options: true, // stored as JSON in many schemas
      },
    })

    if (!pickEms || pickEms.length === 0) {
      return NextResponse.json({ questions: [] })
    }

    const pickEmIds = pickEms.map((pe) => pe.id)

    // 2) Load all picks for those pick-ems
    // Each pick: { pickId, playerId, selection }
    const picks = await prisma.pick.findMany({
      where: { pickId: { in: pickEmIds } },
      select: { pickId: true, playerId: true, selection: true },
    })

    // Group picks by pickEm id for faster aggregation
    const picksByPickId = new Map<number, Array<{ playerId: number; selection: any }>>()
    for (const p of picks) {
      const arr = picksByPickId.get(p.pickId) || []
      arr.push({ playerId: p.playerId, selection: p.selection })
      picksByPickId.set(p.pickId, arr)
    }

    // Helper: determine question type from options (prefer explicit option.type if present)
    const inferQuestionType = (rawOptions: any[]): string => {
      if (!Array.isArray(rawOptions) || rawOptions.length === 0) return 'text'
      // collect option types that are truthy
      const types = rawOptions.map((o) => (o && typeof o === 'object' ? (o.type ?? null) : null)).filter(Boolean)
      if (types.length === 0) return 'text'
      // if all types agree, return that type; otherwise return the first known type
      const first = String(types[0])
      const allSame = types.every((t) => String(t) === first)
      return allSame ? first : first
    }

    // 3) Build response: for each pickEm, compute counts / percents per option (percent as integer)
    const questions = pickEms.map((pe) => {
      const rawOptions: any[] = Array.isArray(pe.options) ? pe.options : []
      const picksForThis = picksByPickId.get(pe.id) || []

      // total participants: use unique playerIds (defensive)
      const totalParticipants = new Set<number>(picksForThis.map((p) => p.playerId)).size

      // Infer question type (boolean | tribe | contestant | text | ...)
      const questionType = inferQuestionType(rawOptions)

      // Build a normalized option list (keep id/value/label info)
      const options = rawOptions.map((o: any, idx: number) => {
        const optId = o?.id ?? o?.optionId ?? o?.value ?? idx
        const optValue = o?.value ?? o?.id ?? o?.optionId ?? null
        const label = o?.label ?? o?.name ?? String(o?.value ?? o?.label ?? o ?? '')
        // Count picks that match this option. Selection may match option.id or option.value
        const count = picksForThis.reduce((acc, pick) => {
          if (pick.selection == null) return acc
          // compare loosely but consistently using string form
          const s = String(pick.selection)
          if (optId != null && String(optId) === s) return acc + 1
          if (optValue != null && String(optValue) === s) return acc + 1
          return acc
        }, 0)

        // Percent is integer 0..100 (prefer stored opt.percent if present, but coerce to integer)
        const percent = totalParticipants > 0 ? Number(((count / totalParticipants) * 100).toFixed(0)) : 0
        

        return {
          id: optId,
          label,
          count,
          percent,
        }
      })

      return {
        id: pe.id,
        question: pe.question ?? `Question ${pe.id}`,
        type: questionType,
        total: totalParticipants,
        options,
      }
    })

    return NextResponse.json({ questions })
  } catch (err: any) {
    console.error('pick-ems/stats error', err)
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 })
  }
}