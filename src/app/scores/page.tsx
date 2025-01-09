'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import ContestantProfile from '../components/ContestantProfile';
import Image from "next/image";


type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  inPlay: boolean;
  img: string;
  voteOutOrder: number;
  points: number; // Points for the contestant
};

type PlayerTribe = {
  id: number;
  tribeName: string;
  color: string;
  emoji: string;
  playerName: string;
  tribeArray: number[]; // Array of contestant IDs
  createdAt: string;
  score?: number;
  rank?: number;
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};

type RankedPlayerTribe = PlayerTribe & {
  rank: number;
};



export default function Scores() {
  const [season, setSeason] = useState('48'); // Default season
  const [playerTribes, setPlayerTribes] = useState<PlayerTribe[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);
  const [expandedTribes, setExpandedTribes] = useState<number[]>([]); // Tracks expanded dropdowns

  // Fetch PlayerTribes and Contestants when the season changes
  useEffect(() => {
    async function fetchPlayerTribes() {
      const res = await fetch(`/api/player-tribes/${season}`);
      const data = await res.json();
      setPlayerTribes(data);
    }
    fetchPlayerTribes();

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

  // Calculate scores for PlayerTribes
  const calculateScore = (tribe: PlayerTribe) => {
    return tribe.tribeArray.reduce((total, contestantId) => {
      const contestant = contestants.find((c) => c.id === contestantId);
      return total + (contestant?.points || 0);
    }, 0);
  };

  const toggleDropdown = (tribeId: number) => {
    setExpandedTribes((prev) =>
      prev.includes(tribeId) ? prev.filter((id) => id !== tribeId) : [...prev, tribeId]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setFocusContestant(0);
  };

  const activateModal = (id: number) => {
    setFocusContestant(id);
    setModalVisible(true);
  };

  // Sort PlayerTribes by score and createdAt
  const sortedPlayerTribes = [...playerTribes]
    .map((tribe) => ({
      ...tribe,
      score: calculateScore(tribe),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score; // Higher scores first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Older createdAt first
    });

    console.log('Sorted Player Tribes:', sortedPlayerTribes);

  // Assign Rankings with Ties
  const rankedTribes: RankedPlayerTribe[] = sortedPlayerTribes.map((tribe, index, array) => {
    let rank = index + 1;

    if (index > 0 && array[index].score === array[index - 1].score) {
      rank = array[index - 1].rank ?? 1;
    }

    console.log(`Tribe: ${tribe.tribeName}, Score: ${tribe.score}, Rank: ${rank}`);

    return { ...tribe, rank };
  });



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
    if(votedOutOrder === 903) {
      return `Sole Survivor`
    } else if(votedOutOrder === 902) {
      return `2nd Place`
    } else if(votedOutOrder === 901) {
      return `3rd Place`
    } else if(votedOutOrder === 600) {
      return `Lost Fire Making`
    } else {
      return `${getOrdinalSuffix(votedOutOrder)} person voted out`;
    }
  }

  function formatTribeBadges(tribeIds: number[]) {
    return tribeIds.map((id) => {
      const tribe = tribes.find((t) => t.id === id);
      if (!tribe) return null;

      return (
        <span
          key={id}
          className="inline-block px-2 py-0 tracking-wider rounded-full text-white me-1 lowercase font-lostIsland"
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
      
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png" // Replace with your background image path
            alt="Survivor Background"
            layout="fill"
            objectFit="cover"
            className=""
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)",
            }}
          ></div>

        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">Tribe Leaderboard</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/${season}/logo.png`} // Replace with your Survivor logo path
            alt="Survivor Season 48 Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
      
        {/* Season Dropdown */}
        <div className="mb-8 px-4 font-lostIsland tracking-wider">
          <select
            id="season"
            className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value={'48'}>Season 48</option>
            {/* Add more seasons as needed */}
          </select>
        </div>

        {rankedTribes.map((tribe) => (
          <div key={tribe.id} className="border-b border-t border-stone-700 p-3">
            <div className="flex items-center justify-start">
              {/* Emoji and Tribe Info */}
              <div className="flex items-center w-8 font-lostIsland text-2xl me-2">
                <span className="mx-auto">{tribe.rank}</span>
              </div>
              <div className="flex items-center">
                <div
                  className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: tribe.color }}
                >
                  {tribe.emoji}
                </div>
                <div className="ms-3">
                  <div className="text-xl font-lostIsland leading-tight">{tribe.tribeName}</div>
                  <div className="text-stone-400 font-lostIsland leading-tight">{tribe.playerName}</div>
                </div>
              </div>

              {/* Score and Dropdown Toggle */}
              <div className="flex items-center ms-auto me-0">
                <span className="text-2xl font-lostIsland tracking-widest mr-2">
                  {calculateScore(tribe)}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 stroke-3 cursor-pointer ${
                    expandedTribes.includes(tribe.id) ? 'rotate-180' : ''
                  }`}
                  onClick={() => toggleDropdown(tribe.id)}
                />
              </div>
            </div>

            {/* Dropdown with Contestants */}
            {expandedTribes.includes(tribe.id) && (
              <div className="p-3">
                {tribe.tribeArray.map((contestantId) => {
                  const contestant = contestants.find((c) => c.id === contestantId);
                  if (!contestant) return null;
                  return (
                    <div
                      key={contestant.id}
                      className="flex items-center py-1 border-b border-stone-700"
                    >
                      <img
                        src={`/imgs/${contestant.img}.png`}
                        alt={contestant.name}
                        className="h-12 w-12 object-cover me-3"
                      />
                      <div className="flex-grow">
                        <div className="text-lg font-lostIsland leading-tight ps-0.5">{contestant.name}</div>
                        
                        <div className="flex items-center leading-tight">
                          {contestant.inPlay && (<>
                            <FireIcon className="h-5 w-5 text-orange-400 me-1" />
                            <div className="text-stone-300 lowercase font-lostIsland tracking-wider">In Play</div>
                          </>)}
                          {(!contestant.inPlay && contestant.voteOutOrder === 903) && (<>
                            <TrophyIcon className="h-5 w-5 text-yellow-400 me-2" />
                            <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                              {formatVotedOutOrder(contestant.voteOutOrder)}
                            </div>
                            
                          </>)}
                          {(!contestant.inPlay && contestant.voteOutOrder === 902) && (<>
                            <TrophyIcon className="h-5 w-5 text-zinc-400 me-2" />
                            <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                              {formatVotedOutOrder(contestant.voteOutOrder)}
                            </div>
                            
                          </>)}
                          {(!contestant.inPlay && contestant.voteOutOrder === 901) && (<>
                            <TrophyIcon className="h-5 w-5 text-amber-600 me-2" />
                            <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                              {formatVotedOutOrder(contestant.voteOutOrder)}
                            </div>
                            
                          </>)}
                          {(!contestant.inPlay && contestant.voteOutOrder < 900) && (
                           <>
                            <FireIcon className="h-5 w-5 text-white opacity-60 me-1" />
                            <div className="text-stone-400 lowercase font-lostIsland tracking-wider">
                              {formatVotedOutOrder(contestant.voteOutOrder)}
                            </div>
                            
                          </>
                          )}
                        </div>
                      </div>
                      <div className="text-xl font-lostIsland text-stone-300">{contestant.points || 0}</div>
                      <IdentificationIcon
                        className="w-6 h-6 ms-3 cursor-pointer text-stone-400 hover:text-stone-200"
                        onClick={() => activateModal(contestant.id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Modal */}
        {modalVisible && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-3xl h-[92%] overflow-y-scroll bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland"
              onClick={(e) => e.stopPropagation()} // Prevent modal close on click inside
            >
              <button
                className="text-stone-400 hover:text-stone-200 absolute top-3 right-4"
                onClick={closeModal}
              >
                ✕
              </button>
              <ContestantProfile contestantId={focusContestant} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
