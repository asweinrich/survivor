import React from 'react';
import type { Tribe } from '@/lib/types';
import { hexToRgba } from '@/lib/utils/color';

/**
 * Helper: accept either a single id or an array of ids and return the last id (or undefined)
 */
export function getLastTribeId(tribeIds?: number | number[]): number | undefined {
  if (tribeIds == null) return undefined;
  if (Array.isArray(tribeIds)) {
    return tribeIds.length ? tribeIds[tribeIds.length - 1] : undefined;
  }
  return tribeIds;
}

/**
 * Helper: returns the Tribe object for the last tribe id (or undefined)
 */
export function getLastTribe(tribeIds: number | number[] | undefined, tribes: Tribe[]): Tribe | undefined {
  const id = getLastTribeId(tribeIds);
  if (id == null) return undefined;
  return tribes.find((t) => t.id === id);
}

export function TribeBadges({ tribeIds, tribes }: { tribeIds?: number | number[]; tribes: Tribe[] }) {
  const tribe = getLastTribe(tribeIds, tribes);
  if (!tribe) return null;

  return (
    <span className="inline-flex flex-wrap gap-1">
      <span
        key={tribe.id}
        className="inline-block border border-black px-2 p-0.5 text-base tracking-wider rounded-lg uppercase font-lostIsland"
        style={{
          backgroundColor: hexToRgba(tribe.color, 0.2),
          color: tribe.color,
          textShadow: '1px 1px 0px rgba(0,0,0,1)',
        }}
      >
        {tribe.name}
      </span>
    </span>
  );
}

export function LargeTribeBadges({ tribeIds, tribes }: { tribeIds?: number | number[]; tribes: Tribe[] }) {
  const tribe = getLastTribe(tribeIds, tribes);
  if (!tribe) return null;

  return (
    <span className="inline-flex flex-wrap gap-1">
      <span
        key={tribe.id}
        className="inline-block border-2 border-black px-3 py-1 text-3xl tracking-wider rounded-lg me-1 lowercase font-lostIsland"
        style={{
          backgroundColor: hexToRgba(tribe.color, 0.2),
          color: tribe.color,
          textShadow: '1px 1px 0px rgba(0,0,0,1)',
        }}
      >
        {tribe.name}
      </span>
    </span>
  );
}

export function MedTribeBadges({ tribeIds, tribes }: { tribeIds?: number | number[]; tribes: Tribe[] }) {
  const tribe = getLastTribe(tribeIds, tribes);
  if (!tribe) return null;

  return (
    <span className="inline-flex flex-wrap gap-1">
      <span
        key={tribe.id}
        className="inline-block border-2 border-black px-3 py-0.5 text-2xl tracking-wider rounded-lg me-1 lowercase font-lostIsland"
        style={{
          backgroundColor: hexToRgba(tribe.color, 0.2),
          color: tribe.color,
          textShadow: '1px 1px 0px rgba(0,0,0,1)',
        }}
      >
        {tribe.name}
      </span>
    </span>
  );
}