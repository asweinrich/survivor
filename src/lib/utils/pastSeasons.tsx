import React from 'react';
import type { PastSeason } from '@/lib/types';
import { hexToRgba } from '@/lib/utils/color';

export function PastSeasonBadges({ pastSeasons }: { pastSeasons?: PastSeason[] }) {
  if (!pastSeasons?.length) return null;

  return (
    <span className="inline-flex flex-wrap gap-1">
      {pastSeasons.map((ps, idx) => {
        const label =
          ps.seasonName ??
          (ps.seasonNumber ? `S${ps.seasonNumber}` : 'Past Season');
        return (
          <span
            key={`${label}-${idx}`}
            className="inline-block border border-black px-2 py-1 mb-0.5 text-base tracking-wider leading-none rounded-lg me-1.5 lowercase font-lostIsland"
            style={{
              backgroundColor: hexToRgba(ps.color, 0.15),
              color: ps.color,
              textShadow: '1px 1px 0px rgba(0,0,0,1)'
            }}
            title={ps.seasonNumber ? `Season ${ps.seasonNumber}` : label}
          >
            {label}
          </span>
        );
      })}
    </span>
  );
}
