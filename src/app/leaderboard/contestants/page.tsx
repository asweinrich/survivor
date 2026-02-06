'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

const SEASON = 50;

type LeaderRow = {
  contestantId: number;
  points: number;
  contestant: {
    id: number;
    name: string;
    img: string;
    inPlay: boolean;
    voteOutOrder: number | null;
  } | null;
};

export default function WeeklyContestantLeaderboardPage() {
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [mode, setMode] = useState<'overall' | 'week'>('week');
  const [week, setWeek] = useState<number>(1);
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadWeek(s: number, w: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/scoring/leaderboard-week?season=${s}&week=${w}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load weekly leaderboard');
      const data = await res.json();
      setRows(Array.isArray(data?.leaderboard) ? data.leaderboard : []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadOverall(s: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/scoring/leaderboard?season=${s}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load overall leaderboard');
      const data = await res.json();
      setRows(Array.isArray(data?.leaderboard) ? data.leaderboard : []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableWeeks(s: number) {
    try {
      const res = await fetch(`/api/scoring/weeks?season=${s}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const weeks: number[] = Array.isArray(data?.weeks) ? data.weeks : [];
      setAvailableWeeks(weeks);
      // If current selected week has no scores, select first available or default to overall
      if (weeks.length > 0 && !weeks.includes(week)) {
        setWeek(weeks[0]);
        setMode('week');
      } else if (weeks.length === 0) {
        setMode('overall');
      }
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    loadAvailableWeeks(SEASON);
  }, []);

  useEffect(() => {
    if (mode === 'overall') {
      loadOverall(SEASON);
    } else {
      loadWeek(SEASON, week);
    }
  }, [mode, week]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [rows]);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200">
      {/* Header graphic */}
      <div className="relative w-full h-40 mb-4">
        <Image src="/imgs/graphics/home-graphic.png" alt="Survivor Background" fill style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900" />
        <h1 className="absolute bottom-2 left-4 text-2xl font-survivor">Leaderboard</h1>
      </div>

      {/* Week chips bar: sticky and horizontally scrollable with 'Overall' sticky left */}
      <div className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="relative flex items-center">
            {/* Scroll container */}
            <div className="overflow-x-auto no-scrollbar w-full">
              <div className="relative flex gap-2 min-w-max">
                {/* Overall chip, sticky left */}
                <button
                  onClick={() => setMode('overall')}
                  className={`sticky left-0 z-10 px-3 py-1 rounded-full border text-sm ${
                    mode === 'overall'
                      ? 'bg-orange-600 border-orange-700 text-stone-50'
                      : 'bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  overall
                </button>

                {/* Only show weeks that have scores */}
                {availableWeeks.map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setMode('week');
                      setWeek(w);
                    }}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      mode === 'week' && week === w
                        ? 'bg-orange-600 border-orange-700 text-stone-50'
                        : 'bg-stone-800 border-stone-700 text-stone-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="max-w-6xl mx-auto px-4">
        {err && <div className="mb-3 p-3 rounded-md border border-red-700 bg-red-900/30 text-red-200">{err}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="w-10 h-10 animate-spin text-stone-200" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-stone-400 p-4">
            {mode === 'overall' ? 'No season scoring yet.' : `No scoring entries for week ${week}.`}
          </div>
        ) : (
          <ul className="divide-y divide-stone-800">
            {sorted.map((row, idx) => {
              const c = row.contestant;
              return (
                <li key={row.contestantId} className="flex items-center gap-3 py-3">
                  <div className="w-8 text-center text-stone-400">{idx + 1}</div>
                  <img
                    src={c ? `/imgs/${c.img}.png` : '/imgs/placeholder.png'}
                    alt={c?.name || 'Contestant'}
                    className={`h-10 w-10 rounded-full border border-stone-700 ${c?.inPlay ? '' : 'opacity-80'}`}
                  />
                  <div className="flex-1">
                    <div className="text-stone-100">{c?.name || `#${row.contestantId}`}</div>
                    <div className="text-xs text-stone-500">
                      {c?.inPlay ? 'in play' : c?.voteOutOrder && c.voteOutOrder >= 900 ? 'finals' : 'out'}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-stone-50">{row.points}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}