'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon,
  MinusCircleIcon,
  LockClosedIcon,
  XCircleIcon,
  FireIcon,
} from '@heroicons/react/24/solid'

import { useSpoiler } from '../../context/SpoilerContext'
import { useSeasonData } from '@/lib/hooks/useSeasonData'
import { hexToRgba } from '@/lib/utils/color'
import type { Tribe, Contestant, PlayerTribe, PickEmScoreBreakdown } from '@/lib/types'
import { LargeTribeBadges, TribeBadges } from '@/lib/utils/tribes'
import { rankAndScorePlayerTribes } from '@/lib/utils/score'
import { ScoringSummary } from './ScoringSummary';
import { PendingSummary } from './PendingSummary';

// ---- Page ------------------------------------------------------------
export default function WeeklyPickEms() {
  const [season, setSeason] = useState('49')
  const [week, setWeek] = useState<number>(1)
  const [expandedTribes, setExpandedTribes] = useState<number[]>([])
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set())
  const [lockAt, setLockAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [peModalOpen, setPeModalOpen] = useState(false)
  const [peLoading, setPeLoading] = useState(false)
  const [peError, setPeError] = useState<string | null>(null)
  const [markets, setMarkets] = useState<Array<{ id: number; question: string; description: string; options: Array<{ id: number; label: string; type: string; value: any; pointValue: number }> }>>([])
  const [selections, setSelections] = useState<Record<number, number | null>>({})
  const [tribeSummaries, setTribeSummaries] = useState<Record<number, Array<{ question: string; option: any }>>>({})
  const [tribeSummaryLoading, setTribeSummaryLoading] = useState<Record<number, boolean>>({})
  const [tribeSummaryError, setTribeSummaryError] = useState<Record<number, string | null>>({})

  const [scoringBreakdowns, setScoringBreakdowns] = useState<Record<number, PickEmScoreBreakdown[]>>({});
  const [scoringScores, setScoringScores] = useState<Record<number, number>>({});
  const [scored, setScored] = useState(false);

  const [banner, setBanner] = useState<null | { kind: 'submitted' | 'updated' | 'cleared'; msg: string }>(null)

  const { data: session } = useSession()
  const { revealSpoilers } = useSpoiler()
  const { playerTribes, contestants, tribes, loading } = useSeasonData(season)

  const contestantMap = useMemo(
    () =>
      contestants.reduce<Record<number, Contestant>>((acc, c) => {
        acc[c.id] = c
        return acc
      }, {}),
    [contestants]
  )

  const MIN_WEEK = 1
  const MAX_WEEK = 1

  const rankedTribes = useMemo(() => {
    const ranked = rankAndScorePlayerTribes(playerTribes, season, contestantMap) as Array<PlayerTribe & { rank: number }>
    const withStatusFirst = [...ranked].sort((a, b) => {
      const aSub = submittedSet.has(a.id) ? 0 : 1
      const bSub = submittedSet.has(b.id) ? 0 : 1
      if (aSub !== bSub) return aSub - bSub
      return a.rank - b.rank
    })
    return withStatusFirst
  }, [playerTribes, season, contestantMap, submittedSet])

  const firstName = (full?: string) => (full || '').split(' ')[0] || ''

  // ---- FIXED: Always use UTC from API; fallback is disabled ----
  async function fetchStatus() {
    const res = await fetch(`/api/pick-ems/status?season=${season}&week=${week}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('status fetch failed')
    const data = await res.json()
    const set = new Set<number>(Array.isArray(data.submittedTribeIds) ? data.submittedTribeIds : [])
    setSubmittedSet(set)
    if (data.lockAt) {
      // lockAt is UTC ISO string. Always parse as UTC.
      const d = new Date(data.lockAt)
      setLockAt(isNaN(d.getTime()) ? null : d)
    } else {
      setLockAt(null)
    }
    return set
  }

  async function refreshStatusAndSummaries() {
    try {
      const newSubmitted = await fetchStatus()
      setTribeSummaries((prev) => {
        const next = { ...prev }
        for (const id of expandedTribes) delete (next as any)[id]
        return next
      })
      for (const id of expandedTribes) {
        if (newSubmitted.has(id)) await fetchTribeSummary(id)
      }
    } catch (e) {
      // ignore; page already shows status errors elsewhere if needed
    }
  }

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        if (!ignore) await fetchStatus()
      } catch {
        if (!ignore) {
          setSubmittedSet(new Set())
          setLockAt(null)
        }
      }
    })()
    return () => {
      ignore = true
    }
  }, [season, week])

  useEffect(() => {}, [scoringBreakdowns, scoringScores]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch(`/api/pick-ems/score?season=${season}&week=${week}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch scores');
        const data = await res.json();
        setScoringBreakdowns(data.breakdowns || {});
        setScoringScores(data.scores || {});
        setScored(Object.keys(data.breakdowns || {}).length > 0);
      } catch (e) {
        setScored(false);
        setScoringBreakdowns({});
        setScoringScores({});
      }
    }
    fetchScores();
  }, [season, week]);

  // ---- FIXED: Countdown always uses UTC lockAt from API ----
  useEffect(() => {
    if (!lockAt) return
    const tick = () => {
      const diff = lockAt.getTime() - Date.now() // both UTC
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return true
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown({ days: d, hours: h, minutes: m, seconds: s })
      return false
    }
    const lockedNow = tick()
    if (lockedNow) return
    const interval = setInterval(() => {
      const isLocked = tick()
      if (isLocked) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)

  }, [lockAt])

  // ---- FIXED: Display lockAt in PT for user clarity, but do NOT use it for countdown ----
  const lockAtPTString = lockAt
    ? lockAt.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const locked = countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0

  const fetchTribeSummary = async (tribeId: number) => {
    setTribeSummaryLoading((prev) => ({ ...prev, [tribeId]: true }))
    setTribeSummaryError((prev) => ({ ...prev, [tribeId]: null }))
    try {
      const res = await fetch(`/api/pick-ems/summary?season=${season}&week=${week}&tribeId=${tribeId}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load picks summary')
      const data = await res.json()
      const picks = Array.isArray(data?.picks) ? data.picks : []
      const normalized = picks.map((p: any) => ({
        question: p.question ?? p.pickEm?.question ?? 'Question',
        option: p.option ?? p.selected ?? p.selection,
      }))
      setTribeSummaries((prev) => ({ ...prev, [tribeId]: normalized }))
    } catch (e: any) {
      setTribeSummaryError((prev) => ({ ...prev, [tribeId]: e?.message || 'Error loading summary' }))
    } finally {
      setTribeSummaryLoading((prev) => ({ ...prev, [tribeId]: false }))
    }
  }

  const toggleDropdown = (tribeId: number) =>
    setExpandedTribes((prev) => (prev.includes(tribeId) ? prev.filter((id) => id !== tribeId) : [...prev, tribeId]))

  const openPickEmModal = async () => {
    if (!session) {
      window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname)
      return
    }
    if (locked) return
    setPeModalOpen(true)
    setPeLoading(true)
    setPeError(null)
    try {
      const res = await fetch(`/api/pick-ems/list?season=${season}&week=${week}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load pick-ems.')
      const data = await res.json()
      const list = Array.isArray(data?.pickEms) ? data.pickEms : []
      setMarkets(list)
      const existing = data?.existingSelections ?? {}
      setSelections(existing)
    } catch (e: any) {
      setPeError(e?.message || 'Error loading pick-ems.')
    } finally {
      setPeLoading(false)
    }
  }
  const closePickEmModal = () => {
    setPeModalOpen(false)
    setPeError(null)
  }

  const handleSelect = (pickEmId: number, optionId: number) => setSelections((prev) => ({ ...prev, [pickEmId]: optionId }))

  async function submitPicks() {
    try {
      setPeLoading(true)
      setPeError(null)
      const payload = Object.entries(selections)
        .filter(([, optionId]) => optionId != null)
        .map(([pickId, optionId]) => ({ pickId: Number(pickId), selection: Number(optionId) }))

      const resp = await fetch('/api/pick-ems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ season: Number(season), week, picks: payload, action: 'submit' }),
      })
      if (!resp.ok) throw new Error('Failed to submit picks')
      const data = await resp.json()
      const status: 'created' | 'updated' | 'cleared' | undefined = data?.status
      if (status === 'updated') setBanner({ kind: 'updated', msg: 'Picks updated' })
      else setBanner({ kind: 'submitted', msg: 'Picks submitted' })
      setPeModalOpen(false)
      await refreshStatusAndSummaries()
    } catch (e: any) {
      setPeError(e?.message || 'Submit failed')
    } finally {
      setPeLoading(false)
    }
  }

  async function clearPicks() {
    if (!confirm('Clear all your picks for this week?')) return
    try {
      setPeLoading(true)
      setPeError(null)
      const resp = await fetch('/api/pick-ems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ season: Number(season), week, picks: [], action: 'clear' }),
      })
      if (!resp.ok) throw new Error('Failed to clear picks')
      setSelections({})
      setBanner({ kind: 'cleared', msg: 'Picks cleared' })
      setPeModalOpen(false)
      await refreshStatusAndSummaries()
    } catch (e: any) {
      setPeError(e?.message || 'Clear failed')
    } finally {
      setPeLoading(false)
    }
  }

  // ---- Render --------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      
      {/* Hero/Header */}
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        <div className="z-0">
          <Image src="/imgs/graphics/home-graphic.png" alt="Survivor Background" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900" />
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Weekly Pick em
        </h1>
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image src={`/imgs/${season}/logo.png`} alt={`Survivor Season ${season} Logo`} width={250} height={250} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Top help / rules */}
        <div className="lowercase text-stone-200 border-y border-stone-500 p-4 mt-8 font-lostIsland tracking-wider ">
          <p className="mb-3">Weekly Pick Ems are an optional side game that can help ..or hurt.. your overall fantasy score.</p>
          <p className="mb-3">Tribes default each week to a status of <span className="text-stone-300">Passed</span>. If you submit picks, your status will update to Locked In. </p>
          <p className="mb-3">Weekly picks can be submitted up until the start of that weeks episode, or each Wednesday at 5PM Pacific, 7PM Central, 8PM Eastern. </p>
        </div>

        {/* Season / Week / CTA / Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 my-8 px-4">
          <div className="flex items-center gap-4">
            <span className="font-lostIsland tracking-wider py-1.5 px-3 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200">Season 49</span>
            <div className="py-1 flex items-center font-lostIsland rounded-md border border-stone-700 bg-stone-800">
              <button className="p-1 hover:bg-stone-700 disabled:opacity-40" onClick={() => setWeek((w) => Math.max(MIN_WEEK, w - 1))} disabled={week <= MIN_WEEK} aria-label="Previous week">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <div className="px-3 text-lg tracking-wider">Week {week}</div>
              <button className="p-1 hover:bg-stone-700 disabled:opacity-40" onClick={() => setWeek((w) => Math.min(MAX_WEEK, w + 1))} disabled={week >= MAX_WEEK} aria-label="Next week">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Countdown + CTA */}
          <div className="flex flex-col items-center gap-4 font-lostIsland">
            <div className="text-center mb-3">
              <h2 className="text-2xl uppercase text-stone-300 mb-4">Week {week} Pick Em Countdown</h2>
              <div className="flex flex-row justify-center items-center space-x-6 lowercase tracking-wider bg-stone-800 border border-stone-700 mx-auto p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl">{countdown.days}</div>
                  <div className="text-stone-400">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{countdown.hours}</div>
                  <div className="text-stone-400">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{countdown.minutes}</div>
                  <div className="text-stone-400">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{countdown.seconds}</div>
                  <div className="text-stone-400">Seconds</div>
                </div>
              </div>
              {lockAtPTString && (
                <div className="mt-2 text-sm text-stone-400">
                  <span>picks lock {lockAtPTString} PT</span>
                </div>
              )}
            </div>
            <button onClick={openPickEmModal} disabled={locked} className={`w-full text-xl uppercase px-4 py-3 rounded-md font-lostIsland tracking-wider border ${locked ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed' : 'bg-orange-600 border-orange-700 text-stone-50 hover:bg-orange-500'}`}>
              {session ? 'Submit your picks' : 'Sign in to submit your picks'}
            </button>
          </div>
        </div>

        {/* Banner modal */}
        {banner && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
            onClick={() => setBanner(null)}
          >
            <div
              className="w-[92%] max-w-md mx-4 rounded-xl border border-stone-700 bg-stone-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 flex items-center gap-3">
                {banner.kind === 'submitted' && <CheckCircleIcon className="w-8 h-8 text-green-400" />}
                {banner.kind === 'updated' && <CheckCircleIcon className="w-8 h-8 text-emerald-400" />}
                {banner.kind === 'cleared' && <XCircleIcon className="w-8 h-8 text-red-400" />}
                <span className="font-lostIsland tracking-wider uppercase text-xl">{banner.msg}</span>
                <button className="ms-auto text-stone-400 hover:text-stone-200" onClick={() => setBanner(null)}>✕</button>
              </div>
              <div className="px-5 pb-4 flex justify-end">
                <button
                  autoFocus
                  className="font-lostIsland w-full text-2xl uppercase p-3 rounded-md border border-stone-700 bg-stone-900 text-stone-100 hover:bg-stone-700"
                  onClick={() => setBanner(null)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard-style list of tribes with status icons */}
        <div className="p-4 border-t border-stone-500">
          <h2 className="font-lostIsland text-xl uppercase mb-4">Tribe Picks</h2>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-10">
              <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
              <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
            </div>
          ) : rankedTribes.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-10 px-4 text-center leading-tight">
              <p className="font-lostIsland text-lg my-2 tracking-wider">No tribes have been drafted for this season yet.</p>
            </div>
          ) : (
            rankedTribes.map((tribe) => {
              const isSubmitted = submittedSet.has(tribe.id)
              const pendingBreakdown = (tribeSummaries[tribe.id] ?? []).map((item: any) => {
                const opt = item.option || {};
                return {
                  question: item.question ?? 'Question',
                  type: opt.type ?? 'text',
                  label: opt.label ?? opt.value ?? '',
                  value: opt.value,
                  pickEmId: opt.pickEmId ?? tribe.id,
                  isCorrect: undefined,
                  points: undefined,
                  ...(opt.pointValue && { pointValue: opt.pointValue }),
                };
              });
              return (
                <div key={tribe.id} className="py-2 px-2 mb-2 rounded-lg border border-stone-700 bg-stone-800">
                  <div
                    className="flex items-center justify-start"
                    onClick={() => {
                      const opening = !expandedTribes.includes(tribe.id)
                      toggleDropdown(tribe.id)
                      if (opening && isSubmitted && !tribeSummaries[tribe.id]) {
                        fetchTribeSummary(tribe.id)
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-3xl" style={{ backgroundColor: hexToRgba(tribe.color, 0.75) }}>
                        {tribe.emoji}
                      </div>
                      <div className="ms-3">
                        <div className="text-lg font-lostIsland leading-none pb-1">{tribe.tribeName}</div>
                        <div className="text-stone-400 font-lostIsland leading-tight">{tribe.playerName}</div>
                      </div>
                    </div>
                    <div className="flex items-center ms-auto me-0 gap-2">
                    {isSubmitted ? (
                      scored ? (
                        (() => {
                          const points = scoringScores[tribe.playerId] ?? 0;
                          let textColor = "text-green-300";
                          let bgColor = "bg-green-900/60";
                          let displayPoints = `${points} pts`;
                          if (points < 0) {
                            textColor = "text-red-300";
                            bgColor = "bg-red-900/60";
                          } else if (points === 0) {
                            textColor = "text-stone-300";
                            bgColor = "bg-stone-700/50";
                          }
                          return (
                            <span className={`inline-flex items-center gap-1 font-lostIsland text-xl lowercase tracking-wider px-2 py-1 rounded-lg ${textColor} ${bgColor}`} title="Scored">
                              {displayPoints}
                            </span>
                            );
                          })()
                        ) : (
                          <span className="tracking-wider inline-flex items-center gap-1 text-orange-300 font-lostIsland uppercase bg-orange-900/60 px-2 py-1 rounded-lg" title="Locked In">
                            locked in
                          </span>
                        )
                      ) : (
                        <span className="tracking-wider inline-flex items-center gap-1 text-gray-300 font-lostIsland uppercase bg-gray-600/60 px-2 py-1 rounded-lg" title="Passed (no picks this week)">
                          passed
                        </span>
                      )}
                      <ChevronDownIcon className={`w-4 h-4 stroke-3 cursor-pointer ${expandedTribes.includes(tribe.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {expandedTribes.includes(tribe.id) && (
                    <div className="px-2 mt-3">
                      {isSubmitted ? (
                        scored ? (
                          <ScoringSummary
                            breakdown={scoringBreakdowns[tribe.playerId] || []}
                            score={scoringScores[tribe.playerId] || 0}
                            tribes={tribes}
                            contestants={contestants}
                          />
                        ) : (
                          <PendingSummary
                            breakdown={pendingBreakdown}
                            score={0}
                            tribes={tribes}
                            contestants={contestants}
                          />
                        )
                      ) : (
                        <div className="flex items-center justify-center py-3 text-stone-400 text-lg font-lostIsland uppercase">
                          <FireIcon className="w-6 h-6 me-3" />
                          <span>No picks submitted for week {week}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Modal */}
        {peModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50" onClick={closePickEmModal}>
            <div className="w-full max-w-3xl h-[92%] overflow-y-auto bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland" onClick={(e) => e.stopPropagation()}>
              <button className="text-stone-400 hover:text-stone-200 absolute top-3 right-4" onClick={closePickEmModal}>✕</button>
              <div className="p-0">
                <h2 className="py-6 text-4xl mb-1 tracking-wider uppercase text-center">Week {week} Picks</h2>
                <p className="px-6 text-stone-300 mb-4 lowercase">Select one answer for each question. Picks lock at 5:00 PM PT.</p>
                {peError && <div className="mb-4 mx-6 p-3 rounded-lg border border-red-700 bg-red-900/30 text-red-200">{peError}</div>}
                {peLoading ? (
                  <div className="flex flex-col items-center py-10">
                    <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
                    <p className="mt-3 text-stone-300 tracking-wider lowercase">Loading...</p>
                  </div>
                ) : markets.length === 0 ? (
                  <div className="px-6 text-stone-300">No picks have been posted for this week yet.</div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (!locked) submitPicks() }}>
                    <div className="space-y-12 py-4">
                      {markets.map((mkt) => (
                        <div key={mkt.id} className="border-y-2 border-stone-600 px-4 py-6">
                          <div className="text-xl mb-6 text-stone-200 tracking-wider leading-tight uppercase">{mkt.question}</div>
                          {(() => {
                            const marketType = mkt.options?.[0]?.type ?? 'text'
                            const baseBtn = 'transition rounded-lg border-2'
                            const idleBtn = 'border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700'
                            const activeBtn = 'border-orange-500 bg-orange-600/20 text-stone-100'

                            if (marketType === 'tribe') {
                              return (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {mkt.options.map((opt) => {
                                    const selected = selections[mkt.id] === opt.id
                                    return (
                                      <button key={opt.id} type="button" disabled={locked} onClick={() => handleSelect(mkt.id, opt.id)} className={`${baseBtn} ${selected ? activeBtn : idleBtn} p-3 pb-2 text-left`} title={opt.pointValue ? `+${opt.pointValue} pts` : ''}>
                                        <div className="flex flex-col items-center">
                                          <LargeTribeBadges tribeIds={[Number(opt.value)]} tribes={tribes as Tribe[]} />
                                          {opt.pointValue != null && (
                                            <div className="flex-row mt-2 text-xl tracking-wider">
                                              <span className="text-green-400">+{opt.pointValue}</span>
                                              <span className="text-stone-500 mx-2">|</span>
                                              <span className="text-red-400">-{opt.pointValue / 4}</span>
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              )
                            }

                            if (marketType === 'contestant') {
                              const tribeList = (tribes as Tribe[]) || []
                              const tribeById = new Map<number, Tribe>(tribeList.map((t) => [t.id, t]))
                              const optionsAug = (mkt.options || []).map((opt) => {
                                const c: Contestant | undefined = contestantMap[Number(opt.value)]
                                const name = c?.name ?? opt.label
                                const img = c?.img ?? 'placeholder'
                                const first = firstName(name)
                                const tribeIdsRaw: any = (c as any)?.tribeIds ?? (c as any)?.tribes ?? ((c as any)?.tribeId != null ? [(c as any).tribeId] : [])
                                const tribeIds: number[] = Array.isArray(tribeIdsRaw) ? tribeIdsRaw.map((t: any) => Number(t)).filter((n: any) => Number.isFinite(n)) : []
                                const primaryTribeId: number | null = tribeIds.length ? tribeIds[0] : null
                                return { opt, c, name, img, first, tribeIds, primaryTribeId }
                              })
                              const byTribe = new Map<number | null, typeof optionsAug>()
                              optionsAug.forEach((item) => {
                                const key = item.primaryTribeId
                                const arr = byTribe.get(key) || ([] as any)
                                arr.push(item)
                                byTribe.set(key, arr)
                              })
                              const groupKeys = Array.from(byTribe.keys()).sort((a, b) => {
                                const ta = a != null ? (tribeById.get(a)?.name ?? '') : 'ZZZ'
                                const tb = b != null ? (tribeById.get(b)?.name ?? '') : 'ZZZ'
                                return ta.localeCompare(tb)
                              })
                              groupKeys.forEach((key) => byTribe.get(key)!.sort((x, y) => x.first.localeCompare(y.first)))
                              return (
                                <div className="space-y-4">
                                  {groupKeys.map((groupId) => {
                                    const arr = byTribe.get(groupId)!
                                    const tribeBadge = groupId != null ? (
                                      <LargeTribeBadges tribeIds={[groupId]} tribes={tribeList} />
                                    ) : (
                                      <span className="text-stone-400 text-sm">Unassigned tribe</span>
                                    )
                                    return (
                                      <div key={groupId ?? 'unassigned'}>
                                        <div className="mb-2 flex items-center justify-start">{tribeBadge}</div>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {arr.map(({ opt, name, img }) => {
                                            const selected = selections[mkt.id] === opt.id
                                            return (
                                              <button key={opt.id} type="button" disabled={locked} onClick={() => handleSelect(mkt.id, opt.id)} className={`${baseBtn} ${selected ? activeBtn : idleBtn} p-3 flex flex-col items-center`} title={opt.pointValue ? `+${opt.pointValue} pts` : ''}>
                                                <img src={`/imgs/${img}.png`} alt={name} className="h-22 w-22 object-cover rounded-full border-2 p-1 border-stone-500" />
                                                <div className="mt-1.5 flex flex-col items-center">
                                                  <div className="text-xl uppercase text-stone-200">{firstName(name)}</div>
                                                </div>
                                                {opt.pointValue != null && (
                                                  <div className="text-lg">
                                                    <span className="text-green-400">+{opt.pointValue}</span>
                                                    <span className="text-stone-500 mx-2">|</span>
                                                    <span className="text-red-400">-{opt.pointValue / 4}</span>
                                                  </div>
                                                )}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            }

                            if (marketType === 'boolean') {
                              return (
                                <div className="grid grid-cols-2 gap-3">
                                  {mkt.options.map((opt) => {
                                    const selected = selections[mkt.id] === opt.id
                                    return (
                                      <button key={opt.id} type="button" disabled={locked} onClick={() => handleSelect(mkt.id, opt.id)} className={`${baseBtn} ${selected ? activeBtn : idleBtn} px-4 py-2 text-center`} title={opt.pointValue ? `+${opt.pointValue} pts` : ''}>
                                        <div className="text-4xl lowercase tracking-wider mb-2">{String(opt.label || opt.value)}</div>
                                        {opt.pointValue != null && (
                                          <div className="text-xl tracking-wider">
                                            <span className="text-green-400">+{opt.pointValue}</span>
                                            <span className="text-stone-500 mx-2">|</span>
                                            <span className="text-red-400">-{opt.pointValue / 4}</span>
                                          </div>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              )
                            }

                            return (
                              <div className="grid sm:grid-cols-2 gap-2">
                                {mkt.options.map((opt) => {
                                  const selected = selections[mkt.id] === opt.id
                                  return (
                                    <button key={opt.id} type="button" disabled={locked} onClick={() => handleSelect(mkt.id, opt.id)} className={`${baseBtn} ${selected ? activeBtn : idleBtn} px-3 py-2 text-left`} title={opt.pointValue ? `+${opt.pointValue} pts` : ''}>
                                      <div className="flex items-center justify-between">
                                        <span className="truncate">{opt.label}</span>
                                        {opt.pointValue != null && <span className="text-xs text-stone-400 ms-3">+{opt.pointValue}</span>}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )
                          })()}
                        </div>
                      ))}
                    </div>

                    {/* Footer buttons: row 1 = Cancel + Clear; row 2 = Submit */}
                    <div className="my-6 flex items-center justify-center gap-3">
                      <button type="button" onClick={closePickEmModal} className="px-4 py-2 rounded-md border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700">Cancel</button>
                      <button type="button" onClick={clearPicks} disabled={peLoading} className={`px-4 py-2 rounded-md border font-semibold tracking-wider ${peLoading ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed' : 'bg-stone-900 border-stone-600 text-stone-100 hover:bg-stone-700'}`}>Clear picks</button>
                    </div>
                    <div className="mb-10 flex items-center justify-center">
                      <button type="submit" disabled={locked || peLoading} className={`w-[min(92%,28rem)] px-4 py-3 rounded-md border text-lg font-semibold tracking-wider ${locked || peLoading ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed' : 'bg-orange-600 border-orange-700 text-stone-50 hover:bg-orange-500'}`}>{locked ? 'Locked' : 'Submit Picks'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


