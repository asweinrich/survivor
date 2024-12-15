'use client';

import { useState, useEffect } from 'react';

type Player = {
  id: number;
  name: string;
  tribeName: string;
  color: string; // Hex code for player color
  picks: string[][]; // Array of picks categories
};

export default function Scores() {
  const [season, setSeason] = useState('47'); // Default season
  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch players and their picks when the season changes
  useEffect(() => {
    async function fetchPlayers() {
      const res = await fetch(`/api/players/${season}`);
      const data = await res.json();
      setPlayers(data);
    }
    fetchPlayers();
  }, [season]);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-stone-100 p-3">Survivor Scores</h1>

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

        {/* Players Table */}
        <div className="w-auto table-auto overflow-x-auto max-h-screen rounded-lg">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-stone-800 text-stone-300 sticky top-0 z-10 text-nowrap text-xs">
              <tr>
                <th className="sticky left-0 bg-stone-800 p-2 min-w-[12rem]">Player</th>
                <th className="p-2 text-left">Tribe</th>
                <th className="p-2 text-left">Non-Merge</th>
                <th className="p-2 text-left">Merge</th>
                <th className="p-2 text-left">Top 3</th>
                <th className="p-2 text-left">Sole Survivor</th>
                <th className="p-2 text-left">Removed</th>
                <th className="p-2 text-left">Immunity Wins</th>
                <th className="p-2 text-left">Hidden Idols</th>
                <th className="p-2 text-left">Tribal Wins</th>
                <th className="p-2 text-left">Rewards</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {players.map((player) => (
                <tr
                  key={player.id}
                  className={`odd:bg-stone-700 even:bg-stone-800 text-center`}
                >
                  <td className="sticky left-0 p-1.5 bg-stone-900 min-w-[12rem]">
                    <div className="flex flex-row align-center text-nowrap">
                      <div
                        className="h-6 w-6 rounded-full border border-stone-700 me-2"
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <span className="font-bold pt-1.5">{player.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-nowrap">{player.tribeName}</td>
                  {player.picks?.map((category, index) => (
                    <td key={index} className="p-2 text-left">
                      {category?.filter((pick) => pick !== '').join(', ') || 'None'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
