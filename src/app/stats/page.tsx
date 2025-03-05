'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Contestant = {
  id: number;
  name: string;
  stats: {
    draftPercentage: number;
    soleSurvivorPercentage: number;
  };
};

export default function StatsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(false);
  // You can make the season dynamic as needed
  const season = "48";

  useEffect(() => {
    async function fetchContestants() {
      setLoading(true);
      try {
        const res = await fetch(`/api/contestant-stats/${season}`);
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          // Sort contestants by draftPercentage descending
          const sorted = json.data.sort(
            (a: Contestant, b: Contestant) =>
              b.stats.draftPercentage - a.stats.draftPercentage
          );
          setContestants(sorted);
        }
      } catch (error) {
        console.error('Error fetching contestant stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContestants();
  }, [season]);

  if (loading) {
    return <p className="text-center py-10 text-stone-200">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-stone-800 text-stone-200 p-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-lostIsland tracking-wider uppercase mb-4 text-center">
          Draft Results
        </h2>
        <div className="">
          {contestants.map((contestant) => (
            <div key={contestant.id} className="flex items-center space-x-4 border-y border-stone-500 py-3">
              <Image
                src={`/imgs/48/${contestant.name}.png`}
                alt={contestant.name}
                width={60}
                height={60}
                className="rounded-full border border-stone-500 p-0.5"
              />
              <div className="flex-1">
                <div className="font-lostIsland uppercase tracking-wider leading-none">{contestant.name}</div>
                <span className="flex items-center font-lostIsland tracking-wider text-sm lowercase text-stone-400 my-1">
                  {contestant.stats.soleSurvivorPercentage.toFixed(0)}% picked to win --{' '}
                  {contestant.stats.draftPercentage.toFixed(0)}% drafted
                  
                </span>
                <div className="relative h-2 bg-stone-700 rounded-sm overflow-hidden" style={{ textShadow: "2px 2px 1px rgba(0, 0, 0, 1)" }}>
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-tr from-green-500 to-green-700 border-r-2 border-stone-900"
                    style={{
                      width: `${contestant.stats.draftPercentage}%`,
                    }}
                  >
                  </div>
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
      </div>
    </div>
  );
}
