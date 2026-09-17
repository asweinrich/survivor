'use client';

import { useMemo, useState } from 'react';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { useSeason } from '../../context/SeasonContext';
import ContestantProfile from '../components/ContestantProfile';

import type { Contestant, Tribe } from '@/lib/types';
import { getStatusBorder } from '@/lib/utils/status';
import { formatVotedOutOrder } from '@/lib/utils/format';
import { useSeasonData } from '@/lib/hooks/useSeasonData';
import { sortContestants } from '@/lib/utils/cast';              // NEW: centralized sort
import { TribeBadges } from '@/lib/utils/tribes';                // badge helper
import { PastSeasonBadges } from '@/lib/utils/pastSeasons';      // badge helper

export default function CastPage() {
  const { season } = useSeason();
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const revealSpoilers = true;

  const { contestants, tribes, loading } = useSeasonData(season);

  const visibleContestants = useMemo(
    () => sortContestants(contestants, season, revealSpoilers),
    [contestants, season, revealSpoilers]
  );

  const activateModal = (id: number) => { setFocusContestant(id); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setFocusContestant(0); };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="max-w-6xl mx-auto">
        {/* Title + help toggle row */}
        <div className="border-b border-stone-500 font-lostIsland tracking-wider">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-stone-100 font-survivor tracking-wider">
              Cast Rankings
            </h1>
            <button
              type="button"
              onClick={() => setHelpOpen((v) => !v)}
              aria-expanded={helpOpen}
              className="flex items-center gap-1.5 text-stone-300 lowercase text-sm shrink-0"
            >
              <span>How this page works</span>
              <ChevronDownIcon
                className={`w-4 h-4 stroke-2 transition-transform ${helpOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {helpOpen && (
            <div className="lowercase text-stone-200 px-4 pb-4">
              <p className="mb-3">
                Contestants are grouped by their tribe and in-play status and sorted by vote out order
              </p>
              <p className="">
                Tap a contestant to view their full profile and stats
              </p>
              {season === '47' && (
                <p className="mt-3 text-orange-300">
                  The scores displayed for the Season 47 cast did not impact the fantasy results. They are listed here for posterity.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Season selector removed — now controlled from the site-wide nav */}

        <div className="px-2 mt-8">
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

                <div className="flex flex-row items-center my-0.5 -mx-1">
                  <TribeBadges tribeIds={contestant.tribes} tribes={tribes as Tribe[]} />
                </div>
                

                {/* Status line */}
                <div className="flex items-center text-sm">
                  {revealSpoilers ? (
                    <>
                      {contestant.inPlay ? (
                        <>
                          <FireIcon className="h-5 w-5 text-orange-400 me-1" />
                          <div className="text-stone-300 uppercase pt-0.5 font-lostIsland tracking-wider">
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
                              <div className="text-stone-200 uppercase pt-0.5 font-lostIsland tracking-wider mt-1">
                                {formatVotedOutOrder(contestant.voteOutOrder)}
                              </div>
                            </>
                          ) : (
                            <>
                              <FireIcon className="h-5 w-5 text-white opacity-60 me-1" />
                              <div className="text-stone-400 uppercase pt-0.5 font-lostIsland tracking-wider">
                                {formatVotedOutOrder(contestant.voteOutOrder)}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-stone-400 uppercase pt-0.5 font-lostIsland tracking-wider ps-1">
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