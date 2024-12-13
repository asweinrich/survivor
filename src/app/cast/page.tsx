'use client';

import { useState, useEffect } from 'react';

type Contestant = {
  id: number;
  name: string;
  profession: string;
  tribes: string[];
  inPlay: boolean;
  madeMerge: boolean;
  top3: boolean;
  soleSurvivor: boolean;
  removed: boolean;
  immunityWins: number;
  hiddenIdols: number;
  tribalWins: number;
  rewards: number;
  img: string; // This should match the field in your database
};


export default function Contestants() {
  const [season, setSeason] = useState('47'); // Default season
  const [contestants, setContestants] = useState<Contestant[]>([]);

  // Fetch contestants when the season changes
  useEffect(() => {
    async function fetchContestants() {
      const res = await fetch(`/api/cast/${season}`);
      const data = await res.json();
      setContestants(data);
    }
    fetchContestants();
  }, [season]);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-stone-100 p-3">Survivor Contestants</h1>

        {/* Season Dropdown */}
        <div className="mb-8 px-4">
          <label htmlFor="season" className="block text-lg font-medium mb-2 text-stone-300">
            Select Season
          </label>
          <select
            id="season"
            className="p-2 border border-stone-700 rounded-md bg-stone-800 text-stone-200"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value="47">Season 47</option>
            {/* Add more seasons as needed */}
          </select>
        </div>

        {/* Contestants Table */}
        <div className="w-auto table-auto overflow-x-auto max-h-screen rounded-lg">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-stone-800 text-stone-300 sticky top-0 z-10 text-nowrap text-xs">
              <tr>
                <th className="sticky left-0 bg-stone-800 p-2 min-w-[12rem]">Survivor</th>
                <th className="p-2 text-left">Tribes</th>
                <th className="p-2 text-left">In Play</th>
                <th className="p-2 text-left">Merge</th>
                <th className="p-2 text-left">Top 3</th>
                <th className="p-2 text-left">Sole Survivor</th>
                <th className="p-2 text-left">Removed</th>
                <th className="p-2 text-left">Individual Wins</th>
                <th className="p-2 text-left">Hidden Idols</th>
                <th className="p-2 text-left">Tribal Wins</th>
                <th className="p-2 text-left">Rewards</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {contestants.map((contestant) => (
                <tr
                  key={contestant.id}
                  className={`${
                    contestant.inPlay ? 'opacity-100' : 'opacity-60'
                  } odd:bg-stone-700 even:bg-stone-800 text-center`}
                >
                  <td className="sticky left-0 p-1.5 bg-stone-900 min-w-[12rem]">
                    <div className="flex flex-row align-center text-nowrap">
                      <img
                        src={`/imgs/${contestant.img}.png`}
                        alt={contestant.name}
                        className="h-10 w-10 object-cover rounded-lg border border-stone-700 me-2"
                      />
                      <div className="flex flex-col text-start pt-1.5">
                        <span className="font-bold">{contestant.name}</span>
                        <span className="text-xs opacity-70"><em>{contestant.profession}</em></span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-nowrap">{contestant.tribes.join(', ')}</td>
                  <td className="p-2">
                    {contestant.inPlay ? (
                      <span className="text-green-400 font-bold">Yes</span>
                    ) : (
                      <span className="text-red-400 font-bold">No</span>
                    )}
                  </td>
                  <td className="p-2">
                    {contestant.madeMerge ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2">
                    {contestant.top3 ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2">
                    {contestant.soleSurvivor ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2">
                    {contestant.removed ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2">{contestant.immunityWins}</td>
                  <td className="p-2">{contestant.hiddenIdols}</td>
                  <td className="p-2">{contestant.tribalWins}</td>
                  <td className="p-2">{contestant.rewards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
