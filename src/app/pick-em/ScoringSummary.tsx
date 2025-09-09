import { useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
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
          {breakdown.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3">
              <span className="text-stone-300">{item.label || `Question ${item.pickEmId}`}</span>
              <span className="flex items-center gap-2">
                {item.isCorrect ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-red-400" />
                )}
                <span className={item.isCorrect ? "text-green-400" : "text-red-400"}>
                  {item.points > 0 ? `+${item.points}` : item.points}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}