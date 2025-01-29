'use client';

import { useState, useEffect } from 'react';
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import Image from "next/image";
import tinycolor from "tinycolor2";

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  img: string; // This should match the field in your database
};

type Tribe = {
  id: number;
  tribeName: string;
  color: string;
  emoji: string;
  contestants: Contestant[];
};

type ShowTribe = {
  id: number;
  name: string;
  color: string;
};


export default function YourTribePage() {
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [mounted, setMounted] = useState(false);
  const { width, height } = useWindowSize();
  const [tribeColor, setTribeColor] = useState(null);

  // Fetch tribe data from the API
  useEffect(() => {
    async function fetchTribeData() {
      const tribeId = window.location.pathname.split('/').pop(); // Get tribe_id from URL
      try {
        const response = await fetch(`/api/get-player-tribe/${tribeId}`);
        if (response.ok) {
          const data = await response.json();
          setTribe(data[0]); // Assuming the API response is an array with one tribe
          setTribeColor(data[0].color)
        } else {
          console.error('Failed to fetch tribe data');
        }
      } catch (error) {
        console.error('Error fetching tribe data:', error);
      }
    }

    fetchTribeData();
    setMounted(true); // Indicate that the component has mounted
  }, []);




  return (
    <div className="flex flex-col items-center text-white w-full">
      {mounted && tribeColor && (
        <Confetti
          width={width}
          height={height}
          colors={[tribeColor, '#fc8c03', '#2bcc3e', '#ab2fed', tribeColor]}
          recycle={false}
          numberOfPieces={800}
          wind={0.01}
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
      )}
      

      {tribe && (
        <>
          {/* Tribe Header */}
          <div
            className="flex flex-row w-full items-center p-3"
            style={{
              backgroundImage: `linear-gradient(to bottom right, ${tribeColor}, ${tinycolor(tribeColor).darken(20).toString()})`,
            }}
          >
            <span className="text-5xl me-3">{tribe.emoji}</span>
            <div className="flex flex-col">
              <h2 className="text-3xl font-lostIsland text-stone-100" style={{textShadow: '2px 2px 1px rgba(0, 0, 0, 1)'}} >{tribe.tribeName}</h2>
              <span className="text-xl font-lostIsland text-stone-100 leading-none mb-1" style={{textShadow: '2px 2px 1px rgba(0, 0, 0, 1)'}} >{tribe.playerName}</span>
            </div>
          </div>

          {/* Contestants */}
          <div className="flex flex-col items-center mt-8 space-y-4">
            {/* Sole Survivor Pick */}
            {tribe.contestants.length > 0 && (
              <div className="flex flex-col items-center mb-2">
                <div
                  className="flex items-center rounded-full overflow-hidden border-4 border-yellow-500 w-48 h-48"
                >
                  <img
                    src={`/imgs/${tribe.contestants[0].img}.png`}
                    alt={tribe.contestants[0].name}
                    className="w-40 h-40 rounded-full mx-auto"
                  />
                </div>
                <span className="mt-3 text-3xl font-lostIsland">
                  {tribe.contestants[0].name}
                </span>
                <span className="text-xl font-lostIsland lowercase opacity-80">
                  Sole Survivor
                </span>
              </div>
            )}

            {/* Remaining Contestants */}
            <div className="flex flex-col gap-4">
              {/* First Row: 2 Contestants */}
              <div className="flex justify-center gap-4">
                {tribe.contestants.slice(1, 3).map((contestant) => (
                  <div key={contestant.id} className="flex flex-col items-center w-32 mb-2">
                    <div
                      className="flex items-center rounded-full overflow-hidden border-4 border-gray-500 w-28 h-28"
                    >
                      <img
                        src={`/imgs/${contestant.img}.png`}
                        alt={contestant.name}
                        className="w-24 h-24 mx-auto rounded-full"
                      />
                    </div>
                    <span className="mt-1 text-xl font-lostIsland text-center leading-tight">{contestant.name}</span>
                  </div>
                ))}
              </div>

              {/* Second Row: 3 Contestants */}
              <div className="flex justify-center gap-2">
                {tribe.contestants.slice(3).map((contestant) => (
                  <div key={contestant.id} className="flex flex-col items-center w-32">
                    <div
                      className="flex items-center rounded-full overflow-hidden border-4 border-gray-500 w-28 h-28"
                    >
                      <img
                        src={`/imgs/${contestant.img}.png`}
                        alt={contestant.name}
                        className="w-24 h-24 mx-auto rounded-full"
                      />
                    </div>
                    <span className="mt-1 text-xl font-lostIsland text-center leading-tight">{contestant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

    </div>

  );

}