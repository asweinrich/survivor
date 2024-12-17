'use client';

import { useState, useEffect } from 'react';
import { TrophyIcon, FireIcon } from '@heroicons/react/24/solid';


type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  inPlay: boolean;
  img: string; // This should match the field in your database
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};


export default function Contestants() {
  const [season, setSeason] = useState(47); // Default season
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);

  // Fetch contestants when the season changes
  useEffect(() => {

    async function fetchContestants() {
      const res = await fetch(`/api/cast/${season}`);
      const data = await res.json();
      setContestants(data);
    }
    fetchContestants();

    async function fetchTribes() {
      const res = await fetch(`/api/show-tribes/${season}`);
      const data = await res.json();
      setTribes(data);
    }
    fetchTribes();


  }, [season]);

  function getOrdinalSuffix(number: number): string {
    if (number >= 11 && number <= 13) return `${number}th`; // Special case for 11th, 12th, 13th
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
    return `${getOrdinalSuffix(votedOutOrder)} person voted out`;
  }

  function formatTribeBadges(tribeIds: number[]) {
    return tribeIds.map((id) => {
      const tribe = tribes.find((t) => t.id === id);
      if (!tribe) return null;

      return (
        <span
          key={id}
          className="inline-block px-3 py-0.5 text-sm tracking-wider rounded-full text-white me-1 uppercase font-lostIsland"
          style={{
            backgroundColor: hexToRgba(tribe.color, 0.3), // Transparent background
            color: tribe.color, // Solid text color
          }}
        >
          {tribe.name}
        </span>
      );
    });
  }

  function hexToRgba(hex: string, alpha: number): string {
    // Remove the '#' if present
    const cleanHex = hex.replace('#', '');
    // Convert hex to RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }


  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-stone-100 p-4 font-survivor tracking-wider">Survivor Contestants</h1>

        {/* Season Dropdown */}
        <div className="mb-8 px-4 font-lostIsland tracking-wider">
          <select
            id="season"
            className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value={47}>Season 47</option>
            {/* Add more seasons as needed */}
          </select>
        </div>

        
        {contestants.map((contestant) => (
        <div
          key={contestant.id}
          className="flex flex-row w-full items-center py-3 px-1 border-b border-t border-stone-700"
          style={{ opacity: contestant.inPlay ? 1 : 0.8 }}
        >
          {/* Image */}
          <div className="flex items-center justify-center w-24">
            <img
              src={`/imgs/${contestant.img}.png`}
              alt={contestant.name}
              className="h-20 w-20 object-cover rounded"
            />
          </div>

          {/* Survivor Name and Info */}
          <div className="flex flex-col flex-grow ps-1">
            <div className="flex flex-row items-center">
              <span className="text-lg uppercase font-lostIsland tracking-wider">{contestant.name}</span>
            </div>
            <div className="flex flex-row items-center my-0.5">
              <span className="">{formatTribeBadges(contestant.tribes)}</span>
            </div>
            <div className="flex items-center">
              {contestant.inPlay ? (<>
                <FireIcon className="h-5 w-5 text-orange-400 me-0.5 mb-0.5" />
                <div className="text-stone-300 lowercase font-lostIsland tracking-wider">In Play</div>
              </>) : (<>
                <FireIcon className="h-5 w-5 text-white opacity-60 me-0.5 mb-0.5" />
                <div className="text-stone-400 lowercase font-lostIsland tracking-wider">
                  {formatVotedOutOrder(contestant.voteOutOrder)}
                </div>
                
              </>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center justify-center w-20">
            <span className="text-4xl font-lostIsland tracking-widest">1134</span>
          </div>
        </div>










      
        ))}
            
      </div>
    </div>
  );
}
