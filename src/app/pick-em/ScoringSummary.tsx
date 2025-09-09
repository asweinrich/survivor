import { useMemo } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { TribeBadges, LargeTribeBadges } from '@/lib/utils/tribes';
import type { Tribe, Contestant, PickEmScoreBreakdown } from '@/lib/types';

export function ScoringSummary({
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
  const contestantMap = useMemo(
    () => contestants.reduce<Record<number, Contestant>>((acc, c) => { acc[c.id] = c; return acc; }, {}),
    [contestants]
  );
  const firstName = (full?: string) => (full || '').split(' ')[0] || '';

  return (
    <div className="py-3 border-t border-stone-700/70 font-lostIsland lowercase text-stone-300">
      <div className="flex items-center mb-2">
        <CheckCircleIcon className="w-5 h-5 text-green-400 me-2" />
        <span>Scored summary for week:</span>
        <span className="ms-4 font-bold text-lg text-orange-300">Total: {score} pts</span>
      </div>
      {breakdown.length === 0 ? (
        <div className="text-stone-400 text-sm">No scored picks for this tribe.</div>
      ) : (
        <ul className="space-y-2">
          {breakdown.map((item, idx) => {
            const opt = item.selectedOption || {};
            const type = opt.type ?? item.type ?? 'text';
            return (
              <li key={idx} className="flex items-center justify-between gap-3">
                {/* Question */}
                <span className="text-stone-300">{item.label || `Question ${item.pickEmId}`}</span>

                {/* Selection & Points */}
                <span className="flex items-center gap-2">
                  {/* Selection rendering by type */}
                  {type === 'tribe' && (
                    <TribeBadges tribeIds={[Number(opt.value)]} tribes={tribes as Tribe[]} />
                  )}
                  {type === 'contestant' && (() => {
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
                  {type === 'boolean' && <span className="uppercase">{String(opt.label || opt.value)}</span>}
                  {type !== 'tribe' && type !== 'contestant' && type !== 'boolean' && <span className="truncate max-w-[50vw]">{opt?.label}</span>}
                  
                  {/* Correct/Incorrect Icon & Points */}
                  {item.isCorrect ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" title="Correct" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-400" title="Incorrect" />
                  )}
                  <span className={item.isCorrect ? "text-green-400" : "text-red-400"}>
                    {item.points > 0 ? `+${item.points}` : item.points}
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