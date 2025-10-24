import React, { useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { hexToRgba } from '@/lib/utils/color'
import { TribeBadges } from '@/lib/utils/tribes'
import type { Contestant, Tribe } from '@/lib/types'
import Image from 'next/image'

/**
 * WeekStats
 *
 * Accepts optional `tribes` and `contestants` props to avoid refetching season data
 * when the parent already has it. If not provided, it will gracefully fall back
 * to using empty arrays (so parent should pass them where possible).
 */

type StatOption = {
  id: number | string
  label: string
  value?: any
  count: number
  percent: number // 0-100 integer
}

type QuestionStat = {
  id: number
  question: string
  type?: string
  total?: number
  options: StatOption[]
}

export function WeeklyStats({
  season,
  week,
  tribes = [],
  contestants = [],
}: {
  season: string | number
  week: number
  tribes?: Tribe[]
  contestants?: Contestant[]
}) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionStat[]>([])

  // Map contestants for quick lookup (parent should pass contestants to avoid this map creation)
  const contestantMap = useMemo<Record<number, Contestant>>(() => {
    return (contestants || []).reduce((acc: Record<number, Contestant>, c: Contestant) => {
      if (c && typeof c.id === 'number') acc[c.id] = c
      return acc
    }, {})
  }, [contestants])

  const firstName = (full?: string) => (full || '').split(' ')[0] || ''

  useEffect(() => {
    const ac = new AbortController()
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/pick-ems/weekly-stats?season=${season}&week=${week}`, {
          signal: ac.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`Failed to load stats (${res.status})`)
        const data = await res.json()

        const q: QuestionStat[] = Array.isArray(data?.questions)
          ? data.questions.map((qq: any) => ({
              id: Number(qq.id ?? qq.questionId ?? Math.random()),
              question: qq.question ?? qq.title ?? `Question ${qq.id ?? ''}`,
              type: qq.type ?? qq.questionType ?? undefined,
              total: Number(
                qq.total ??
                  qq.participants ??
                  (qq.options || []).reduce((s: number, o: any) => s + Number(o.count ?? 0), 0)
              ),
              options: (qq.options || []).map((o: any, idx: number) => ({
                id: o?.id ?? o?.optionId ?? idx,
                label: String(o?.label ?? o?.name ?? (o?.value != null ? String(o.value) : '')),
                value: o?.value ?? o?.id ?? o?.optionId ?? null,
                count: Number(o?.count ?? o?.votes ?? 0),
                percent: Number.isFinite(Number(o?.percent))
                  ? Math.max(0, Math.min(100, Math.round(Number(o.percent))))
                  : (qq.total
                      ? Math.max(0, Math.min(100, Math.round(((o?.count ?? 0) / (qq.total || 1)) * 100)))
                      : 0),
              })),
            }))
          : []

        setQuestions(q)
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        setError(err?.message ?? 'Error loading stats')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
    return () => ac.abort()
  }, [season, week])

  const barColorForIndex = (i: number) => {
    const palette = ['#fb923c', '#60a5fa', '#34d399', '#f472b6', '#facc15', '#a78bfa']
    return palette[i % palette.length]
  }

  console.log(contestantMap[64])

  return (
    <div className="max-w-3xl mx-auto mb-4">
      <div className="overflow-hidden">
        <div className="">
          {error && (
            <div className="flex items-center gap-2 text-red-300 bg-red-900/20 p-3 rounded-md mb-3">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          {loading && !error ? (
            <div className="flex items-center gap-3 justify-center py-4">
              <ArrowPathIcon className="w-6 h-6 animate-spin text-stone-300" />
              <div className="text-stone-400 font-lostIsland text-xl uppercase tracking-wider">Loading stats…</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-4 text-stone-400 text-sm">No stats available for this week yet.</div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="p-3 rounded-lg border border-stone-700 bg-stone-800/90">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-lostIsland uppercase text-sm tracking-wider text-stone-200 mb-1">
                        {q.question}
                      </div>
                      <div className="text-xs text-stone-400 uppercase font-lostIsland tracking-wider">
                        {q.total ?? 0} Picks
                      </div>
                    </div>
                    
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const pct = Math.max(
                        0,
                        Math.min(
                          100,
                          Math.round(Number(opt.percent ?? (opt.count && q.total ? (opt.count / (q.total || 1)) * 100 : 0)))
                        )
                      )
                      
                      // If question type is 'tribe', attempt to use the tribe's color(s)
                      let startColor: string
                      let endColor: string
                      if ((q.type).toLowerCase() === 'tribe') {
                        const tribeId = Number(opt.label)
                        const t = Array.isArray(tribes) ? (tribes as Tribe[]).find((x) => Number(x.id) === tribeId) : undefined
                        if (t && t.color) {
                          startColor = hexToRgba(t.color, 1)
                          endColor = hexToRgba(t.color, 0.85)
                        } else {
                          const fallback = barColorForIndex(i)
                          startColor = hexToRgba(fallback, 1)
                          endColor = hexToRgba(fallback, 0.8)
                        }
                      } else {
                        const fallback = barColorForIndex(i)
                        startColor = hexToRgba(fallback, 1)
                        endColor = hexToRgba(fallback, 0.8)
                      }

                      let labelNode: React.ReactNode = opt.label

                      if ((q.type).toLowerCase() === 'tribe') {

                        const tribeId = Number(opt.label)
                        labelNode = (
                          <div className="inline-block">
                            <TribeBadges tribeIds={[tribeId]} tribes={Array.isArray(tribes) ? tribes : []} />
                          </div>
                        )
                      } else if ((q.type).toLowerCase() === 'contestant') {
                        const cid = Number(opt.label)
                        const c = contestantMap[cid]
                        const img = c?.img ?? 'placeholder'
                        const name = c?.name ?? opt.label ?? String(opt.value ?? '')
                        labelNode = (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 overflow-hidden inline-block relative rounded-full border border-stone-600">
                              <Image
                                src={`/imgs/${img}.png`}
                                alt={name}
                                fill
                                className="rounded-full object-cover block w-full h-full"
                                style={{
                                  transform: `scale(1.4)`,
                                  transformOrigin: `50% 28%`,
                                }}
                              />
                            </div>
                            <span className="text-lg uppercase font-lostIsland tracking-wider">{firstName(name)}</span>
                          </div>
                        )
                      } else {
                        labelNode = <span className="text-lg truncate">{opt.label}</span>
                      }

                      return (
                        <div key={opt.id ?? i} className="flex items-center gap-3">
                          <div className="w-36 text-sm font-lostIsland uppercase text-stone-300 truncate">{labelNode}</div>

                          <div className="flex-1">
                            <div className="h-4 rounded-sm bg-stone-700 overflow-hidden">
                              <div
                                className="h-full rounded-sm"
                                style={{
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${startColor}, ${endColor})`,
                                }}
                                aria-hidden
                              />
                            </div>
                          </div>

                          <div className="w-10 text-center text-lg tracking-wider font-lostIsland text-stone-300/90">{pct}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}