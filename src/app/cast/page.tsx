'use client';

import { useState, useEffect } from 'react';

type Contestant = {
  id: number;
  name: string;
  tribes: Int[];
  inPlay: boolean;
  img: string; // This should match the field in your database
};


export default function Contestants() {
  const [season, setSeason] = useState(47); // Default season
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
        <h1 className="text-3xl font-bold mb-2 text-stone-100 p-3">Survivor Contestants</h1>

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

        
        {contestants.map((contestant) => (
          <div className="flex flex-row justify-around">
            <div className="flex">
              <img
                src={`/imgs/${contestant.img}.png`}
                alt={contestant.name}
                className="h-10 w-10 object-cover rounded-lg border border-stone-700 me-2"
              />
            </div>
            <div className="flex">
              <span className="font-bold">{contestant.name}</span>{contestant.tribes.join(', ')}
              <span className="">{
                  contestant.inPlay ? (<div className="text-orange-800">In Play</div>) : (<div className="opacity-70">In Play</div>)
              }</span>
            </div>
            <div className="flex">
            </div>


          </div>
        









      
        ))}
            
      </div>
    </div>
  );
}
