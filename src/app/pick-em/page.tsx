'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  IdentificationIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  MinusCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid';

import { useSpoiler } from '../../context/SpoilerContext';
import { useSeasonData } from '@/lib/hooks/useSeasonData';
import { hexToRgba } from '@/lib/utils/color';
import type { Tribe, Contestant, PlayerTribe } from '@/lib/types';
import { LargeTribeBadges, TribeBadges } from '@/lib/utils/tribes';               
import { rankAndScorePlayerTribes } from '@/lib/utils/score';

// ---- Helpers ---------------------------------------------------------

// Compute the lock datetime for a given season/week.
// For now: defaults to next Wednesday 5:00 PM America/Los_Angeles.
// If your API returns a precise lockAt per week, prefer that value.
function computeDefaultLockAtPT(week: number): Date {
  // Start from "now" in PT; find the next Wednesday 5:00 PM PT.
  // (This is a simplified client-side approach; for precision, compute server-side.)
  const now = new Date();
  // Convert current time to PT by building a PT time using Intl
  const ptNowStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);

  // Parse back to a Date in local timezone (approx) then treat like PT baseline
  const [mm, dd, yyyy, hh, min] = ptNowStr.match(/\d+/g) || [];
  const ptBaseline = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0, 0);

  // Find next Wednesday
  const WED = 3; // 0=Sun, 1=Mon, 2=Tue, 3=Wed...
  const day = ptBaseline.getDay();
  const offset = (WED - day + 7) % 7 || 7; // at least next Wed
  const lock = new Date(ptBaseline);
  lock.setDate(lock.getDate() + offset);
  lock.setHours(17, 0, 0, 0); // 5:00 PM PT

  // If you want week to shift beyond "next Wednesday", you could add (week-1)*7 days here.
  // Example (optional):
  // lock.setDate(lock.getDate() + (week - 1) * 7);

  return lock;
}

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return 'locked';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`, `${s}s`);
  return parts.join(' ');
}

// ---- Page ------------------------------------------------------------

export default function WeeklyPickEms() {
  const [season, setSeason] = useState('49');
  const [week, setWeek] = useState<number>(1);
  const [expandedTribes, setExpandedTribes] = useState<number[]>([]);
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set()); // tribeIds that submitted
  const [lockAt, setLockAt] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [peModalOpen, setPeModalOpen] = useState(false);
  const [peLoading, setPeLoading] = useState(false);
  const [peError, setPeError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<
    Array<{
      id: number;
      question: string;
      options: Array<{ id: number; label: string; type: string; value: any; pointValue: number }>;
    }>
  >([]);
  const [selections, setSelections] = useState<Record<number, number | null>>({}); // key: pickEmId -> optionId
  // Per-tribe submitted picks summary (loaded on expand)
  const [tribeSummaries, setTribeSummaries] = useState<Record<number, Array<{ question: string; option: any }>>>({});
  const [tribeSummaryLoading, setTribeSummaryLoading] = useState<Record<number, boolean>>({});
  const [tribeSummaryError, setTribeSummaryError] = useState<Record<number, string | null>>({}); // key: pickEmId -> optionId


  const { data: session } = useSession();
  const { revealSpoilers } = useSpoiler();
  const { playerTribes, contestants, tribes, loading } = useSeasonData(season);

  const contestantMap = useMemo(
    () =>
      contestants.reduce<Record<number, Contestant>>((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {}),
    [contestants]
  );

  const MIN_WEEK = 1;
  const MAX_WEEK = 1;

  
  // We still reuse this to pull the user's tribe cards (same styling),
  // but we won't display the score—status icon instead.
  const rankedTribes = useMemo(() => {
    const ranked = rankAndScorePlayerTribes(playerTribes, season, contestantMap) as Array<
      PlayerTribe & { rank: number }
    >;

    // Sort: submitted tribes first (locked in), maintaining relative rank inside buckets
    const withStatusFirst = [...ranked].sort((a, b) => {
      const aSub = submittedSet.has(a.id) ? 0 : 1;
      const bSub = submittedSet.has(b.id) ? 0 : 1;
      if (aSub !== bSub) return aSub - bSub;
      return a.rank - b.rank;
    });

    return withStatusFirst;
  }, [playerTribes, season, contestantMap, submittedSet]);

  

  const firstName = (full?: string) => (full || '').split(' ')[0] || '';

  // Fetch picks summary for a given tribe when its row expands
  const fetchTribeSummary = async (tribeId: number) => {
    setTribeSummaryLoading(prev => ({ ...prev, [tribeId]: true }));
    setTribeSummaryError(prev => ({ ...prev, [tribeId]: null }));
    try {
      const res = await fetch(`/api/pick-ems/summary?season=${season}&week=${week}&tribeId=${tribeId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load picks summary');
      const data = await res.json();
      const picks = Array.isArray(data?.picks) ? data.picks : [];
      const normalized = picks.map((p: any) => ({
        question: p.question ?? p.pickEm?.question ?? 'Question',
        option: p.option ?? p.selected ?? p.selection,
      }));
      setTribeSummaries(prev => ({ ...prev, [tribeId]: normalized }));
    } catch (e: any) {
      setTribeSummaryError(prev => ({ ...prev, [tribeId]: e?.message || 'Error loading summary' }));
    } finally {
      setTribeSummaryLoading(prev => ({ ...prev, [tribeId]: false }));
    }
  };


  // Expand/collapse
  const toggleDropdown = (tribeId: number) =>
    setExpandedTribes(prev =>
      prev.includes(tribeId) ? prev.filter(id => id !== tribeId) : [...prev, tribeId]
    );

  // Fetch weekly submission status (who submitted picks) + optional lockAt from your API
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        // Replace with your real endpoint
        const res = await fetch(`/api/pick-ems/status?season=${season}&week=${week}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('status fetch failed');
        const data = await res.json();
        const set = new Set<number>(Array.isArray(data.submittedTribeIds) ? data.submittedTribeIds : []);
        if (!ignore) {
          setSubmittedSet(set);
          if (data.lockAt) {
            const d = new Date(data.lockAt);
            setLockAt(isNaN(d.getTime()) ? computeDefaultLockAtPT(week) : d);
          } else {
            setLockAt(computeDefaultLockAtPT(week));
          }
        }
      } catch {
        if (!ignore) {
          setSubmittedSet(new Set());
          setLockAt(computeDefaultLockAtPT(week));
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [season, week]);

  useEffect(() => {
    if (!lockAt) return;

    const tick = () => {
      const diff = lockAt.getTime() - new Date().getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }
      const d = Math.floor(diff / 86400000); // days
      const h = Math.floor((diff % 86400000) / 3600000); // hours
      const m = Math.floor((diff % 3600000) / 60000); // minutes
      const s = Math.floor((diff % 60000) / 1000); // seconds
      setCountdown({ days: d, hours: h, minutes: m, seconds: s });
      return false
    };

    // initial run
    const lockedNow = tick();
    if (lockedNow) return;

    const interval = setInterval(() => {
      const isLocked = tick();
      if (isLocked) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [lockAt]);

 

  const locked =
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  // CTA button behavior
  const handleCTA = () => {
    if (!session) {
      // route to sign in flow
      window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    // route to your weekly pick form (implement this route)
    window.location.href = `/pick-ems/submit?season=${season}&week=${week}`;
  };

  const openPickEmModal = async () => {
    if (!session) {
      window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    if (locked) return;

    setPeModalOpen(true);
    setPeLoading(true);
    setPeError(null);

    try {
      // You’ll implement this route to return [{ id, question, options: [...]}, ...]
      const res = await fetch(`/api/pick-ems/list?season=${season}&week=${week}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load pick-ems.');
      const data = await res.json();

      const list = Array.isArray(data?.pickEms) ? data.pickEms : [];
      setMarkets(list);

      // If you want to prefill existing picks, have the API return { existingSelections: { [pickEmId]: optionId } }
      const existing = data?.existingSelections ?? {};
      setSelections(existing);
    } catch (e: any) {
      setPeError(e?.message || 'Error loading pick-ems.');
    } finally {
      setPeLoading(false);
    }
  };

  const closePickEmModal = () => {
    setPeModalOpen(false);
    setPeError(null);
  };

  // update a single selection
  const handleSelect = (pickEmId: number, optionId: number) => {
    setSelections(prev => ({ ...prev, [pickEmId]: optionId }));
  };

  // submit all picks
  const submitPicks = async () => {
    try {
      setPeLoading(true);
      setPeError(null);

      // payload: [{ pickId, selection }]
      const payload = Object.entries(selections)
        .filter(([, optionId]) => optionId != null)
        .map(([pickId, optionId]) => ({ pickId: Number(pickId), selection: Number(optionId) }));

      const resp = await fetch('/api/pick-ems/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season: Number(season), week, picks: payload }),
        credentials: "include",
      });

      if (!resp.ok) throw new Error('Failed to submit picks');

      // Optionally refresh your status set so the row moves to “Locked In”
      setPeModalOpen(false);
    } catch (e: any) {
      setPeError(e?.message || 'Submit failed');
    } finally {
      setPeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      {/* Hero/Header */}
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        <div className="z-0">
          <Image src="/imgs/graphics/home-graphic.png" alt="Survivor Background" fill style={{ objectFit: 'cover' }} />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{ backgroundImage: 'linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)' }}
          />
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
        <div className="lowercase text-stone-200 border-y border-stone-500 p-4 my-8 font-lostIsland tracking-wider ">
          <p className="mb-3">Weekly Pick Ems are an optional side game that can help ..or hurt.. your overall fantasy score.</p>
          <p className="mb-3">Tribes default each week to a status of <span className="text-stone-300">Passed</span>. If you submit picks, your status will update to Locked In. </p>
          <p className="mb-3">Weekly picks can be submitted up until the start of that weeks episode, or each Wednesday at 5PM Pacific, 7PM Central, 8PM Eastern. </p>
          
        </div>

        {/* Season / Week / CTA / Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 px-4">
          <div className="flex items-center gap-4">
            {/* Season selector */}
            <div className="font-lostIsland tracking-wider">
              {/*<select
                id="season"
                className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled
              >
                <option value="49">Season 49</option>
                
              </select>*/}
              <span className="py-1.5 px-3 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200">Season 49</span>
            </div>

            {/* Week selector with carets */}
            <div className="py-1 flex items-center font-lostIsland rounded-md border border-stone-700 bg-stone-800">
              <button
                className="p-1 hover:bg-stone-700 disabled:opacity-40"
                onClick={() => setWeek((w) => Math.max(MIN_WEEK, w - 1))}
                disabled={week <= MIN_WEEK}
                aria-label="Previous week"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <div className="px-3 text-lg tracking-wider">
                Week {week}
              </div>

              <button
                className="p-1 hover:bg-stone-700 disabled:opacity-40"
                onClick={() => setWeek((w) => Math.min(MAX_WEEK, w + 1))}
                disabled={week >= MAX_WEEK}
                aria-label="Next week"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Countdown + CTA */}
          <div className="flex flex-col items-center gap-4 font-lostIsland">
            {/* Countdown styled like homepage */}
            <div className="text-center">
              <h2 className="text-2xl uppercase text-stone-300 mb-2">Week 1 Pick Em Countdown</h2>
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
            </div>

            <button
              onClick={openPickEmModal}
              disabled={locked}
              className={`px-4 py-2 rounded-md font-lostIsland tracking-wider border ${
                locked
                  ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                  : 'bg-orange-600 border-orange-700 text-stone-50 hover:bg-orange-500'
              }`}
            >
              {session ? 'Submit your picks' : 'Sign in and submit your picks'}
            </button>
          </div>
        </div>


        {/* Leaderboard-style list of tribes with status icons */}
        <div className="px-2">
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
              const isSubmitted = submittedSet.has(tribe.id);

              return (
                <div key={tribe.id} className="py-2 px-3 mb-2 rounded-lg border border-stone-700 bg-stone-800">
                  <div className="flex items-center justify-start" onClick={() => {
                    const opening = !expandedTribes.includes(tribe.id);
                    toggleDropdown(tribe.id);
                    if (opening && isSubmitted && !tribeSummaries[tribe.id]) {
                      fetchTribeSummary(tribe.id);
                    }
                  }}>
                    {/* Keep the left rank slot for visual consistency, but show a subtle dot */}
                    

                    {/* Tribe identity (emoji + names) */}
                    <div className="flex items-center">
                      <div
                        className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-3xl"
                        style={{ backgroundColor: hexToRgba(tribe.color, 0.75) }}
                      >
                        {tribe.emoji}
                      </div>
                      <div className="ms-3">
                        <div className="text-lg font-lostIsland leading-tight">{tribe.tribeName}</div>
                        <div className="text-stone-400 font-lostIsland leading-tight">{tribe.playerName}</div>
                      </div>
                    </div>

                    {/* Right-side: Status icon (no score) */}
                    <div className="flex items-center ms-auto me-0 gap-2">
                      {isSubmitted ? (
                        <span
                          className="inline-flex items-center gap-1 text-green-300 font-lostIsland text-sm lowercase bg-green-900/40 px-2 py-0.5 rounded-full"
                          title="Locked In"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          locked in
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-stone-300 font-lostIsland text-sm lowercase bg-stone-700/50 px-2 py-0.5 rounded-full"
                          title="Passed (no picks this week)"
                        >
                          <MinusCircleIcon className="w-4 h-4" />
                          passed
                        </span>
                      )}
                      <ChevronDownIcon
                        className={`w-4 h-4 stroke-3 cursor-pointer ${expandedTribes.includes(tribe.id) ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded: show this tribe's submitted picks for the week */}
                  {expandedTribes.includes(tribe.id) && (
                    <div className="px-2 mt-3">
                      {isSubmitted ? (
                        <div className="py-3 border-t border-stone-700/70 font-lostIsland lowercase text-stone-300">
                          <div className="flex items-center mb-2">
                            <LockClosedIcon className="w-5 h-5 text-green-400 me-2" />
                            <span>Picks submitted for week {week}:</span>
                          </div>

                          {tribeSummaryLoading[tribe.id] && (
                            <div className="flex items-center gap-2 text-stone-400">
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              <span>Loading summary…</span>
                            </div>
                          )}

                          {tribeSummaryError[tribe.id] && (
                            <div className="text-red-300">{tribeSummaryError[tribe.id]}</div>
                          )}

                          {!tribeSummaryLoading[tribe.id] && !tribeSummaryError[tribe.id] && (
                            <ul className="space-y-2">
                              {(tribeSummaries[tribe.id] ?? []).map((item, idx) => {
                                const opt: any = item.option || {};
                                const t = opt.type ?? 'text';
                                return (
                                  <li key={idx} className="flex items-center justify-between gap-3">
                                    <span className="text-stone-300">{item.question}</span>
                                    <span className="flex items-center gap-2">
                                      {t === 'tribe' && (
                                        <TribeBadges tribeIds={[Number(opt.value)]} tribes={tribes as Tribe[]} />
                                      )}
                                      {t === 'contestant' && (() => {
                                        const c: Contestant | undefined = contestantMap[Number(opt.value)];
                                        const name = c?.name ?? opt.label;
                                        const img = c?.img ?? 'placeholder';
                                        return (
                                          <span className="flex items-center gap-2">
                                            <img src={`/imgs/${img}.png`} alt={name} className="h-8 w-8 rounded-full border border-stone-500 object-cover" />
                                            <span className="uppercase">{firstName(name)}</span>
                                          </span>
                                        );
                                      })()}
                                      {t === 'boolean' && (
                                        <span className="uppercase">{String(opt.label || opt.value)}</span>
                                      )}
                                      {t !== 'tribe' && t !== 'contestant' && t !== 'boolean' && (
                                        <span className="truncate max-w-[50vw]">{opt?.label}</span>
                                      )}
                                      {opt?.pointValue != null && (
                                        <span className="text-xs text-stone-400">+{opt.pointValue}</span>
                                      )}
                                    </span>
                                  </li>
                                );
                              })}
                              {((tribeSummaries[tribe.id] ?? []).length === 0) && (
                                <li className="text-stone-400 text-sm">No picks to show.</li>
                              )}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center py-3 border-t border-stone-700/70 text-stone-400 font-lostIsland lowercase">
                          <MinusCircleIcon className="w-5 h-5 me-2 opacity-70" />
                          <span>No picks submitted for week {week}.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {peModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
          onClick={closePickEmModal}
        >
          <div
            className="w-full max-w-3xl h-[92%] overflow-y-auto bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="text-stone-400 hover:text-stone-200 absolute top-3 right-4"
              onClick={closePickEmModal}
            >
              ✕
            </button>

            <div className="p-0">
              <h2 className="py-6 text-4xl mb-1 tracking-wider uppercase text-center">Week {week} Picks</h2>
              <p className="px-6 text-stone-300 mb-4 lowercase">
                Select one answer for each question. Picks lock at 5:00 PM PT.
              </p>

              {peError && (
                <div className="mb-4 p-3 rounded-lg border border-red-700 bg-red-900/30 text-red-200">
                  {peError}
                </div>
              )}

              {peLoading ? (
                <div className="flex flex-col items-center py-10">
                  <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
                  <p className="mt-3 text-stone-300 tracking-wider lowercase">Loading...</p>
                </div>
              ) : markets.length === 0 ? (
                <div className="text-stone-300">No pick have been posted for this week yet.</div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!locked) submitPicks();
                  }}
                >
                  <div className="space-y-2">
                    {markets.map((mkt) => (
                      <div key={mkt.id} className="border-t-2 border-stone-600 p-4">
                        <div className="mb-3 text-stone-100 tracking-wider">{mkt.question}</div>
                        {(() => {
                          const marketType = mkt.options?.[0]?.type ?? 'text';

                          // Shared button classes
                          const baseBtn = 'transition rounded-md border-2';
                          const idleBtn = 'border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700';
                          const activeBtn = 'border-orange-500 bg-orange-600/20 text-stone-100';

                          if (marketType === 'tribe') {
                            // Tribe badge grid
                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {mkt.options.map((opt) => {
                                  const selected = selections[mkt.id] === opt.id;return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      disabled={locked}
                                      onClick={() => handleSelect(mkt.id, opt.id)}
                                      className={`${baseBtn} ${selected ? activeBtn : idleBtn} px-3 py-3 text-left`}
                                      title={opt.pointValue ? `+${opt.pointValue} pts` : ''}
                                    >
                                      <div className="flex items-center">
                                        <LargeTribeBadges tribeIds={[Number(opt.value)]} tribes={tribes as Tribe[]} />
                                        <div className="ml-3">
                                          {opt.pointValue != null && (
                                            <div className="text-stone-400 mt-0.5">+{opt.pointValue} / -{opt.pointValue/4}</div>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          }

                          if (marketType === 'contestant') {
                            // Contestant headshots in a denser grid
                            return (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {mkt.options.map((opt) => {
                                  const selected = selections[mkt.id] === opt.id;
                                  const c: Contestant | undefined = contestantMap[Number(opt.value)]; // value = contestantId
                                  const name = c?.name ?? opt.label;
                                  const img = c?.img ?? 'placeholder'; // fallback to a placeholder name if needed

                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      disabled={locked}
                                      onClick={() => handleSelect(mkt.id, opt.id)}
                                      className={`${baseBtn} ${selected ? activeBtn : idleBtn} px-2 py-3 flex flex-col items-center`}
                                      title={opt.pointValue ? `+${opt.pointValue} pts` : ''}
                                    >
                                      <img
                                        src={`/imgs/${img}.png`}
                                        alt={name}
                                        className="h-20 w-20 object-cover rounded-full border-2 p-1 border-stone-500"
                                      />
                                      <div className="mt-2 text-lg uppercase text-stone-200">{firstName(name)}</div>
                                      {opt.pointValue != null && (
                                        <div className="text-xs text-stone-400 mt-0.5">+{opt.pointValue}</div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          }

                          if (marketType === 'boolean') {
                            // Two big blocks: True / False
                            return (
                              <div className="grid sm:grid-cols-2 gap-3">
                                {mkt.options.map((opt) => {
                                  const selected = selections[mkt.id] === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      disabled={locked}
                                      onClick={() => handleSelect(mkt.id, opt.id)}
                                      className={`${baseBtn} ${selected ? activeBtn : idleBtn} px-4 py-3 text-center`}
                                      title={opt.pointValue ? `+${opt.pointValue} pts` : ''}
                                    >
                                      <div className="text-lg">{String(opt.label || opt.value)}</div>
                                      {opt.pointValue != null && (
                                        <div className="text-xs text-stone-400 mt-0.5">+{opt.pointValue}</div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          }

                          // Fallback for text/unknown types
                          return (
                            <div className="grid sm:grid-cols-2 gap-2">
                              {mkt.options.map((opt) => {
                                const selected = selections[mkt.id] === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    disabled={locked}
                                    onClick={() => handleSelect(mkt.id, opt.id)}
                                    className={`${baseBtn} ${selected ? activeBtn : idleBtn} px-3 py-2 text-left`}
                                    title={opt.pointValue ? `+${opt.pointValue} pts` : ''}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="truncate">{opt.label}</span>
                                      {opt.pointValue != null && (
                                        <span className="text-xs text-stone-400 ms-3">+{opt.pointValue}</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}

                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closePickEmModal}
                      className="px-4 py-2 rounded-md border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={locked || peLoading}
                      className={`px-4 py-2 rounded-md border font-semibold tracking-wider
                        ${locked || peLoading
                          ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                          : 'bg-orange-600 border-orange-700 text-stone-50 hover:bg-orange-500'
                        }`}
                    >
                      {locked ? 'Locked' : 'Submit Picks'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
