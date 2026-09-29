import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Row = {
  season: number
  bucket_start_pt: string
  tribes_drafted: number
}

// Format UTC Date into Pacific local parts (DST-aware) and a stable bucket key
function pacificParts(d: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    hour12: false,
  })

  const parts = fmt.formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''

  // month/day/year from formatter are 2-digit/4-digit
  const month = Number(get('month'))
  const day = Number(get('day'))
  const year = Number(get('year'))
  const hour = Number(get('hour'))
  const weekday = get('weekday').toUpperCase().slice(0, 3) // SUN..SAT

  return { year, month, day, hour, weekday }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function makeBucketStartPTLabel(
  year: number,
  month: number,
  day: number,
  bucketHour: number
) {
  // "YYYY-MM-DD HH:00:00" in PT-local wall-clock
  return `${year}-${pad(month)}-${pad(day)} ${pad(bucketHour)}:00:00`
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // supports: /api/draft-stats?season=51
    // or       /api/draft-stats?seasons=49,50
    const seasonParam = searchParams.get('season')
    const seasonsParam = searchParams.get('seasons')

    let seasons: number[] = []

    if (seasonsParam) {
      seasons = seasonsParam
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n))
    } else if (seasonParam) {
      const n = Number(seasonParam)
      if (Number.isFinite(n)) seasons = [n]
    } else {
      return NextResponse.json(
        { error: 'Missing season or seasons query param' },
        { status: 400 }
      )
    }

    if (seasons.length === 0) {
      return NextResponse.json({ error: 'Invalid season value(s)' }, { status: 400 })
    }

    // Pull drafted tribes (createdAt is UTC in DB)
    const tribes = await prisma.playerTribe.findMany({
      where: { season: { in: seasons } },
      select: {
        season: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // season -> bucketKey -> count
    const grouped = new Map<number, Map<string, number>>()

    for (const row of tribes) {
      const { year, month, day, hour } = pacificParts(row.createdAt)
      const bucketHour = Math.floor(hour / 4) * 4 // 0,4,8,12,16,20
      const bucket = makeBucketStartPTLabel(year, month, day, bucketHour)

      if (!grouped.has(row.season)) grouped.set(row.season, new Map())
      const seasonMap = grouped.get(row.season)!
      seasonMap.set(bucket, (seasonMap.get(bucket) ?? 0) + 1)
    }

    const bySeason: Record<string, Row[]> = {}

    for (const season of seasons) {
      const m = grouped.get(season) ?? new Map<string, number>()
      const rows = Array.from(m.entries())
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([bucket_start_pt, tribes_drafted]) => ({
          season,
          bucket_start_pt,
          tribes_drafted,
        }))
      bySeason[String(season)] = rows
    }

    return NextResponse.json(
      {
        bySeason,
        totals: Object.fromEntries(
          Object.entries(bySeason).map(([season, rows]) => [
            season,
            rows.reduce((sum, r) => sum + r.tribes_drafted, 0),
          ])
        ),
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch (e: any) {
    console.error('draft-stats GET error', e)
    return NextResponse.json(
      { error: e?.message || 'Server error' },
      { status: 500 }
    )
  }
}