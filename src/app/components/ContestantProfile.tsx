import { useState, useEffect, useMemo } from 'react';
import { TrophyIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import scores47 from '../scoring/47scores.json';

import { TribeBadges } from '@/lib/utils/tribes';

type Contestant = {
  id: number;
  name: string;
  img: string;
  season: number;
  hometown: string;
  profession: string;
  tribes: number[];
  inPlay: boolean;
  episodes: number;
  advantages: number;
  madeMerge: boolean | null;
  top3: boolean | null;
  soleSurvivor: boolean | null;
  immunityWins: number | null;
  tribalWins: number | null;
  hiddenIdols: number | null;
  rewards: number | null;
  madeFire: boolean | null;
  voteOutOrder: number;
  createdAt: Date;
  age: number;
  pastSeasons?: PastSeason[];
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};

type ScoringCategory = {
  name: string;
  points: number;
  schemaKey: string;
  type?: 'boolean' | 'count' | 'scalar';
};

type Recap = {
  id: number;
  headline: string;
  body: string;
  created_at: Date;
};

type PastSeason = {
  seasonName: string;
  seasonNumber: number;
  color: string;
};

type WeeklyTotalsByCategoryRow = {
  category: string; // schemaKey
  _sum: { value: number | null; points?: number | null };
};

// Legacy list retained (kept as close as possible to your existing UI expectations)
const legacyScoringCategories: ScoringCategory[] = [
  { name: 'Sole Survivor', points: 500, schemaKey: 'soleSurvivor', type: 'boolean' },
  { name: 'Final Three', points: 150, schemaKey: 'top3', type: 'boolean' },
  { name: 'Win Fire Making', points: 100, schemaKey: 'madeFire', type: 'boolean' },
  { name: 'Make the Merge', points: 100, schemaKey: 'madeMerge', type: 'boolean' },
  { name: 'Individual Immunities', points: 100, schemaKey: 'immunityWins', type: 'count' },
  { name: 'Reward Challenges', points: 50, schemaKey: 'rewards', type: 'count' },
  { name: 'Hidden Immunity Idols', points: 70, schemaKey: 'hiddenIdols', type: 'count' },
  { name: 'Tribal Immunity Challenges', points: 30, schemaKey: 'tribalWins', type: 'count' },
  { name: 'Survive an Episode', points: 30, schemaKey: 'episodes', type: 'count' },
  { name: 'Advantages', points: 20, schemaKey: 'advantages', type: 'count' },
];

// Outcome keys that should be sourced from Contestant table (not weekly ledger)
const booleanLikeKeys = new Set(['soleSurvivor', 'top3', 'madeFire', 'madeMerge']);

export default function ContestantProfile({ contestantId }: { contestantId: number | null }) {
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [powerRank, setPowerRank] = useState<string | number>('--');
  const [rosterPercentage, setRosterPercentage] = useState<number | null>(null);
  const [winnerPercentage, setWinnerPercentage] = useState<number | null>(null);

  // S50+ header points (weekly ledger total)
  const [totalPoints, setTotalPoints] = useState<number>(0);

  // S50+ categories from values50.json
  const [scoringCategories50, setScoringCategories50] = useState<ScoringCategory[] | null>(null);

  // S50+ weekly totals by category (sum WeeklyScore.value)
  const [weeklyTotalsByCategory, setWeeklyTotalsByCategory] = useState<WeeklyTotalsByCategoryRow[]>([]);
  const [weeklyTotalsLoading, setWeeklyTotalsLoading] = useState(false);

  const isSeason50Plus = (contestant?.season ?? 0) >= 50;

  // Fetch contestant details + rank
  useEffect(() => {
    if (contestantId === null) {
      setContestant(null);
      setPowerRank('--');
      setRosterPercentage(null);
      setWinnerPercentage(null);
      setTotalPoints(0);
      setWeeklyTotalsByCategory([]);
      setScoringCategories50(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`/api/contestant/${contestantId}`)
      .then((res) => res.json())
      .then((data) => {
        setContestant(data?.[0] ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching contestant details:', error);
        setContestant(null);
        setLoading(false);
      });

    fetch(`/api/contestant-rank/${contestantId}`)
      .then((res) => res.json())
      .then((data) => setPowerRank(data?.rank ?? '--'))
      .catch((error) => {
        console.error('Error fetching contestant power rank:', error);
        setPowerRank('--');
      });
  }, [contestantId]);

  // Fetch tribes + recaps + roster%
  useEffect(() => {
    if (!contestant?.season) return;

    fetch(`/api/show-tribes/${contestant.season}`)
      .then((res) => res.json())
      .then((data) => setTribes(data))
      .catch((error) => console.error('Error fetching tribes:', error));

    fetch(`/api/recap/${contestant.id}`)
      .then((res) => res.json())
      .then((data) => setRecaps(data))
      .catch((error) => console.error('Error fetching recaps:', error));

    if (contestant.season === 47) {
      const totalTribes = scores47.length;
      let draftedCount = 0;
      let soleSurvivorCount = 0;

      scores47.forEach((entry) => {
        const tribeArray: number[] = entry.tribeArray;
        if (tribeArray.includes(contestant.id)) {
          draftedCount++;
          if (tribeArray[0] === contestant.id) soleSurvivorCount++;
        }
      });

      setRosterPercentage(Math.round((draftedCount / totalTribes) * 100));
      setWinnerPercentage(Math.round((soleSurvivorCount / totalTribes) * 100));
    } else {
      fetch(`/api/roster-pct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: contestant.id, season: contestant.season }),
      })
        .then((res) => res.json())
        .then((data) => {
          setRosterPercentage(Math.round(data.rosterPercentage) || 0);
          setWinnerPercentage(Math.round(data.soleSurvivorPercentage) || 0);
        })
        .catch((error) => {
          console.error('Error fetching roster percentage:', error);
          setRosterPercentage(0);
          setWinnerPercentage(0);
        });
    }
  }, [contestant]);

  // Load values50.json scoring categories for S50+
  useEffect(() => {
    if (!contestant) return;

    if (contestant.season >= 50) {
      (async () => {
        try {
          const mod = await import('@/app/scoring/values50.json');
          const cats = (mod.default || mod) as Array<{ name: string; points: number; schemaKey: string; type?: string }>;
          setScoringCategories50(
            cats.map((c) => ({
              name: c.name,
              points: c.points,
              schemaKey: c.schemaKey,
              type: (c.type === 'boolean' ? 'boolean' : 'count') as 'boolean' | 'count',
            }))
          );
        } catch (e) {
          console.error('Failed to load values50.json', e);
          setScoringCategories50([]);
        }
      })();
    } else {
      setScoringCategories50(null);
    }
  }, [contestant]);

  // S50+ header points from weekly ledger via API
  useEffect(() => {
    if (!contestant) return;

    if (contestant.season >= 50) {
      fetch(`/api/contestant-points/${contestant.id}`)
        .then((res) => res.json())
        .then((data) => setTotalPoints(Number(data?.totalPoints ?? 0)))
        .catch((error) => {
          console.error('Error fetching contestant total points:', error);
          setTotalPoints(0);
        });
    } else {
      setTotalPoints(0);
    }
  }, [contestant]);

  // S50+ stats tab counts: sum WeeklyScore.value by category
  useEffect(() => {
    if (!contestant || contestant.season < 50) {
      setWeeklyTotalsByCategory([]);
      return;
    }

    setWeeklyTotalsLoading(true);
    fetch(`/api/weekly-score/totals-by-category?contestantId=${contestant.id}&season=${contestant.season}`)
      .then((res) => res.json())
      .then((data) => setWeeklyTotalsByCategory(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error('Error fetching weekly totals by category:', error);
        setWeeklyTotalsByCategory([]);
      })
      .finally(() => setWeeklyTotalsLoading(false));
  }, [contestant]);

  const weeklyCountByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of weeklyTotalsByCategory) {
      m.set(row.category, row._sum?.value ?? 0);
    }
    return m;
  }, [weeklyTotalsByCategory]);

  // Choose categories for Stats tab
  const categoriesForStats: ScoringCategory[] = useMemo(() => {
    if (!contestant) return [];
    if (contestant.season >= 50) return scoringCategories50 ?? [];
    return legacyScoringCategories;
  }, [contestant, scoringCategories50]);

  function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getOrdinalSuffix(number: number): string {
    if (number >= 11 && number <= 13) return `${number}th`;
    const lastDigit = number % 10;
    switch (lastDigit) {
      case 1:
        return `${number}st`;
      case 2:
        return `${number}nd`;
      case 3:
        return `${number}rd`;
      default:
        return `${number}th`;
    }
  }

  function formatVotedOutOrder(votedOutOrder: number): string {
    if (votedOutOrder === 903) return 'Sole Survivor';
    if (votedOutOrder === 902) return '2nd Place';
    if (votedOutOrder === 901) return '3rd Place';
    if (votedOutOrder === 600) return 'Lost Fire Making';
    if (votedOutOrder === 700) return 'Medically Removed';
    return `${getOrdinalSuffix(votedOutOrder)} person voted out`;
  }

  function calculateLegacyTotalScore(): number {
    if (!contestant) return 0;

    return legacyScoringCategories.reduce((total, category) => {
      const value = contestant[category.schemaKey as keyof Contestant];

      if (typeof value === 'boolean') return total + (value ? category.points : 0);
      if (typeof value === 'number') return total + value * category.points;

      return total;
    }, 0);
  }

  const headerPoints = isSeason50Plus ? totalPoints : calculateLegacyTotalScore();

  function renderBooleanBadge(value: boolean | null) {
    if (value === true) {
      return (
        <span className="inline-block uppercase px-2 py-1 w-10 text-center text-sm text-green-400 bg-green-900 rounded-lg tracking-widest">
          Yes
        </span>
      );
    }
    if (value === false) {
      return (
        <span className="inline-block uppercase px-2 py-1 w-10 text-center text-sm text-red-400 bg-red-900 rounded-lg tracking-widest">
          No
        </span>
      );
    }
    return (
      <span className="inline-block uppercase px-2 py-1 w-10 text-center text-sm text-gray-400 bg-gray-700 rounded-lg tracking-widest">
        ??
      </span>
    );
  }

  function formatDateTime(dateTime: Date | string): string {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    const now = new Date();

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = diffInDays === 0;
    const isYesterday = diffInDays === 1;

    if (isToday) return `Today • ${timeFormatter.format(date)}`;
    if (isYesterday) return `Yesterday • ${timeFormatter.format(date)}`;
    return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`;
  }

  function formatPastSeasonBadges(pastSeasons: PastSeason[]) {
    return pastSeasons.map((season, index) => (
      <span
        key={index}
        className="inline-block border border-black px-2 py-0.5 text-sm tracking-wider rounded-full me-1.5 mb-1.5 lowercase font-lostIsland"
        style={{
          backgroundColor: hexToRgba(season.color, 0.2),
          color: season.color,
          textShadow: '1px 1px 0px rgba(0,0,0,1)',
        }}
      >
        {season.seasonName} {season.seasonNumber < 41 && `(${season.seasonNumber})`}
      </span>
    ));
  }

  return (
    <>
      {contestant ? (
        <div className="flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-start items-center border-b border-stone-600 p-4">
            <div className="self-center mt-0 me-4">
              <img
                src={`/imgs/${contestant.img}.png`}
                alt={contestant.name}
                className={`w-28 h-28 object-cover mx-auto border-4 border-stone-500 rounded-full p-1`}
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg tracking-wider leading-tight max-w-56 uppercase">{contestant?.name || 'Loading...'}</h2>
              <p className="text-sm tracking-wide opacity-80 uppercase leading-tight max-w-60">
                <span className="text-base tracking-none">{contestant.age} •</span> {contestant.profession}
              </p>
              <p className="text-sm tracking-wide opacity-80 uppercase leading pb-0.5">{contestant.hometown}</p>
              {contestant.tribes.length > 0 && (
                <p className="text-sm -ms-0.5 my-1.5 max-w-56">
                  <TribeBadges tribeIds={contestant.tribes} tribes={tribes as Tribe[]} />
                </p>
              )}
              <div className="flex text-sm uppercase">
                {contestant.inPlay && (
                  <>
                    <FireIcon className="h-5 w-5 text-orange-400 me-1" />
                    <div className="pt-0.5 text-stone-300 uppercase font-lostIsland tracking-wider">In Play</div>
                  </>
                )}

                {!contestant.inPlay && contestant.voteOutOrder === 903 && (
                  <>
                    <TrophyIcon className="h-5 w-5 text-yellow-400 me-2" />
                    <div className="pt-0.5 text-stone-200 uppercase font-lostIsland tracking-wider">
                      {formatVotedOutOrder(contestant.voteOutOrder)}
                    </div>
                  </>
                )}

                {!contestant.inPlay && contestant.voteOutOrder === 902 && (
                  <>
                    <TrophyIcon className="h-5 w-5 text-zinc-400 me-2" />
                    <div className="pt-0.5 text-stone-200 uppercase font-lostIsland tracking-wider">
                      {formatVotedOutOrder(contestant.voteOutOrder)}
                    </div>
                  </>
                )}

                {!contestant.inPlay && contestant.voteOutOrder === 901 && (
                  <>
                    <TrophyIcon className="h-5 w-5 text-amber-600 me-2" />
                    <div className="pt-0.5 text-stone-200 uppercase font-lostIsland tracking-wider">
                      {formatVotedOutOrder(contestant.voteOutOrder)}
                    </div>
                  </>
                )}

                {!contestant.inPlay && contestant.voteOutOrder < 900 && (
                  <>
                    <FireIcon className="h-5 w-5 text-white opacity-60 me-1" />
                    <div className="pt-0.5 text-stone-400 uppercase font-lostIsland tracking-wider">
                      {formatVotedOutOrder(contestant.voteOutOrder)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {contestant.season === 50 && (
            <div className="flex flex-col jusitfy-start p-2 border-b border-stone-600">
              <h2 className="px-1 lowercase text-lg">Previously On</h2>
              <div className="flex">
                <p className="text-sm mt-1.5">{formatPastSeasonBadges(contestant.pastSeasons ?? [])}</p>
              </div>
            </div>
          )}

          <div className="flex justify-around items-center border-b border-stone-600 p-3">
            <div className="flex flex-col mx-4 text-center">
              <span className="text-xl tracking-wider">{headerPoints}</span>
              <span className="lowercase opacity-70 text-sm">points</span>
            </div>
            <div className="flex flex-col mx-4 text-center">
              <span className="text-xl tracking-wider">{powerRank}</span>
              <span className="lowercase opacity-70 text-sm">power rank</span>
            </div>
            <div className="flex flex-col mx-4 text-center">
              <span className="text-xl tracking-wider">{rosterPercentage ?? 0}%</span>
              <span className="lowercase opacity-70 text-sm">drafted</span>
            </div>
            <div className="flex flex-col mx-4 text-center">
              <span className="text-xl tracking-wider">{winnerPercentage ?? 0}%</span>
              <span className="lowercase opacity-70 text-sm">sole survivor</span>
            </div>
          </div>

          {/* Menu Row */}
          <div className="flex justify-around items-center border-b border-stone-600 p-0 lowercase">
            <button
              onClick={() => setActiveTab('stats')}
              className={`text-xl tracking-wider py-2 w-full ${
                activeTab === 'stats'
                  ? 'text-orange-400 border-b-4 border-orange-400'
                  : 'text-stone-300 border-b-4 border-stone-800'
              }`}
            >
              Stats
            </button>
          </div>

          {/* Content */}
          <div className="h-full px-0">
            {activeTab === 'overview' && (
              <div>
                {recaps.length > 0 ? (
                  recaps.map((recap) => (
                    <div key={recap.id} className="flex flex-col p-5 border-b border-stone-600">
                      <span className="text-stone-300 me-auto text-xl uppercase mb-0 tracking-wider">{recap.headline}</span>
                      <span className="text-stone-400 me-auto mb-1 text-lg tracking-wider lowercase">{formatDateTime(recap.created_at)}</span>
                      <span className="text-stone-200 me-auto font-inter" style={{ whiteSpace: 'pre-line' }}>
                        {recap.body.replace(/\\n/g, '\n')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col p-5 border-b border-stone-600 tracking-wide">
                    <span className="text-stone-300 me-auto text-xl text-center w-full my-5">No recent updates</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="pb-4">
                <div className="flex justify-between w-full py-1 text-sm px-5 py-3 text-stone-300 opacity-90 border-b border-stone-600 lowercase tracking-wider">
                  <span className="me-auto">Category</span>
                  <span className="text-center w-12">Count</span>
                  <span className="text-end w-16">Points</span>
                </div>

                {contestant.season >= 50 && weeklyTotalsLoading && (
                  <div className="flex flex-col justify-center items-center py-6 border-b border-stone-600">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-stone-200" />
                    <p className="font-lostIsland text-base lowercase mt-2 tracking-wider">Loading weekly totals...</p>
                  </div>
                )}

                {categoriesForStats.map((category) => {
                  const isWeekly = contestant.season >= 50;
                  const isOutcomeBoolean = booleanLikeKeys.has(category.schemaKey);

                  // Weekly season: counts from SUM(WeeklyScore.value) by category
                  const weeklyCount = weeklyCountByCategory.get(category.schemaKey);

                  // Contestant table value (authoritative for outcome booleans, and legacy seasons)
                  const contestantValue = contestant[category.schemaKey as keyof Contestant];

                  const countToDisplay = (() => {
                    // For S50+ outcome booleans, use Contestant table value (not weekly)
                    if (isWeekly && isOutcomeBoolean) {
                      if (typeof contestantValue === 'boolean') return contestantValue ? 1 : 0;
                      return 0;
                    }

                    // For S50+ other categories, use weekly counts
                    if (isWeekly) return weeklyCount ?? 0;

                    // For <=49, use contestant columns
                    if (typeof contestantValue === 'boolean') return contestantValue ? 1 : 0;
                    if (typeof contestantValue === 'number') return contestantValue;
                    return 0;
                  })();

                  const shouldShowBooleanBadge =
                    (!isWeekly && typeof contestantValue === 'boolean') ||
                    (isWeekly && isOutcomeBoolean);

                  const booleanValueForBadge: boolean | null = (() => {
                    if (!shouldShowBooleanBadge) return null;
                    if (typeof contestantValue === 'boolean') return contestantValue;
                    return null; // null => "??"
                  })();

                  return (
                    <div key={category.schemaKey} className="flex justify-between items-center px-5 py-3 border-b border-stone-600">
                      <span className="text-stone-300 me-auto text-lg">{category.name}</span>

                      <span className="text-center w-12 text-lg">
                        {shouldShowBooleanBadge ? renderBooleanBadge(booleanValueForBadge) : <span>{String(countToDisplay ?? 0)}</span>}
                      </span>

                      <span className="text-orange-400 text-xl w-16 text-end pe-2">
                        {Math.round((countToDisplay ?? 0) * category.points)}
                      </span>
                    </div>
                  );
                })}

                <p className="font-inter w-full text-center p-4 border-b border-stone-600 text-sm">
                  Review scoring rules and point values{' '}
                  <a href="/how-to-play/#scoring" target="_blank" className="underline text-orange-500 hover:text-orange-400">
                    here
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-10 h-96">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
          <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">{loading ? 'Loading...' : 'No contestant selected'}</p>
        </div>
      )}
    </>
  );
}