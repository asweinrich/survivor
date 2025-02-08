'use client';

import { useState, useEffect } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import Image from "next/image";
import tinycolor from "tinycolor2";
import { ArrowPathIcon, TrophyIcon } from '@heroicons/react/24/solid';

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  profession: string;
  img: string;
};

type Tribe = {
  id: number;
  tribeName: string;
  color: string;
  emoji: string;
  contestants: Contestant[];
  playerName: string;
};

type ShowTribe = {
  id: number;
  name: string;
  color: string;
};

export default function YourTribePage() {
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [tribes, setTribes] = useState<ShowTribe[]>([]);
  const [mounted, setMounted] = useState(false);
  const { width, height } = useWindowSize();
  const [tribeColor, setTribeColor] = useState('#77c471');
  const [loading, setLoading] = useState(true);
  const [recycleConfetti, setRecycleConfetti] = useState(true);

  const season = 48;


  // Fetch tribe data from the API
  useEffect(() => {
    async function fetchTribeData() {
      setLoading(true);
      const tribeId = window.location.pathname.split('/').pop(); // Get tribe_id from URL
      try {
        const response = await fetch(`/api/get-player-tribe/${tribeId}`);
        if (response.ok) {
          const data = await response.json();
          setTribe(data[0]); // Assuming the API response is an array with one tribe
          setTribeColor(data[0].color);
        } else {
          console.error('Failed to fetch tribe data');
        }
      } catch (error) {
        console.error('Error fetching tribe data:', error);
      }
      setLoading(false);
    }

    async function fetchTribes() {
      const res = await fetch(`/api/show-tribes/${season}`);
      const data = await res.json();
      setTribes(data);
    }
    
    setTimeout(() => {
      setRecycleConfetti(false); // Stop confetti after 2 seconds
    }, 4000);

    fetchTribeData();
    fetchTribes();
    setMounted(true);
  }, []);

  function getFirstName(fullName: string): string {
    return fullName.trim().split(' ')[0];
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
            backgroundColor: hexToRgba(tribe.color, 0.2),
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

  
  return (
    <div className="flex flex-col items-center text-white w-full mx-0 px-0 min-h-screen overflow-x-hidden">
      {/* Show Loading Spinner Until Data is Fully Loaded */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
          <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">
            Loading...
          </p>
        </div>
      ) : (
        <>
          {mounted && tribeColor && (
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
              <Confetti
                width={width}
                height={height}
                colors={[tribeColor, "#fc8c03", "#2bcc3e", "#ab2fed", tribeColor]}
                recycle={recycleConfetti}
                numberOfPieces={300}
                wind={0.01}
                gravity={0.075}
                drawShape={(ctx: CanvasRenderingContext2D) => {
                  ctx.beginPath();
                  const rectWidth = 18; // Width of the rectangle
                  const rectHeight = 9; // Height of the rectangle
                  ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
                  ctx.fill();
                  ctx.closePath();
                }}
              />
            </div>
          )}

          {tribe && (
            <>
              {/* Tribe Header */}
              <div
                className="flex flex-row w-full items-center justify-start py-2 px-4 border-y-4 border-stone-800"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${tribeColor}, ${tinycolor(
                    tribeColor
                  )
                    .darken(20)
                    .toString()})`,
                }}
                id="tribe"
              >
                <span className="text-4xl me-4">{tribe.emoji}</span>
                <div className="flex flex-col">
                  <h2
                    className="text-3xl font-lostIsland text-stone-100 mb-1"
                    style={{ textShadow: "2px 2px 1px rgba(0, 0, 0, 1)" }}
                  >
                    {tribe.tribeName}
                  </h2>
                  <span
                    className="text-xl font-lostIsland text-stone-200 leading-none mb-1"
                    style={{ textShadow: "2px 2px 1px rgba(0, 0, 0, 1)" }}
                  >
                    {tribe.playerName}
                  </span>
                </div>
              </div>

              {/* Contestants */}
              <div className="relative flex justify-center items-end max-w-6xl w-full z-20 overflow-visible">
                {tribe.contestants.length > 0 && (
                  (() => {
                    // Use the ordered array of IDs (via tribeArray) if available; otherwise, default to tribe.contestants.
                    let orderedContestants: Contestant[] = [];
                    if ("tribeArray" in tribe && Array.isArray((tribe as any).tribeArray)) {
                      const order: number[] = (tribe as any).tribeArray;
                      orderedContestants = order
                        .map(id => tribe.contestants.find(c => c.id === id))
                        .filter((c): c is Contestant => Boolean(c));
                    } else {
                      orderedContestants = tribe.contestants;
                    }

                    // Reorder so that the sole survivor (the first element) is displayed in the center (index 2)
                    let displayContestants: Contestant[] = [];
                    if (orderedContestants.length === 6) {
                      const temp = [...orderedContestants];
                      const soleSurvivor = temp.shift(); // Remove the first element
                      if (soleSurvivor) {
                        temp.splice(2, 0, soleSurvivor); // Insert at index 2 (center)
                      }
                      displayContestants = temp;
                    } else {
                      displayContestants = orderedContestants;
                    }

                    // Define positions for proper spacing (preserving your original alignment)
                    const positions = [
                      "-translate-x-[155px] z-20 scale-85 space-y-11", // Far left
                      "-translate-x-[95px] z-30 scale-90 space-y-11",    // Left
                      "-translate-x-[28px] -translate-y-[30px] z-40 scale-85", // Center (sole survivor)
                      "translate-x-[40px] z-30 scale-90 space-y-11",      // Right
                      "translate-x-[100px] z-20 scale-85 space-y-11",     // Mid-right
                      "translate-x-[155px] z-10 scale-75 space-y-14",     // Far right
                    ];

                    return (
                      <div className="relative flex justify-center items-end w-full h-[25rem] pt-12 overflow-hidden">
                        <img 
                          className="absolute w-full -top-6 h-96"
                          src="/imgs/graphics/tropical-graphic.png"
                          style={{
                              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0) 100%)",
                              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0) 100%)"
                            }}
                            alt="Tropical Graphic"                        />
                        {displayContestants.map((contestant, index) => {
                          // For each contestant, determine the primary show tribe from the contestant's tribes array
                          const primaryTribe = contestant.tribes && contestant.tribes.length > 0 
                            ? tribes.find(t => t.id === contestant.tribes[0])
                            : null;

                          return (
                            <div
                              key={contestant.id}
                              className={`absolute top-12 flex flex-col items-center ${positions[index]}`}
                            >
                              <img
                                src={`/imgs/48/full-body/${contestant.name}.png`}
                                alt={contestant.name}
                                className={`object-contain ${
                                  index === 2
                                    ? "h-[20rem] drop-shadow-[-2px_0px_18px_rgba(255,223,0,1)]"
                                    : "h-[16rem] drop-shadow-[1px_2px_3px_rgba(0,0,0,1)]"
                                }`}
                              />
                              <div 
                                className="relative text-center border-y-4 border-2 border-stone-900 mt-4 px-1.5 py-1 font-lostIsland tracking-wide"
                                style={{
                                  textShadow: "1px 1px 1px rgba(0, 0, 0, 1)",
                                  backgroundImage: primaryTribe
                                    ? `linear-gradient(to bottom right, ${tinycolor(primaryTribe.color).darken(8).toString()}, ${tinycolor(primaryTribe.color).darken(20).toString()})`
                                    : `linear-gradient(to bottom right, #F59E0B, ${tinycolor("#F59E0B").darken(20).toString()})`

                                }}
                              >
                                {index === 2 && (
                                  <TrophyIcon 
                                    className="absolute -top-3.5 -right-1.5 w-6 h-6 text-yellow-400 drop-shadow-custom" 
                                    
                                  />
                                )}
                                <p
                                  className={`min-w-14 text-sm uppercase ${
                                    index === 2 ? "!text-lg" : ""
                                  }`}
                                  style={{
                                    textShadow: "1px 1px 0px rgba(0, 0, 0, 1)",
                                  }}
                                >
                                  {getFirstName(contestant.name)}
                                  
                                </p>
                              </div>
                              {index === 2 && (
                                <p className="text-xs text-yellow-400 font-lostIsland tracking-wider uppercase max-w-18 wrap text-center leading-none mt-1">Sole Survivor</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Help Text */}
              <div className="text-center p-4 font-lostIsland tracking-wide">
                <p className="italic text-3xl mb-4 pe-2">And this challenge is on!</p>
                <p className="text-lg mb-8">Your tribe is chosen. Now, let the game begin.</p>
                <p className="leading-tight border-t border-stone-300 pt-8">Good luck this season and don't forget to&nbsp;
                  <a className="underline text-orange-400 hover:text-orange-600" target="_blank" href={"https://venmo.com/Andrew-Weinrich?txn=pay&amount=20.00&note="+tribe.tribeName}>
                    pay Your $20 Entry Fee on Venmo!
                  </a>
                </p>
                <p className="my-4 leading-tight">Tribe entry fees are due before the 2nd episode airs on March 5, 2025.</p>
              </div>

            </>
          )}
        </>
      )}
    </div>
  );


}
