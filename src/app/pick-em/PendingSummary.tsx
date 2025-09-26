import { useMemo } from 'react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { MedTribeBadges } from '@/lib/utils/tribes';
import type { Tribe, Contestant, PickEmScoreBreakdown } from '@/lib/types';

export function PendingSummary({
  breakdown,
  score,
  tribes,
  contestants,
}: {
  breakdown: PickEmScoreBreakdown[];
  score: number;
  tribes: Tribe[];
  contestants: Contestant[];
}) {
  // Map contestantId to contestant object for fast lookup
  const contestantMap = useMemo(
    () => contestants.reduce<Record<number, Contestant>>((acc, c) => { acc[c.id] = c; return acc; }, {}),
    [contestants]
  );
  const firstName = (full?: string) => (full || '').split(' ')[0] || '';

  // Helper for points display
  function getPointsDisplay(opt: any) {
    // Contestant type: wrong = pointValue/4, others wrong = pointValue/2
    if (opt.pointValue != null) {
      if (opt.type === 'contestant') {
        return `+${opt.pointValue} / -${Math.round(opt.pointValue / 4)}`;
      } else {
        return `+${opt.pointValue} / -${Math.round(opt.pointValue / 2)}`;
      }
    }
    return '';
  }

  return (
    <div className="py-3 border-t border-stone-700/70 font-lostIsland lowercase text-stone-300">
      {breakdown.length === 0 ? (
        <div className="text-stone-400 text-sm">Loading...</div>
      ) : (
        <ul>
          {breakdown.map((item, idx) => {
            // The option object from backend (mirroring summary route)
            const opt = item ?? {};
            const type = opt.type ?? 'text';

            // Render selection by type (like summary route)
            let selectionDisplay: React.ReactNode = null;
            if (type === 'tribe') {
              selectionDisplay = <MedTribeBadges tribeIds={[Number(opt.label)]} tribes={tribes as Tribe[]} />;
            } else if (type === 'contestant') {
              const c: Contestant | undefined = contestantMap[Number(opt.label)];
              const name = c?.name ?? opt.label;
              const img = c?.img ?? 'placeholder';
              selectionDisplay = (
                <span className="flex flex-col items-center gap-0">
                  <img src={`/imgs/${img}.png`} alt={name} className="h-12 w-12 rounded-full border border-stone-500 object-cover" />
                  <span className="uppercase text-lg">{firstName(name)}</span>
                </span>
              );
            } else if (type === 'boolean') {
              selectionDisplay = <span className="uppercase text-2xl tracking-wider">{String(opt.label)}</span>;
            } else {
              selectionDisplay = <span className="truncate max-w-[50vw]">{opt.label ?? ''}</span>;
            }

            return (
              <li key={idx} className="flex items-center justify-between border-b-2 py-2 border-stone-700">
                {/* Question & selection */}
                <span className="text-stone-100 flex flex-col text-lg lowercase tracking-wider leading-tight">
                  <span>{item.question ?? `Question ${item.pickEmId}`}</span>
                  <span className="text-stone-400">
                    Pending: {getPointsDisplay(opt)}
                  </span>
                  
                </span>
                {/* Pending icon */}
                <span className="flex flex-col items-center gap-2">
                  <span className="relative w-20 text-center flex items-center justify-center">
                    {selectionDisplay}
                    <span className="absolute -top-1 -right-1 z-10 bg-black rounded-full w-7 h-7 flex items-center justify-center">
                      <QuestionMarkCircleIcon className="w-7 h-7 text-stone-400" title="Pending" />
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}