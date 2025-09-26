import { MedTribeBadges } from '@/lib/utils/tribes';
import type { Tribe, Contestant } from '@/lib/types';

export function AvailablePickEmsSummary({
  markets,
  tribes,
  contestants,
  week,
}: {
  markets: Array<{
    id: number;
    question: string;
    description: string;
    options: Array<{ id: number; label: string; type: string; value: any; pointValue: number }>;
  }>;
  tribes: Tribe[];
  contestants: Contestant[];
  week: number;
}) {
  const contestantMap = contestants.reduce<Record<number, Contestant>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
  const firstName = (full?: string) => (full || '').split(' ')[0] || '';

  return (
    <div className="py-3 font-lostIsland lowercase text-stone-300">
      <h2 className="text-center text-2xl uppercase text-stone-300 mb-4">Week {week} Pick Ems</h2>
      {markets.length === 0 ? (
        <div className="text-stone-400 text-sm">No picks available for this week yet.</div>
      ) : (
        <ul>
          {markets.map((mkt) => (
            <li key={mkt.id} className="mb-4 pb-2 border-b-2 border-stone-700">
              <span className="text-stone-200 text-lg lowercase tracking-wider leading-tight">{mkt.question}</span>
              <div className="flex flex-wrap gap-0 pt-1">
                {mkt.options.map((opt) => {
                  let display: React.ReactNode = null;
                  if (opt.type === 'tribe') {
                    display = <MedTribeBadges tribeIds={[Number(opt.value)]} tribes={tribes} />;
                  } else if (opt.type === 'contestant') {
                    const c: Contestant | undefined = contestantMap[Number(opt.value)];
                    const name = c?.name ?? opt.label;
                    const img = c?.img ?? 'placeholder';
                    display = (
                      <span className="flex flex-col items-center gap-0">
                        <img src={`/imgs/${img}.png`} alt={name} className="h-10 w-10 rounded-full border border-stone-500 object-cover" />
                      </span>
                    );
                  } else if (opt.type === 'boolean') {
                    display = <span className="bg-stone-800 border-2 border-stone-700 px-3 py-2 min-w-20 text-center rounded-lg uppercase text-xl tracking-wider">{String(opt.label)}</span>;
                  } else {
                    display = <span className="truncate max-w-[40vw]">{opt.label ?? ''}</span>;
                  }
                  return (
                    <span
                      key={opt.id}
                      className="flex flex-col items-center justify-center p-2 text-stone-200"
                    >
                      {display}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}