'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LargeTribeBadges } from '@/lib/utils/tribes'
import { useSeasonData } from '@/lib/hooks/useSeasonData'



type StatsContestant = {
  id: number;
  name: string;
  stats: {
    draftPercentage: number;
    soleSurvivorPercentage: number;
  };
  tribes: number[];
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};

export default function StatsPage() {
  const [statsContestants, setStatsContestants] = useState<StatsContestant[]>([]);
  const [castContestants, setCastContestants] = useState<{ id: number; tribes: number[] }[]>([]);
  const [loading, setLoading] = useState(false);
  // You can make the season dynamic as needed
  const season = "49";

  const { tribes } = useSeasonData(season)

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch stats data
        const statsRes = await fetch(`/api/contestant-stats/${season}`);
        const statsJson = await statsRes.json();
        if (statsJson.status === 'success' && statsJson.data) {
          setStatsContestants(statsJson.data);
        }
        // Fetch cast data to get each contestant's tribe IDs
        const castRes = await fetch(`/api/cast/${season}`);
        const castData = await castRes.json();
        setCastContestants(castData);
        // Fetch tribes data
        // const tribesRes = await fetch(`/api/show-tribes/${season}`);
        // const tribesData = await tribesRes.json();
        // setTribes(tribesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [season]);

  // Merge the stats with cast info so that each contestant has a tribes property.
  const mergedContestants: StatsContestant[] = statsContestants.map(sc => {
    const cast = castContestants.find(c => c.id === sc.id);
    return { ...sc, tribes: cast ? cast.tribes : [] };
  });

  // Group contestants by their first tribe in the tribes array (if none, group under 0)
  const grouped: Record<number, StatsContestant[]> = {};
  mergedContestants.forEach(contestant => {
    const tribeId = contestant.tribes.length > 0 ? contestant.tribes[0] : 0;
    if (!grouped[tribeId]) {
      grouped[tribeId] = [];
    }
    grouped[tribeId].push(contestant);
  });

  // For each group, sort contestants by draftPercentage descending
  Object.keys(grouped).forEach(key => {
    grouped[parseInt(key)] = grouped[parseInt(key)].sort(
      (a, b) => b.stats.draftPercentage - a.stats.draftPercentage
    );
  });

  

  if (loading) {
    return <p className="text-center py-10 text-stone-200">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-stone-800 text-stone-200 p-4 pt-8">
      
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-lostIsland tracking-wider uppercase mb-8 text-center">
          Draft Results by Tribe
        </h2>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center">No contestants found.</p>
        ) : (
          // Sort the group keys by tribe name (if available) or numerically (0 groups go last)
          Object.keys(grouped)
            .sort((a, b) => {
              const tribeA = tribes.find(t => t.id === parseInt(a));
              const tribeB = tribes.find(t => t.id === parseInt(b));
              if (!tribeA) return 1;
              if (!tribeB) return -1;
              return tribeA.name.localeCompare(tribeB.name);
            })
            .map(key => {
              const tribeId = parseInt(key);
              const groupContestants = grouped[tribeId];
              const tribeInfo = tribes.find(t => t.id === tribeId);
              return (
                <div key={tribeId} className="mb-8">
                  {tribeInfo && (
                    <div className="flex justify-center mb-4">
                      <LargeTribeBadges tribeIds={[Number(tribeInfo.id)]} tribes={tribes as Tribe[]} />
                    </div>
                  )}
                  {groupContestants.map(contestant => (
                    <div
                      key={contestant.id}
                      className="flex items-center space-x-4 border-y border-stone-500 py-3"
                    >
                      <Image
                        src={`/imgs/49/${contestant.name}.png`}
                        alt={contestant.name}
                        width={60}
                        height={60}
                        className="rounded-full border border-stone-500 p-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-lostIsland uppercase tracking-wider leading-none">
                          {contestant.name}
                        </div>
                        <span className="flex items-center font-lostIsland tracking-wider text-sm lowercase text-stone-400 my-1">
                          {contestant.stats.soleSurvivorPercentage.toFixed(0)}% picked to win –{' '}
                          {contestant.stats.draftPercentage.toFixed(0)}% drafted
                        </span>
                        <div
                          className="relative h-2 bg-stone-700 rounded-sm overflow-hidden"
                          style={{ textShadow: "2px 2px 1px rgba(0, 0, 0, 1)" }}
                        >
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-tr from-green-500 to-green-700 border-r-2 border-stone-900"
                            style={{
                              width: `${contestant.stats.draftPercentage}%`,
                            }}
                          ></div>
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-tr from-yellow-400 to-red-500 border-r-2 border-stone-900"
                            style={{
                              width: `${contestant.stats.soleSurvivorPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
        )}
      </div>

    </div>
  );
}
