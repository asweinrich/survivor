'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import scoringValues from '@/app/scoring/values.json';

type Contestant = {
  id: number;
  name: string;
  img: string;
  season: number;
  inPlay: boolean;
  voteOutOrder?: number | null;
};

type ScoringCategory = {
  name: string;
  description: string;
  points: number;
  schemaKey: string;
  type?: 'boolean' | 'count' | 'scalar';
};

const ADMIN_EMAIL = 'asweinrich@gmail.com';
const USE_WEEKLY_FROM_SEASON = 50;
const ALLOWED_SEASONS = [50];
const ALLOWED_WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);

function inferTypeForKey(schemaKey: string): 'boolean' | 'count' {
  const booleanKeys = new Set(['soleSurvivor', 'top3', 'madeFire', 'madeMerge']);
  return booleanKeys.has(schemaKey) ? 'boolean' : 'count';
}

export default function AdminWeeklyScoringPage() {
  const { data: session, status } = useSession();
  const isAdmin =
    status === 'authenticated' &&
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [season, setSeason] = useState<number>(USE_WEEKLY_FROM_SEASON);
  const [week, setWeek] = useState<number>(1);

  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Weekly category entries: contestantId -> { schemaKey -> value }
  const [entries, setEntries] = useState<Record<number, Record<string, number>>>({});
  const [prefillLoading, setPrefillLoading] = useState(false);

  // Status updates: contestantId -> { inPlay, voteOutOrder }
  const [statusEntries, setStatusEntries] = useState<Record<number, { inPlay: boolean; voteOutOrder: number | null }>>({});

  const categories: (ScoringCategory & { type: 'boolean' | 'count' | 'scalar' })[] = useMemo(() => {
    return (scoringValues as ScoringCategory[]).map((c) => ({
      ...c,
      type: (c.type as any) || inferTypeForKey(c.schemaKey),
    }));
  }, []);

  async function fetchContestantsForSeason(s: number) {
    const res = await fetch(`/api/cast/${s}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load contestants');
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setContestants(list);
    // Initialize status entries from current DB values
    const init: Record<number, { inPlay: boolean; voteOutOrder: number | null }> = {};
    list.forEach((c: Contestant) => {
      init[c.id] = { inPlay: !!c.inPlay, voteOutOrder: c.voteOutOrder ?? null };
    });
    setStatusEntries(init);
  }

  // Load contestants for selected season
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchContestantsForSeason(season);
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load contestants');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  // Load leaderboard points (for sorting by score) — S50+ only
  async function refetchLeaderboard() {
    try {
      if (season < USE_WEEKLY_FROM_SEASON) return;
      const res = await fetch(`/api/scoring/leaderboard?season=${season}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<number, number> = {};
      (data?.leaderboard ?? []).forEach((row: any) => {
        map[row.contestantId] = Number(row.points || 0);
      });
      setScores(map);
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    refetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  // Prefill entries for the current season/week from saved weekly events
  async function refetchWeekPrefill() {
    try {
      setPrefillLoading(true);
      const res = await fetch(`/api/scoring/week?season=${season}&week=${week}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const prefills: Record<number, Record<string, number>> = {};
      (data?.events ?? []).forEach((ev: any) => {
        const val = ev.type === 'boolean' ? (ev.value ? 1 : 0) : Number(ev.value || 0);
        prefills[ev.contestantId] = prefills[ev.contestantId] || {};
        prefills[ev.contestantId][ev.category] = val;
      });
      setEntries(prefills);
    } finally {
      setPrefillLoading(false);
    }
  }

  // Refetch prefill when season/week change AND contestants are loaded (avoid race)
  useEffect(() => {
    if (!loading) {
      refetchWeekPrefill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, week, loading]);

  // Sorting: status, then score desc, then name asc
  const sortedContestants = useMemo(() => {
    const scoreFor = (id: number) => scores[id] ?? 0;
    return [...contestants].sort((a, b) => {
      const aStatus = a.inPlay ? 0 : (a.voteOutOrder && a.voteOutOrder >= 900 ? 1 : 2);
      const bStatus = b.inPlay ? 0 : (b.voteOutOrder && b.voteOutOrder >= 900 ? 1 : 2);
      if (aStatus !== bStatus) return aStatus - bStatus;
      const diff = scoreFor(b.id) - scoreFor(a.id);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [contestants, scores]);

  const setEntry = (contestantId: number, categoryKey: string, val: number) => {
    setEntries((prev) => ({
      ...prev,
      [contestantId]: {
        ...(prev[contestantId] || {}),
        [categoryKey]: val,
      },
    }));
  };

  const setStatusInPlay = (contestantId: number, val: boolean) => {
    setStatusEntries((prev) => ({
      ...prev,
      [contestantId]: {
        ...(prev[contestantId] || { inPlay: false, voteOutOrder: null }),
        inPlay: val,
      },
    }));
  };

  const setStatusVoteOut = (contestantId: number, val: number | null) => {
    setStatusEntries((prev) => ({
      ...prev,
      [contestantId]: {
        ...(prev[contestantId] || { inPlay: false, voteOutOrder: null }),
        voteOutOrder: val,
      },
    }));
  };

  const submitAll = async () => {
    setSubmitting(true);
    setError(null);
    setBanner(null);
    try {
      if (season < USE_WEEKLY_FROM_SEASON) {
        throw new Error(`Weekly scoring is gated to season ${USE_WEEKLY_FROM_SEASON}+`);
      }

      // Build full matrix: every contestant x every category included (zeros included)
      const payloads: Array<{
        contestantId: number;
        season: number;
        week: number;
        category: string;
        type: 'boolean' | 'count' | 'scalar';
        value: number;
      }> = [];

      sortedContestants.forEach((c) => {
        const catMap = entries[c.id] || {};
        categories.forEach((cat) => {
          const type = cat.type;
          const raw = catMap[cat.schemaKey];
          const val = type === 'boolean' ? (raw ? 1 : 0) : Number(raw ?? 0);
          payloads.push({
            contestantId: c.id,
            season,
            week,
            category: cat.schemaKey,
            type,
            value: val,
          });
        });
      });

      // 1) Submit weekly scoring matrix (overwrite semantics)
      {
        const resp = await fetch('/api/scoring/submit-week', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ season, week, entries: payloads }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Weekly submit failed');
        }
      }

      // 2) Submit contestant status updates (inPlay, voteOutOrder)
      {
        const statusPayloads = sortedContestants.map((c) => {
          const st = statusEntries[c.id] || { inPlay: c.inPlay, voteOutOrder: c.voteOutOrder ?? null };
          return {
            id: c.id,
            inPlay: !!st.inPlay,
            voteOutOrder: st.voteOutOrder != null ? Number(st.voteOutOrder) : null,
          };
        });

        const resp = await fetch('/api/contestants/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: statusPayloads }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Status update failed');
        }
      }

      setBanner(`Saved weekly scoring and status updates for ${season} • week ${week}`);

      // Refresh table data and sorting
      await refetchWeekPrefill();
      await refetchLeaderboard();
      await fetchContestantsForSeason(season);
    } catch (e: any) {
      setError(e?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      {/* Header */}
      <div className="relative w-full h-44 mb-6 p-0 text-center">
        <div className="z-0">
          <Image src="/imgs/graphics/home-graphic.png" alt="Survivor Background" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900" />
        </div>
        <h1 className="absolute -bottom-6 inset-x-0 z-10 text-3xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Admin: Weekly Scoring
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-0">
        {/* Controls */}
        <div className="flex items-center gap-4 mb-4 px-4">
          <label className="font-lostIsland text-stone-300">Season</label>
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-200 w-28"
            aria-label="Season"
          >
            {ALLOWED_SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="font-lostIsland text-stone-300">Week</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-200 w-28"
            aria-label="Week"
          >
            {ALLOWED_WEEKS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <button
            onClick={submitAll}
            disabled={submitting || loading || prefillLoading}
            className={`ms-auto px-3 py-2 rounded-md border text-stone-50 font-lostIsland tracking-wider ${
              submitting || loading || prefillLoading
                ? 'bg-stone-700 border-stone-600 cursor-not-allowed'
                : 'bg-orange-600 border-orange-700 hover:bg-orange-500'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {error && (
          <div className="mb-4 mx-4 p-3 rounded-lg border border-red-700 bg-red-900/30 text-red-200">
            {error}
          </div>
        )}
        {banner && (
          <div className="mb-4 mx-4 p-3 rounded-lg border border-stone-700 bg-stone-800 text-stone-200">
            {banner}
          </div>
        )}

        {/* Sticky first column + sticky header row + horizontal scroll for remaining columns */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <svg className="w-10 h-10 animate-spin text-stone-200" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
            <p className="font-lostIsland text-lg lowercase my-3 tracking-wider">Loading...</p>
          </div>
        ) : sortedContestants.length === 0 ? (
          <div className="text-stone-400 p-4 font-lostIsland text-lg">No contestants.</div>
        ) : (
          <div className="relative border-t border-b border-stone-700">
            {/* Wrap table in horizontal scroll container */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse font-inter text-sm">
                {/* Sticky header row with high z-index so it stays visible when scrolling vertically */}
                <thead className="bg-stone-900/95 backdrop-blur sticky top-0 z-30">
                  <tr>
                    {/* Sticky first header cell (lower z-index than page header to avoid overlap) */}
                    <th className="sticky left-0 z-10 bg-stone-900/95 text-left p-2 border-b border-stone-700 min-w-[220px]">
                      Contestant
                    </th>
                    <th className="text-center p-2 border-b border-stone-700 w-20">In Play</th>
                    <th className="text-center p-2 border-b border-stone-700 w-24">Vote Out</th>
                    <th className="text-right p-2 border-b border-stone-700 w-16">Score</th>
                    {categories.map((cat) => (
                      <th
                        key={cat.schemaKey}
                        className="text-center p-2 border-b border-stone-700 w-16"
                        title={cat.name}
                      >
                        {cat.schemaKey}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedContestants.map((c, idx) => {
                    const score = scores[c.id] ?? 0;
                    const st = statusEntries[c.id] || { inPlay: c.inPlay, voteOutOrder: c.voteOutOrder ?? null };
                    const rowBg = idx % 2 === 0 ? 'bg-stone-900' : 'bg-stone-800';
                    return (
                      <tr key={c.id} className={rowBg}>
                        {/* Sticky first column cell (lowest z-index to avoid overlapping the page header) */}
                        <td className={`sticky left-0 z-0 ${rowBg} p-2 border-t border-stone-700 min-w-[220px]`}>
                          <div className="flex items-center gap-2">
                            <img
                              src={`/imgs/${c.img}.png`}
                              alt={c.name}
                              className={`h-8 w-8 object-cover rounded-full border border-stone-600 ${
                                c.inPlay ? '' : 'opacity-80'
                              }`}
                            />
                            <div className="leading-tight">
                              <div className="text-stone-200">{c.name}</div>
                              <div className="text-xs text-stone-400">
                                {c.inPlay
                                  ? 'in play'
                                  : c.voteOutOrder && c.voteOutOrder >= 900
                                  ? 'finals'
                                  : 'out'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Scrollable columns */}
                        <td className="p-2 border-t border-stone-700 text-center">
                          <select
                            value={st.inPlay ? 'yes' : 'no'}
                            onChange={(e) => setStatusInPlay(c.id, e.target.value === 'yes')}
                            className="px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-200"
                            aria-label="In Play"
                          >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </td>

                        <td className="p-2 border-t border-stone-700 text-center">
                          <input
                            type="number"
                            min={0}
                            value={st.voteOutOrder ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setStatusVoteOut(c.id, v === '' ? null : Number(v));
                            }}
                            placeholder="0 / 901-903"
                            className="w-20 px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-200 text-right"
                            aria-label="Vote Out Order"
                            title="Use 901=3rd, 902=2nd, 903=Winner; 600=Lost Fire; 700=Medevac; else Nth out"
                          />
                        </td>

                        <td className="p-2 border-t border-stone-700 text-right text-stone-200">{score}</td>

                        {categories.map((cat) => {
                          const type = cat.type;
                          const curr = entries[c.id]?.[cat.schemaKey] ?? (type === 'boolean' ? 0 : 0);
                          return (
                            <td key={cat.schemaKey} className="p-1 border-t border-stone-700 text-center">
                              {type === 'boolean' ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(curr)}
                                  onChange={(e) => setEntry(c.id, cat.schemaKey, e.target.checked ? 1 : 0)}
                                  className="h-4 w-4 align-middle"
                                  title={`+${cat.points}`}
                                />
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={curr}
                                  onChange={(e) => setEntry(c.id, cat.schemaKey, Number(e.target.value))}
                                  className="w-14 px-1 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-200 text-right"
                                  title={`+${cat.points} each`}
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}