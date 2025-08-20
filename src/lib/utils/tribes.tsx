import React from 'react';
import type { Tribe } from '@/lib/types';
import { hexToRgba } from '@/lib/utils/color';

export function TribeBadges({ tribeIds, tribes }: { tribeIds: number[]; tribes: Tribe[] }) {
  if (!tribeIds?.length) return null;

  return (
    <span className="inline-flex flex-wrap gap-1">
      {tribeIds.map((id) => {
        const tribe = tribes.find((t) => t.id === id);
        if (!tribe) return null;
        return (
          <span
          key={id}
          className="inline-block border border-black px-2 py-0.5 text-base tracking-wider rounded-full me-1 lowercase font-lostIsland"
          style={{
            backgroundColor: hexToRgba(tribe.color, 0.2),
            color: tribe.color,
            textShadow: '1px 1px 0px rgba(0,0,0,1)'
          }}
        >
          {tribe.name}
        </span>
        );
      })}
    </span>
  );
}
