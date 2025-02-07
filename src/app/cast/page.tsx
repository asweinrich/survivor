'use client';

import { useState, useEffect } from 'react';
import { TrophyIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import ContestantProfile from '../components/ContestantProfile';
import Image from "next/image";



type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  inPlay: boolean;
  img: string; // This should match the field in your database
  voteOutOrder: number;
  points: number;
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};


export default function Contestants() {
  const [season, setSeason] = useState('48'); // Default season
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [focusContestant, setFocusContestant] = useState(0);
  const [loading, setLoading] = useState(false); // New loading state

  // Fetch contestants when the season changes
  useEffect(() => {
    setLoading(true); // Start loading when fetching begins

    async function fetchData() {
      // Fetch contestants (which now include points)
      const res = await fetch(`/api/cast/${season}`);
      const data = await res.json();
      setContestants(data);

      // Fetch tribes data
      const tribesRes = await fetch(`/api/show-tribes/${season}`);
      const tribesData = await tribesRes.json();
      setTribes(tribesData);

      setLoading(false);
    }

    fetchData();

  }, [season]);

  useEffect(() => {
    if (modalVisible) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalVisible]);


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
          className="inline-block p-1.5 tracking-wider leading-none rounded-full me-1 lowercase font-lostIsland"
          style={{
            backgroundColor: hexToRgba(tribe.color, 0.2), // Transparent background
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

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setFocusContestant(0);
  };

  // Function to close the modal
  const activateModal = (id: number) => {
    setFocusContestant(id);
    setModalVisible(true);
  };

  function borderColor(status: number): string {
    if(status === 903) { 
      return 'border-yellow-400'
    } else if(status === 902) { 
      return 'border-zinc-400'
    } else if(status === 901) { 
      return 'border-amber-600'
    } else if(status === null) { 
      return 'border-green-400'
    } 
    return 'border-red-500'
    
  }


  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png" // Replace with your background image path
            alt="Survivor Background"
            fill
            style={{ objectFit: 'cover' }} 
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
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">Cast Rankings</h1>
  
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
            <option value={'47'}>Season 47</option>
            
            {/* Add more seasons as needed */}
          </select>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
            <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
          </div>
        ) : (
          contestants.map((contestant) => (
            <div
              key={contestant.id}
              className="flex flex-row w-full items-center p-2 border-b border-t border-stone-700"
              style={{ opacity: contestant.inPlay ? 1 : 1 }}
            >
              {/* Image */}
              <div className="flex items-center justify-center w-20 overflow-hidden ms-1.5 me-3">
                <img
                  src={`/imgs/${contestant.img}.png`}
                  alt={contestant.name}
                  className={`h-20 w-20 object-cover rounded-full border-2 ${borderColor(contestant.voteOutOrder)} p-1`}
                />
              </div>

              {/* Survivor Name and Info */}
              <div className="flex flex-col flex-grow">
                <div className="flex flex-row items-center">
                  <span className="text-lg uppercase font-lostIsland tracking-wider">{contestant.name}</span>
                </div>
                <div className="flex flex-row items-center my-0.5">
                  <span className="">{formatTribeBadges(contestant.tribes)}</span>
                </div>
                <div className="flex items-center">
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

              {/* Score */}
              {/* Score - now using contestant.points directly */}
              <div className="flex flex-col items-center justify-center w-20">
                <span className="text-3xl font-lostIsland text-white tracking-widest">
                  {contestant.points ?? '--'}
                </span>
                <IdentificationIcon
                  className="w-5 h-5 stroke-2 mt-1 text-stone-300 hover:cursor-pointer"
                  onClick={() => activateModal(contestant.id)}
                />
              </div>
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