'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDownIcon, IdentificationIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import ContestantProfile from '../components/ContestantProfile';
import Image from "next/image";
import season47Scores from '../scoring/47scores.json';

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  inPlay: boolean;
  img: string;
  voteOutOrder: number;
  points: number;
};

type PlayerTribe = {
  id: number;
  tribeName: string;
  color: string;
  emoji: string;
  playerName: string;
  tribeArray: number[];
  createdAt: string;
  score?: number;
  rank?: number;
  paid: boolean;
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};

type RankedPlayerTribe = PlayerTribe & {
  rank: number;
};

export default function Leaderboard() {
  const [season, setSeason] = useState('48'); // Default season
  const [playerTribes, setPlayerTribes] = useState<PlayerTribe[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);
  const [expandedTribes, setExpandedTribes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  // NEW: Spoiler toggle state
  const [revealSpoilers, setRevealSpoilers] = useState(false);

  // Fetch PlayerTribes and Contestants when the season changes
  useEffect(() => {
    setLoading(true);
    setExpandedTribes([]);

    async function fetchData() {
      if (season === '47') {
        // Load static JSON data for Season 47
        setPlayerTribes(season47Scores as PlayerTribe[]);
      } else {
        const res = await fetch(`/api/player-tribes/${season}`);
        const data = await res.json();
        setPlayerTribes(data);
      }

      const castRes = await fetch(`/api/cast/${season}`);
      const castData = await castRes.json();
      setContestants(castData);

      const tribesRes = await fetch(`/api/show-tribes/${season}`);
      const tribesData = await tribesRes.json();
      setTribes(tribesData);

      setLoading(false);
    }

    fetchData();
  }, [season]);

  // Create a lookup map for contestants
  const contestantMap = useMemo(() => {
    return contestants.reduce<Record<number, Contestant>>((map, contestant) => {
      map[contestant.id] = contestant;
      return map;
    }, {});
  }, [contestants]);

  // Calculate tribe score using the lookup map
  const calculateScore = useCallback((tribe: PlayerTribe): number => {
    if (season === '47') {
      return tribe.score || 0;
    }
    return tribe.tribeArray.reduce((total, contestantId) => {
      const contestant = contestantMap[contestantId];
      return total + (contestant?.points || 0);
    }, 0);
  }, [contestantMap, season]);

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

  // Helper: Determine the contestant's border color.
  // When spoilers are hidden, always return a uniform border.
  function getStatusBorder(contestant: Contestant): string {
    if (!revealSpoilers) {
      return 'border-gray-400';
    }
    if (!contestant.inPlay && contestant.voteOutOrder) {
      if (contestant.voteOutOrder === 903) return 'border-yellow-400';
      if (contestant.voteOutOrder === 902) return 'border-zinc-400';
      if (contestant.voteOutOrder === 901) return 'border-amber-600';
    }
    return contestant.inPlay ? 'border-green-400' : 'border-red-500';
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
    if(votedOutOrder === 903) {
      return `Sole Survivor`;
    } else if(votedOutOrder === 902) {
      return `2nd Place`;
    } else if(votedOutOrder === 901) {
      return `3rd Place`;
    } else if(votedOutOrder === 600) {
      return `Lost Fire Making`;
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
            backgroundColor: hexToRgba(tribe.color, 0.3),
            color: tribe.color,
          }}
        >
          {tribe.name}
        </span>
      );
    });
  }

  function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Sorting and ranking
  const sortedPlayerTribes = [...playerTribes]
    .map((tribe) => ({ ...tribe, score: calculateScore(tribe) }))
    .sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const rankedTribes: RankedPlayerTribe[] = sortedPlayerTribes.map((tribe, index, array) => {
    let rank = index + 1;
    if (index > 0 && array[index].score === array[index - 1].score) {
      rank = array[index - 1].rank!;
    }
    return { ...tribe, rank };
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png"
            alt="Survivor Background"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)",
            }}
          ></div>
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Tribe Leaderboard
        </h1>
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/${season}/logo.png`}
            alt="Survivor Season 48 Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Instruction Section */}
        <div className="lowercase text-stone-200 border-y border-stone-500 p-4 my-8 font-lostIsland tracking-wider">
          <p className="mb-3">
            Click a tribe to expand their lineup and see contestant points.
          </p>
          <p className="mb-3">
            Tap the <IdentificationIcon className="inline mx-1.5 w-5 h-5 stroke-2 text-stone-300" /> icon to view detailed contestant stats.
          </p>
          <p className="">
            Rankings are based on total points earned by each tribe.
          </p>
          {season === '47' && 
            <p className="mt-3 text-orange-300">
              Season 47 was scored using a different set of rules than the current season. The three contestants in a tribe represent that tribe's top 3 picks from Season 47.
            </p>
          }
        </div>

        <div className="flex justify-between mb-8 px-4">

          {/* Season Dropdown */}
          <div className="font-lostIsland tracking-wider">
            <select
              id="season"
              className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value={'48'}>Season 48</option>
              <option value={'47'}>Season 47</option>
            </select>
          </div>

          {/* Spoiler Toggle */}
          <div className="flex items-center font-lostIsland tracking-wider uppercase text-stone-200">
            <label htmlFor="spoilerSwitch" className="flex items-center cursor-pointer">
              <span className="mr-3">Reveal Spoilers</span>
              <div className="relative">
                <input
                  type="checkbox"
                  id="spoilerSwitch"
                  className="sr-only peer"
                  checked={revealSpoilers}
                  onChange={(e) => setRevealSpoilers(e.target.checked)}
                />
                <div className="w-12 h-7 bg-gray-400 rounded-full peer-focus:ring-2 peer-focus:ring-orange-300 peer-checked:bg-orange-500 transition-colors"></div>
                <div className="absolute top-1 left-1 w-5 h-5 bg-stone-200 border-2 border-stone-800 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
            <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
          </div>
        ) : rankedTribes.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-10 px-4 text-center leading-tight">
            <p className="font-lostIsland text-lg my-2 tracking-wider">
              No tribes have been drafted for this season yet.
            </p>
            <p className="font-lostIsland text-lg my-2 tracking-wider">
              Tribe rosters will be displayed here once the draft process begins after the first episode airs.
            </p>
          </div>
        ) : (
          rankedTribes.map((tribe) => (
            <div key={tribe.id} className="border-b border-t border-stone-700 px-2 py-3">
              <div className="flex items-center justify-start" onClick={() => toggleDropdown(tribe.id)}>
                {/* Emoji and Tribe Info */}
                <div className="flex items-center w-8 font-lostIsland text-2xl me-1.5">
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
                    <div className="text-lg font-lostIsland leading-tight">{tribe.tribeName}</div>
                    <div className="text-stone-400 font-lostIsland leading-tight">{tribe.playerName}</div>
                    {!tribe.paid && (<span className="inline-block font-lostIsland text-xs lowercase bg-red-900 text-red-300 px-2 py-0.5 -ms-0.5 rounded-full">Ineligible for Prizes</span>)}
                  </div>
                </div>
                {/* Score and Dropdown Toggle */}
                <div className="flex items-center ms-auto me-0">
                  <span className="text-2xl font-lostIsland tracking-wide mr-1.5">
                    {calculateScore(tribe)}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 stroke-3 cursor-pointer ${expandedTribes.includes(tribe.id) ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Dropdown with Contestants */}
              {expandedTribes.includes(tribe.id) && (
                <div className="px-3 mt-3 bg-stone-800 rounded-lg border border-stone-700">
                  {(() => {
                    const tribeIds = tribe.tribeArray;
                    if (!tribeIds || tribeIds.length === 0) return null;
                    
                    // Extract the sole survivor (always the first ID)
                    const soleSurvivorId = tribeIds[0];
                    const soleSurvivor = contestants.find((c) => c.id === soleSurvivorId);
                    
                    // Process remaining contestants: filter and sort (in-play first, then alphabetically)
                    const remainingContestants = tribeIds
                      .slice(1)
                      .map((id) => contestants.find((c) => c.id === id))
                      .filter((contestant): contestant is Contestant => Boolean(contestant));
                    
                    remainingContestants.sort((a, b) => {
                      if (a.inPlay === b.inPlay) {
                        return a.name.localeCompare(b.name);
                      }
                      return a.inPlay ? -1 : 1;
                    });
                    
                    // Combine sole survivor with the sorted remaining contestants.
                    const sortedContestants = soleSurvivor
                      ? [soleSurvivor, ...remainingContestants]
                      : remainingContestants;
                    
                    return sortedContestants.map((contestant, idx) => {
                      const statusBorder = getStatusBorder(contestant);
                      const isSoleSurvivorSlot = idx === 0;
                      
                      return (
                        <div
                          key={`${tribe.id}-${contestant.id}`}
                          className="flex items-center py-2 border-b border-stone-700"
                        >
                          <div className="relative">
                            <img
                              src={`/imgs/${contestant.img}.png`}
                              alt={contestant.name}
                              className={`h-14 w-14 object-cover me-2 border-2 rounded-full p-1 ${statusBorder}`}
                            />
                          </div>
                          <div className="flex-grow">
                            <div className="text-lg font-lostIsland leading-tight ps-0.5">
                              {contestant.name}
                            </div>
                            {isSoleSurvivorSlot && (
                              <span className="inline-block text-xs tracking-wider font-lostIsland uppercase px-1.5 pt-0.5 rounded-lg bg-yellow-900 text-yellow-300">
                                Predicted Winner
                              </span>
                            )}
                            <div className="flex items-center leading-tight">
                              {revealSpoilers ? (
                                <>
                                  {contestant.inPlay && (
                                    <>
                                      <FireIcon className="h-5 w-5 text-orange-400 me-1" />
                                      <div className="text-stone-300 lowercase font-lostIsland tracking-wider">
                                        In Play
                                      </div>
                                    </>
                                  )}
                                  {(!contestant.inPlay && contestant.voteOutOrder === 903) && (
                                    <>
                                      <TrophyIcon className="h-5 w-5 text-yellow-400 me-2" />
                                      <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                                        {formatVotedOutOrder(contestant.voteOutOrder)}
                                      </div>
                                    </>
                                  )}
                                  {(!contestant.inPlay && contestant.voteOutOrder === 902) && (
                                    <>
                                      <TrophyIcon className="h-5 w-5 text-zinc-400 me-2" />
                                      <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                                        {formatVotedOutOrder(contestant.voteOutOrder)}
                                      </div>
                                    </>
                                  )}
                                  {(!contestant.inPlay && contestant.voteOutOrder === 901) && (
                                    <>
                                      <TrophyIcon className="h-5 w-5 text-amber-600 me-2" />
                                      <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                                        {formatVotedOutOrder(contestant.voteOutOrder)}
                                      </div>
                                    </>
                                  )}
                                  {(!contestant.inPlay && contestant.voteOutOrder < 900) && (
                                    <>
                                      <FireIcon className="h-5 w-5 text-white opacity-60 me-1" />
                                      <div className="text-stone-400 lowercase font-lostIsland tracking-wider">
                                        {formatVotedOutOrder(contestant.voteOutOrder)}
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <div className="text-stone-400 lowercase font-lostIsland tracking-wider ps-1">
                                  Status Hidden
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xl font-lostIsland text-stone-300">
                            {revealSpoilers ? (contestant.points || 0) : '—'}
                          </div>
                          <IdentificationIcon
                            className="w-6 h-6 ms-3 cursor-pointer text-stone-400 hover:text-stone-200"
                            onClick={() => activateModal(contestant.id)}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Modal */}
        {modalVisible && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-3xl h-[92%] overflow-y-scroll bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland"
              onClick={(e) => e.stopPropagation()}
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
