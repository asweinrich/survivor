'use client';

import { useMemo, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

import { useSpoiler } from '../../context/SpoilerContext';
import ContestantProfile from '../components/ContestantProfile';

import type { Contestant, Tribe } from '@/lib/types';
import { getStatusBorder } from '@/lib/utils/status';
import { formatVotedOutOrder } from '@/lib/utils/format';
import { useSeasonData } from '@/lib/hooks/useSeasonData';
import { sortContestants } from '@/lib/utils/cast';              // NEW: centralized sort
import { TribeBadges } from '@/lib/utils/tribes';                // badge helper
import { PastSeasonBadges } from '@/lib/utils/pastSeasons';      // badge helper

export default function CastPage() {
  const [season, setSeason] = useState('48');
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);
  const { revealSpoilers } = useSpoiler();

  const { contestants, tribes, loading } = useSeasonData(season);

  const visibleContestants = useMemo(
    () => sortContestants(contestants, season, revealSpoilers),
    [contestants, season, revealSpoilers]
  );

  const activateModal = (id: number) => { setFocusContestant(id); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setFocusContestant(0); };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      {/* Header/Hero (kept as your original text/title layout) */}
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        <div className="z-0">
          <Image src="/imgs/graphics/home-graphic.png" alt="Survivor Background" fill style={{ objectFit: 'cover' }} />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{ backgroundImage: "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)" }}
          />
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Cast Rankings
        </h1>
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image src={`/imgs/${season}/logo.png`} alt={`Survivor Season ${season} Logo`} width={250} height={250} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Original blurb/instructions preserved */}
        <div className="lowercase text-stone-200 border-y border-stone-500 p-4 my-8 font-lostIsland tracking-wider">
          <p className="mb-3">
            Contestants are sorted by their in-play status and vote out order
          </p>
          <p className="">
            Tap a contestant to view their full profile and stats
          </p>
          { season === '47' && 
            <p className="mt-3 text-orange-300">
              The scores displayed for the Season 47 cast did not impact the fantasy results. They are listed here for posterity.
            </p>
          }
        </div>

        {/* Season selector (unchanged) */}
        <div className="flex justify-between mb-8 px-4">
          <div className="font-lostIsland tracking-wider">
            <select
              id="season"
              className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="50">Season 50</option>
              <option value="48">Season 48</option>
              <option value="47">Season 47</option>
            </select>
          </div>
        </div>

        <div className="px-2">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
            <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
          </div>
        ) : (
          visibleContestants.map((contestant: Contestant) => (
            <div
              key={contestant.id}
              className="flex flex-row w-full items-center justify-around py-2 px-1 mb-2 rounded-lg border border-stone-700 bg-stone-800"
              onClick={() => activateModal(contestant.id)}
            >
              {/* Image */}
              <div className="flex items-center justify-center w-20 overflow-hidden ms-1 me-3">
                <img
                  src={`/imgs/${contestant.img}.png`}
                  alt={contestant.name}
                  className={`h-20 w-20 object-cover rounded-full border-2 p-1 ${
                    getStatusBorder(contestant, revealSpoilers) /* grey when hidden, color when revealed */
                  }`}
                />
              </div>

              {/* Name + badges + status */}
              <div className="flex flex-col flex-grow max-w-48">
                <div className="flex flex-row items-center">
                  <span className="text-lg uppercase font-lostIsland tracking-wider leading-tight mb-1">
                    {contestant.name}
                  </span>
                </div>

                {/* Show Past Season badges for S50, otherwise show tribe badges */}
                {Number(season) === 50 && contestant.pastSeasons ? (
                  <div className="flex gap-1 items-start my-0.5 -mx-1">
                    <PastSeasonBadges pastSeasons={contestant.pastSeasons} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center my-0.5 -mx-1">
                    <TribeBadges tribeIds={contestant.tribes} tribes={tribes as Tribe[]} />
                  </div>
                )}

                {/* Status line */}
                <div className="flex items-center text-sm">
                  {revealSpoilers ? (
                    <>
                      {contestant.inPlay ? (
                        <>
                          <FireIcon className="h-5 w-5 text-orange-400 me-1" />
                          <div className="text-stone-300 lowercase font-lostIsland tracking-wider">
                            In Play
                          </div>
                        </>
                      ) : (
                        <>
                          {contestant.voteOutOrder >= 900 ? (
                            <>
                              <TrophyIcon
                                className={`h-5 w-5 me-2 ${
                                  contestant.voteOutOrder === 903
                                    ? 'text-yellow-400'
                                    : contestant.voteOutOrder === 902
                                    ? 'text-zinc-400'
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
                    <div className="text-stone-400 lowercase font-lostIsland tracking-wider ps-1">
                      Status Hidden
                    </div>
                  )}
                </div>
              </div>

              {/* Points (hidden when spoilers are hidden) */}
              <div className="flex flex-col items-center justify-center w-20">
                <span className="text-3xl font-lostIsland text-white tracking-widest">
                  {revealSpoilers ? (contestant.points ?? '--') : '—'}
                </span>
              </div>
            </div>
          ))
        )}
        </div>

        {/* Modal */}
        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50" onClick={closeModal}>
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
