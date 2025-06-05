"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getSession } from "next-auth/react";
import { IdentificationIcon, ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { FireIcon, TrophyIcon } from "@heroicons/react/24/solid";
import ContestantProfile from "../components/ContestantProfile";
import Image from "next/image";
import season47Scores from "../scoring/47scores.json";
import UserHeader from "../components/UserHeader";
import { useSpoiler } from "../../context/SpoilerContext"; 
import { redirect } from "next/navigation";


const SEASONS = [48, 47];

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  inPlay: boolean;
  img: string;
  voteOutOrder: number;
  points: number;
  soleSurvivor: boolean;
};

export default function DashboardPage() {

  

  const [playerTribes, setPlayerTribes] = useState<any[]>([]);
  const [contestants, setContestants] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [seasonRanks, setSeasonRanks] = useState<any[]>([]);
  const [focusContestant, setFocusContestant] = useState(0);
  const [expandedTribes, setExpandedTribes] = useState<number[]>([]);
  const { revealSpoilers } = useSpoiler();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const session = await getSession();
      if (!session) {
        redirect("/sign-in");
      }
      const email = session?.user?.email || "";
      setUserEmail(email);

      let allTribes: any[] = [];
      let allContestants: any[] = [];

      for (const season of SEASONS) {
        const [tribesRes, castRes] = await Promise.all([
          fetch(`/api/player-tribes/${season}`),
          fetch(`/api/cast/${season}`)
        ]);

        const seasonTribes = await tribesRes.json();
        const seasonCast = await castRes.json();

        allTribes.push(...seasonTribes.map((tribe: any) => ({ ...tribe, season })));
        allContestants.push(...seasonCast);
      }

      setPlayerTribes(allTribes);
      setContestants(allContestants);
      setLoading(false);
    }
    fetchData();
  }, []);

  const contestantMap = useMemo(() => {
    return contestants.reduce((map: any, c: any) => {
      map[c.id] = c;
      return map;
    }, {});
  }, [contestants]);

  const calculateScore = useCallback((tribe: any): number => {
    if (tribe.season === 47) {
      return tribe.pastScore || 0;
    }

    const baseScore = tribe.tribeArray.reduce((total: number, id: number) => {
      const contestant = contestantMap[id];
      return total + (contestant?.points || 0);
    }, 0);
    const predictedWinnerId = tribe.tribeArray[0];
    const predictedWinner = contestantMap[predictedWinnerId];
    const bonus = predictedWinner?.soleSurvivor ? 200 : 0;
    return baseScore + bonus;
  }, [contestantMap]);

  const getStatusBorder = (contestant: any): string => {
    if (!revealSpoilers) return "border-gray-400";
    if (!contestant.inPlay && contestant.voteOutOrder) {
      if (contestant.voteOutOrder === 903) return "border-yellow-400";
      if (contestant.voteOutOrder === 902) return "border-zinc-400";
      if (contestant.voteOutOrder === 901) return "border-amber-600";
    }
    return contestant.inPlay ? "border-green-400" : "border-red-500";
  };

  const toggleDropdown = (id: number) => {
    setExpandedTribes(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const activateModal = (id: number) => {
    setFocusContestant(id);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

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

  const { rankedTribes, sortedUserTribes } = useMemo(() => {
    const ranked: any[] = [];

    for (const season of SEASONS) {
      const seasonTribes = playerTribes
        .filter((tribe) => tribe.season === season)
        .map((tribe) => ({ ...tribe, score: calculateScore(tribe) }))
        .sort((a, b) => b.score - a.score)
        .map((tribe, index, arr) => ({
          ...tribe,
          rank: index + 1,
          total: arr.length,
        }));

      ranked.push(...seasonTribes);
    }

    const sortedUserTribes = ranked
      .filter((tribe) => tribe.playerEmail === userEmail)
      .sort((a, b) => b.season - a.season);

    return { rankedTribes: ranked, sortedUserTribes };
  }, [playerTribes, calculateScore, userEmail]);







  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="max-w-6xl mx-auto">
        <UserHeader
          userEmail={userEmail ?? ""}
          tribeCount={sortedUserTribes.length}
        />

        <h1 className="text-2xl font-lostIsland uppercase mb-2 px-4">Your Tribes</h1>
          

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
            <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
          </div>
        ) : (
          sortedUserTribes.map((tribe) => (
            <div key={tribe.id} className="border-b border-t border-stone-700 px-2 py-3">
              <div className="flex items-center justify-start" onClick={() => toggleDropdown(tribe.id)}>
                <div className="w-12 h-12 mx-2 rounded-full border border-stone-700 flex items-center justify-center text-3xl" style={{ backgroundColor: tribe.color }}>
                  {tribe.emoji}
                </div>
                <div className="ms-3">
                  <div className="text-xl font-lostIsland mb-1">{tribe.tribeName}</div>
                  <div>
                    <div className="inline font-lostIsland leading-none me-2">Season {tribe.season}</div>
                    {!tribe.paid ? (<span className="inline-block font-lostIsland text-sm lowercase bg-red-900 text-red-300 px-2 py-0.5 -ms-0.5 me-2 rounded-full">Not Paid - Ineligible for Prizes</span>) : (<span className="inline-block font-lostIsland text-sm lowercase bg-green-900 me-2 text-green-300 px-2 py-0.5 -ms-0.5 rounded-full">Paid</span>)}
                  </div>
                  <div className="text-stone-300 font-lostIsland lowercase ">{getOrdinalSuffix(tribe.rank)} out of {tribe.total}</div>
                  
                  {revealSpoilers && (() => {
                    const predictedWinnerId = tribe.tribeArray[0];
                    const predictedWinner = contestantMap[predictedWinnerId];
                    if (predictedWinner?.soleSurvivor) {
                      return (
                        <div className="lowercase inline-block bg-yellow-900 text-yellow-300 text-xs font-lostIsland px-2 py-0.5 -ms-1 rounded-full">
                          Predicted Winner Bonus +200
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                </div>
                <div className="flex items-center ms-auto me-0">
                  <span className="text-2xl font-lostIsland tracking-wide mr-1.5">
                    {calculateScore(tribe)}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 stroke-3 cursor-pointer ${expandedTribes.includes(tribe.id) ? 'rotate-180' : ''}`} />
                </div>
              </div>
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
                      .map((id: number) => contestants.find((c) => c.id === id))
                      .filter((contestant: Contestant): contestant is Contestant => Boolean(contestant));
                    
                    remainingContestants.sort((a: Contestant, b: Contestant) => {
                      if (a.inPlay === b.inPlay) {
                        return a.name.localeCompare(b.name);
                      }
                      return a.inPlay ? -1 : 1;
                    });
                    
                    // Combine sole survivor with the sorted remaining contestants.
                    const sortedContestants = soleSurvivor
                      ? [soleSurvivor, ...remainingContestants]
                      : remainingContestants;
                    
                    return sortedContestants.map((contestant: Contestant, idx) => {
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
