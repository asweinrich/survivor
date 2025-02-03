'use client';

import { useState, useEffect } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import Image from "next/image";
import tinycolor from "tinycolor2";
import { ArrowPathIcon } from '@heroicons/react/24/solid';

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
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

export default function YourTribePage() {
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [mounted, setMounted] = useState(false);
  const { width, height } = useWindowSize();
  const [tribeColor, setTribeColor] = useState('#77c471');
  const [loading, setLoading] = useState(true);
  const [recycleConfetti, setRecycleConfetti] = useState(true);

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

    setTimeout(() => {
      setRecycleConfetti(false); // Stop confetti after 2 seconds
    }, 4000);

    fetchTribeData();
    setMounted(true);
  }, []);

  

  return (
    <div className="flex flex-col items-center text-white w-full mx-0 px-0 min-h-screen overflow-x-hidden">
      

      {/* Show Loading Spinner Until Data is Fully Loaded */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
          <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">Loading...</p>
        </div>
      ) : (
        <>
        {mounted && tribeColor && (
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
            <Confetti
              width={width}
              height={height}
              colors={[tribeColor, '#fc8c03', '#2bcc3e', '#ab2fed', tribeColor]}
              recycle={recycleConfetti}
              numberOfPieces={300}
              wind={0.01}
              gravity={0.075}
              drawShape={(ctx: CanvasRenderingContext2D) => {
                ctx.beginPath();
                // Define the dimensions of the rectangle
                const rectWidth = 18;  // Width of the rectangle
                const rectHeight = 9;  // Height of the rectangle
                // Center the rectangle around the origin
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
              className="flex flex-row w-full items-center justify-start py-2 px-4"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${tribeColor}, ${tinycolor(tribeColor).darken(20).toString()})`,
              }}
              id="tribe"
            >
              <span className="text-4xl me-4">{tribe.emoji}</span>
              <div className="flex flex-col">
                <h2 className="text-3xl font-lostIsland text-stone-100 mb-1" style={{ textShadow: '2px 2px 1px rgba(0, 0, 0, 1)' }}>
                  {tribe.tribeName}
                </h2>
                <span className="text-xl font-lostIsland text-stone-200 leading-none mb-1" style={{ textShadow: '2px 2px 1px rgba(0, 0, 0, 1)' }}>
                  {tribe.playerName}
                </span>
              </div>
            </div>

            <div className="relative flex justify-center items-end mt-10 max-w-6xl w-full z-10">
              <span className="font-survivor text-6xl" style={{ textShadow: '2px 2px 1px rgba(0, 0, 0, 1)' }}>
                Your Tribe
              </span>
            </div>

            {/* Contestants */}
            <div className="relative flex justify-center items-end py-10 max-w-6xl w-full z-20 overflow-visible">
              {tribe.contestants.length > 0 && (
                <>
                  <div className="relative flex justify-center items-end w-full">
                    {tribe.contestants.slice(0, 6).map((contestant, index) => {
                      // Define the positions for proper spacing, placing the Sole Survivor as the 3rd contestant
                      const positions = [
                        "-translate-x-[150px] z-20 scale-85", // Far left
                        "-translate-x-[95px] z-30 scale-90", // Left
                        "-translate-x-[28px] -translate-y-[30px] z-40 scale-85", // Center (Sole Survivor, slightly larger)
                        "translate-x-[39px] z-30 scale-90", // Right
                        "translate-x-[95px] z-20 scale-85", // Mid-right
                        "translate-x-[145px] z-10 scale-75", // Far right
                      ];

                      return (
                        <div
                          key={contestant.id}
                          className={`absolute top-0 flex flex-col items-center ${positions[index]}`}
                        >
                          <img
                            src={`/imgs/48/full-body/${contestant.name}.png`}
                            alt={contestant.name}
                            className={`object-contain h-[16rem] ${
                              index === 2 ? "h-[20rem] drop-shadow-[-2px_0px_18px_rgba(255,223,0,1)]" : "h-[16rem]"
                            }`}
                          />
                          <span
                            className={`mt-8 font-lostIsland text-center leading-tight ${
                              index === 2 ? "text-2xl text-yellow-300 drop-shadow-[0_0_5px_rgba(255,223,0,0.4)]" : ""
                            }`}
                          >
                            {contestant.name}
                          </span>
                          <p className="text-sm -ms-0.5 my-1.5">
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </>)}
    </div>
  );
}
