'use client';

import React from 'react';

export default function SeasonSpoilerToolbar({
  season,
  onSeasonChange,
  spoilerOn,
  onToggleSpoiler,
}: {
  season: number;
  onSeasonChange: (s: number) => void;
  spoilerOn: boolean;
  onToggleSpoiler: (v: boolean) => void;
}) {
  return (
    <div className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-stone-300 text-sm">Season</span>
          <select
            value={season}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            className="px-2 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-200 w-24"
          >
            <option value={50}>50</option>
          </select>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <span className="text-stone-300 text-sm">Spoilers</span>
          <button
            onClick={() => onToggleSpoiler(!spoilerOn)}
            className={`px-3 py-1 rounded-full border text-sm ${
              spoilerOn ? 'bg-red-700 border-red-800 text-stone-50' : 'bg-stone-800 border-stone-700 text-stone-200'
            }`}
          >
            {spoilerOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}