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
    //fetchPlayers();
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

        
      </div>
    </div>
  );
}
