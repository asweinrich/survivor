import { useState, useEffect } from 'react';
import { TrophyIcon, FireIcon } from '@heroicons/react/24/solid';


type Contestant = {
  id: number;
  name: string;
  img: string;
  season: number;
  hometown: string;
  profession: string;
  tribes: number[];
  inPlay: boolean;
  episodes: number;
  advantages: number;
  madeMerge: boolean;
  top3: boolean;
  soleSurvivor: boolean;
  immunityWins: number;
  tribalWins: number;
  hiddenIdols: number;
  rewards: number;
  madeFire: boolean;
  voteOutOrder: number; // Optional field as it can be null
  createdAt: Date; // Matches DateTime in Prisma
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};


export default function ContestantProfile({ contestantId }: { contestantId: number | null }) {
  
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);



  // Fetch contestant details when the modal is triggered
  useEffect(() => {
    if (contestantId !== null) {
      setLoading(true); // Start loading

      fetch(`/api/contestant/${contestantId}`)
        .then((res) => res.json())
        .then((data) => {
          setContestant(data[0]);
          setLoading(false); // End loading
        })
        .catch((error) => {
          console.error('Error fetching contestant details:', error);
          setLoading(false); // End loading even if there's an error
        });

    } else {
      setContestant(null);
    }
  }, [contestantId]);

  // Fetch tribes for the contestant's season
  useEffect(() => {
    if (contestant && contestant.season) {
      fetch(`/api/show-tribes/${contestant.season}`)
        .then((res) => res.json())
        .then((data) => setTribes(data))
        .catch((error) => console.error('Error fetching tribes:', error));
    }
  }, [contestant]);

  // Format tribe badges
  function formatTribeBadges(tribeIds: number[]) {
    return tribeIds.map((id) => {
      const tribe = tribes.find((t) => t.id === id);
      if (!tribe) return null;

      return (
        <span
          key={id}
          className="inline-block px-2 py-0.5 text-sm tracking-wider rounded-full me-1.5 lowercase font-lostIsland"
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
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

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
    return `${getOrdinalSuffix(votedOutOrder)} person voted out`;
  }



  return (
    <>
      {contestant ? (
      <div className="flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-stone-600 px-4">
          <div className="flex flex-col pt-4">
            <h2 className="text-xl tracking-wider uppercase">{contestant?.name || 'Loading...'}</h2>
            <p className="text-sm tracking-wider opacity-70 lowercase leading-tight">
              {contestant.profession}
            </p>
            <p className="text-sm tracking-wider opacity-70 lowercase leading-tight">
              {contestant.hometown}
            </p>
            <p className="text-sm -ms-0.5 my-1.5">
              {formatTribeBadges(contestant.tribes)}
            </p>
            <div className="flex pb-1.5 text-sm">
            {contestant.inPlay ? (<>
              <FireIcon className="h-5 w-5 text-orange-400 me-0.5" />
              <div className="text-stone-300 lowercase font-lostIsland tracking-wider">In Play</div>
            </>) : (<>
              <FireIcon className="h-5 w-5 text-white opacity-60 me-0.5" />
              <div className="text-stone-400 lowercase font-lostIsland tracking-wider">
                {formatVotedOutOrder(contestant.voteOutOrder)}
              </div>
              
            </>
            )}
            </div>
          </div>
          <div className="self-end ms-auto me-2 mt-6">
            <img
              src={`/imgs/${contestant.img}.png`}
              alt={contestant.name}
              className="w-36 mx-auto"
            />
          </div>

          
          
        </div>

       

        <div className="flex justify-around items-center border-b border-stone-600 p-3">
          <div className="flex flex-col mx-6 text-center">
            <span className="text-xl tracking-wider">155</span>
            <span className="lowercase opacity-70 text-sm">score</span>
          </div>
          <div className="flex flex-col mx-6 text-center">
            <span className="text-xl tracking-wider">1</span>
            <span className="lowercase opacity-70 text-sm">rank</span>
          </div>
          <div className="flex flex-col mx-6 text-center">
            <span className="text-xl tracking-wider">68%</span>
            <span className="lowercase opacity-70 text-sm">rostered</span>
          </div>

          
          
        </div>

        {/* Modal Content */}
        
        <div className="flex">
          
          <p className="mt-4 text-sm">
            <strong>Profession:</strong> {contestant.profession}
          </p>
          <p className="text-sm">
            <strong>Hometown:</strong> {contestant.hometown}
          </p>
          <p className="text-sm">
            <strong>Season:</strong> {contestant.season}
          </p>
        </div>
      </div>
      ) : (
        <p className="mt-4 text-center text-stone-400">Loading...</p>
      )}
    
    </>
  );
}
