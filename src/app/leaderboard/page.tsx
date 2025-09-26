'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChevronDownIcon, IdentificationIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

import { useSpoiler } from '../../context/SpoilerContext';
import ContestantProfile from '../components/ContestantProfile';

import type { Contestant, PlayerTribe, RankedPlayerTribe, Tribe } from '@/lib/types';
import { hexToRgba } from '@/lib/utils/color';
import { getStatusBorder } from '@/lib/utils/status';
import { formatVotedOutOrder } from '@/lib/utils/format';
import { rankAndScorePlayerTribes, type ScoredPlayerTribe } from '@/lib/utils/score';
import { useSeasonData } from '@/lib/hooks/useSeasonData';
import TribePickemSummary from '../components/TribePickemSummary';

// You may want to replace this with SWR or your own fetching logic if you want SSR/caching.
async function fetchPickemLeaderboard(season: string) {
  // This endpoint needs to be implemented in your API.
  const res = await fetch(`/api/pickem-leaderboard?season=${season}`);
  if (!res.ok) return [];
  return res.json();
}

export default function Leaderboard() {
  const [season, setSeason] = useState('49');
  const [expandedTribes, setExpandedTribes] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);
  const { revealSpoilers } = useSpoiler();

  const [leaderboardType, setLeaderboardType] = useState<'tribe' | 'pickem'>('tribe');
  const [pickemLeaderboard, setPickemLeaderboard] = useState<any[]>([]);
  const [pickemLoading, setPickemLoading] = useState(false);

  const [pickemTribeDetails, setPickemTribeDetails] = useState<any[]>([]);
  const [pickemTribeLoading, setPickemTribeLoading] = useState(false);

  const { playerTribes, contestants, tribes, loading } = useSeasonData(season);

  const WEEK_QUESTION_MATRIX = [
    { week: 2, numQuestions: 3 },
    //{ week: 3, numQuestions: 4 },
    // Add more weeks as needed
  ];

  async function fetchPickemTribeDetails(season: string) {
    const res = await fetch(`/api/pickem-tribe-details?season=${season}`);
    if (!res.ok) return [];
    return res.json();
  }

  useEffect(() => {
    if (leaderboardType === 'pickem' && Number(season) >= 49) {
      setPickemTribeLoading(true);
      fetchPickemTribeDetails(season)
        .then(data => setPickemTribeDetails(data))
        .finally(() => setPickemTribeLoading(false));
    }
  }, [leaderboardType, season]);

  useEffect(() => {
    if (Number(season) < 49 && leaderboardType === 'pickem') {
      setLeaderboardType('tribe');
    }
  }, [season, leaderboardType]);

  // Fetch pickem leaderboard when needed
  useMemo(() => {
    if (leaderboardType === 'pickem' && Number(season) >= 49) {
      setPickemLoading(true);
      fetchPickemLeaderboard(season)
        .then((data) => setPickemLeaderboard(data))
        .finally(() => setPickemLoading(false));
    }
  }, [leaderboardType, season]);

  const contestantMap = useMemo(
    () => contestants.reduce<Record<number, Contestant>>((acc, c) => { acc[c.id] = c; return acc; }, {}),
    [contestants]
  );

  const rankedTribes = useMemo(() => {
    return rankAndScorePlayerTribes(playerTribes, season, contestantMap);
  }, [playerTribes, season, contestantMap]) as Array<ScoredPlayerTribe & { rank: number }>;

  const toggleDropdown = (tribeId: number) =>
    setExpandedTribes((prev) => prev.includes(tribeId) ? prev.filter((id) => id !== tribeId) : [...prev, tribeId]);

  const closeModal = () => { setModalVisible(false); setFocusContestant(0); };
  const activateModal = (id: number) => { setFocusContestant(id); setModalVisible(true); };

  const pickemTribes = useMemo(() => {
    // Build a map for quick lookup of pickem scores by tribe id
    const pickemMap = new Map<number, any>();
    pickemLeaderboard.forEach((t: any) => {
      pickemMap.set(t.id, t);
    });

    // Always show all drafted tribes; attach pickemPoints if available, else 0
    const allTribes = playerTribes.map((tribe: any) => {
      const pickemData = pickemMap.get(tribe.id);
      return {
        ...tribe,
        pickemPoints: pickemData?.pickemPoints ?? 0,
        rank: 0 // We'll set rank below
      };
    });

    // Sort by pickemPoints descending, then assign rank
    allTribes.sort((a, b) => b.pickemPoints - a.pickemPoints);

    // Assign competition ranks
    let currentRank = 1;
    for (let i = 0; i < allTribes.length; i++) {
      if (i > 0 && allTribes[i].pickemPoints === allTribes[i - 1].pickemPoints) {
        allTribes[i].rank = allTribes[i - 1].rank;
      } else {
        allTribes[i].rank = currentRank;
      }
      currentRank = i + 2; // always pushes the "potential" rank forward
    }

    return allTribes;
  }, [playerTribes, pickemLeaderboard]);

  // Main leaderboard rendering function (tribe or pickem)
  function renderLeaderboard(data: any[], isPickem: boolean) {
    if (loading || (isPickem && pickemLoading)) {
      return (
        <div className="flex flex-col justify-center items-center py-10">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
          <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
        </div>
      );
    }

    if (!data.length) {
      return (
        <div className="flex flex-col justify-center items-center py-10 px-4 text-center leading-tight">
          <p className="font-lostIsland text-lg my-2 tracking-wider">No tribes have been drafted for this season yet.</p>
          <p className="font-lostIsland text-lg my-2 tracking-wider">Tribe rosters will be displayed here once the draft process begins after the first episode airs.</p>
        </div>
      );
    }

    return data.map((tribe: any) => {
      // For pickem leaderboard, use pickemPoints instead of score
      const score = isPickem ? tribe.pickemPoints : tribe.score;
      const hasWinnerBonus = !isPickem && !!contestantMap[tribe.tribeArray?.[0]]?.soleSurvivor;
      return (
        <div key={tribe.id} className="py-2 px-1 mb-2 rounded-lg border border-stone-700 bg-stone-800">
          <div className="flex items-center justify-start" onClick={() => toggleDropdown(tribe.id)}>
            <div className="flex items-center w-8 font-lostIsland text-2xl me-1.5">
              <span className="mx-auto">{tribe.rank}</span>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-3xl" style={{ backgroundColor: hexToRgba(tribe.color, 0.95) }}>
                {tribe.emoji}
              </div>
              <div className="ms-3">
                <div className="text-lg font-lostIsland leading-tight">{tribe.tribeName}</div>
                <div className="text-stone-400 font-lostIsland leading-tight">{tribe.playerName}</div>
                {/* Only show winner bonus on standard leaderboard */}
                {revealSpoilers && hasWinnerBonus && (
                  <div className="lowercase bg-yellow-900 text-yellow-300 text-xs font-lostIsland px-2 py-0.5 -ms-1 rounded-full">
                    Predicted Winner Bonus +200
                  </div>
                )}
                {!tribe.paid && (
                  <span className="inline-block font-lostIsland text-xs lowercase bg-red-900 text-red-300 px-2 py-0.5 -ms-0.5 rounded-full">
                    Ineligible for Prizes
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center ms-auto me-0">
              <span className="text-2xl font-lostIsland tracking-wide mr-1.5">
                {score}
              </span>
              <ChevronDownIcon className={`w-4 h-4 stroke-3 cursor-pointer ${expandedTribes.includes(tribe.id) ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Expanded dropdown */}
          {expandedTribes.includes(tribe.id) && (
            <div className="px-2 mt-3">
              {isPickem ? (
                (() => {
                  const tribeDetails = pickemTribeDetails.find(t => t.id === tribe.id);
                  return (
                    <TribePickemSummary
                      pickemWeeks={tribeDetails?.pickemWeeks ?? []}
                      weekQuestionMatrix={WEEK_QUESTION_MATRIX}
                    />
                  );
                })()
              ) : (() => {
                const ids = tribe.tribeArray;
                if (!ids?.length) return null;

                const soleSurvivor = contestants.find((c) => c.id === ids[0]);
                const rest = ids.slice(1)
                  .map((id: number) => contestants.find((c) => c && c.id === id))
                  .filter((c: Contestant | undefined): c is Contestant => !!c)
                  .sort((a: Contestant, b: Contestant) => (a.inPlay === b.inPlay ? a.name.localeCompare(b.name) : a.inPlay ? -1 : 1));

                const list = soleSurvivor ? [soleSurvivor, ...rest] : rest;

                return list.map((contestant: Contestant, idx: number) => {
                  const statusBorder = getStatusBorder(contestant, revealSpoilers);
                  const isSoleSlot = idx === 0;

                  return (
                    <div key={`${tribe.id}-${contestant.id}`} className="flex items-center py-2 border-b border-stone-700">
                      <div className="relative">
                        <img
                          src={`/imgs/${contestant.img}.png`}
                          alt={contestant.name}
                          className={`h-14 w-14 object-cover me-2 border-2 rounded-full p-1 ${statusBorder}`}
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="text-lg font-lostIsland leading-tight ps-0.5">{contestant.name}</div>
                        {isSoleSlot && (
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
                                  <div className="text-stone-300 lowercase font-lostIsland tracking-wider">In Play</div>
                                </>
                              )}
                              {!contestant.inPlay && (
                                <>
                                  {contestant.voteOutOrder >= 900 ? (
                                    <>
                                      <TrophyIcon
                                        className={`h-5 w-5 me-2 ${
                                          contestant.voteOutOrder === 903 ? 'text-yellow-400'
                                          : contestant.voteOutOrder === 902 ? 'text-zinc-400'
                                          : 'text-amber-600'
                                        }`}
                                      />
                                      <div className="text-stone-200 lowercase font-lostIsland tracking-wider mt-1">
                                        {formatVotedOutOrder(contestant.voteOutOrder)}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <FireIcon className="h-5 w-5 text-white opacity-60 me-1" />
                                      <div className="text-stone-400 lowercase font-lostIsland tracking-wider">
                                        {formatVotedOutOrder(contestant.voteOutOrder)}
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <div className="text-stone-400 lowercase font-lostIsland tracking-wider ps-1">Status Hidden</div>
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
      );
    });
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        <div className="z-0">
          <Image src="/imgs/graphics/home-graphic.png" alt="Survivor Background" fill style={{ objectFit: 'cover' }} />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{ backgroundImage: "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)" }}
          />
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Leaderboard
        </h1>
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image src={`/imgs/${season}/logo.png`} alt={`Survivor Season ${season} Logo`} width={250} height={250} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="lowercase text-stone-200 border-y border-stone-500 p-4 my-8 font-lostIsland tracking-wider">
          <h2 className="font-lostIsland text-3xl lowercase mb-2">
            {leaderboardType === 'tribe'
              ? "Tribe Leaderboard"
              : "Pick Em Leaderboard"
            }
          </h2>
          <p className="font-lostIsland lowercase mb-3 text-stone-300/90 leading-tight">
            {leaderboardType === 'tribe'
              ? "Click a tribe to expand their lineup and see contestant points."
              : "Click a tribe to expand their picks and see weekly points."
            }
          </p>
          <p className="font-lostIsland lowercase mb-3 text-stone-300/90 leading-tight">
            {leaderboardType === 'tribe'
              ? "Rankings are based on total points earned by each tribe."
              : "Pick Em Rankings are based on total pick em points for each tribe this season."
            }
          </p>
          <p className="font-lostIsland lowercase mb-3 text-stone-300/90 leading-tight">
            {leaderboardType === 'tribe'
              ? <>Tap the <IdentificationIcon className="inline mx-1.5 w-5 h-5 stroke-2 text-stone-300" /> icon to view detailed contestant stats.</>
              : <>Make your weekly picks <a href="/pick-em" className="text-blue-400 underline">here</a>.</>
            }
          </p>
          {season === '47' && (
            <p className="mt-3 text-orange-300">
              Season 47 was scored using a different set of rules than the current season. The three contestants in a tribe represent that tribe's top 3 picks from Season 47.
            </p>
          )}
        </div>

        <div className="flex justify-between mb-8 px-4">
          <div className="font-lostIsland tracking-wider">
            <select
              id="season"
              className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="49">Season 49</option>
              <option value="48">Season 48</option>
              <option value="47">Season 47</option>
            </select>
          </div>
        </div>


        {Number(season) >= 49 && (
          <div className="flex items-center overflow-hidden tracking-wider mb-6 w-fit mx-auto rounded-xl justify-center font-lostIsland uppercase ">
            <button
              className={`w-32 px-4 py-2 ${
                leaderboardType === 'tribe' ? 'bg-orange-500/90 text-white' : 'bg-stone-800 text-stone-300'
              }`}
              onClick={() => setLeaderboardType('tribe')}
            >
              TRIBES
            </button>
            <button
              className={`w-32 px-4 py-2 ${
                leaderboardType === 'pickem' ? 'bg-blue-500/90 text-white' : 'bg-stone-800 text-stone-300'
              }`}
              onClick={() => setLeaderboardType('pickem')}
            >
              PICK EM
            </button>
          </div>
        )}

        

        <div className="px-2">
          {leaderboardType === 'tribe'
            ? renderLeaderboard(rankedTribes, false)
            : renderLeaderboard(pickemTribes, true)
          }
        </div>

        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50" onClick={closeModal}>
            <div className="w-full max-w-3xl h-[92%] overflow-y-scroll bg-stone-800 rounded-t-xl shadow-lg animate-slide-up relative font-lostIsland" onClick={(e) => e.stopPropagation()}>
              <button className="text-stone-400 hover:text-stone-200 absolute top-3 right-4" onClick={closeModal}>✕</button>
              <ContestantProfile contestantId={focusContestant} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}