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

type ScoringCategory = {
  name: string;
  points: number;
  schemaKey: string;
};

const scoringCategories: ScoringCategory[] = [
  { name: "Sole Survivor", points: 500, schemaKey: "soleSurvivor" },
  { name: "Final Three", points: 150, schemaKey: "top3" },
  { name: "Win Fire Making", points: 80, schemaKey: "madeFire" },
  { name: "Make the Merge", points: 100, schemaKey: "madeMerge" },
  { name: "Individual Immunities", points: 80, schemaKey: "immunityWins" },
  { name: "Reward Challenges", points: 50, schemaKey: "rewards" },
  { name: "Hidden Immunity Idols", points: 70, schemaKey: "hiddenIdols" },
  { name: "Tribal Immunity Challenges", points: 30, schemaKey: "tribalWins" },
  { name: "Survive Tribal Council", points: 40, schemaKey: "tribals" },
  { name: "Survive an Episode", points: 30, schemaKey: "episodes" },
  { name: "Advantages", points: 20, schemaKey: "advantages" },
];


export default function ContestantProfile({ contestantId }: { contestantId: number | null }) {
  
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");




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

  function calculateTotalScore(): number {
    if (!contestant) return 0;

    return scoringCategories.reduce((total, category) => {
      const value = contestant[category.schemaKey as keyof Contestant];

      // Handle boolean values
      if (typeof value === "boolean") {
        return total + (value ? category.points : 0);
      }

      // Handle numeric values
      if (typeof value === "number") {
        return total + value * category.points;
      }

      return total; // Default case
    }, 0);
  }

  function renderBooleanBadge(value: boolean | null) {
    if (value === true) {
      return <span className="inline-block uppercase px-2 py-1 w-10 text-center text-sm text-green-400 bg-green-900 rounded-lg tracking-widest">Yes</span>;
    }
    if (value === false) {
      return <span className="inline-block uppercase px-2 py-1 w-10 text-center text-sm text-red-400 bg-red-900 rounded-lg tracking-widest">No</span>;
    }
    return <span className="inline-block uppercase px-2 py-1 w-10 text-center text-sm text-gray-400 bg-gray-700 rounded-lg tracking-widest">??</span>;
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
            <span className="text-xl tracking-wider">{calculateTotalScore()}</span>
            <span className="lowercase opacity-70 text-sm">points</span>
          </div>
          <div className="flex flex-col mx-6 text-center">
            <span className="text-xl tracking-wider">1</span>
            <span className="lowercase opacity-70 text-sm">power rank</span>
          </div>
          <div className="flex flex-col mx-6 text-center">
            <span className="text-xl tracking-wider">68%</span>
            <span className="lowercase opacity-70 text-sm">rostered</span>
          </div>

          
          
        </div>

        {/* Modal Content */}
        
        
          
        {/* Menu Row */}
        <div className="flex justify-around items-center border-b border-stone-600 p-0 lowercase">
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-xl tracking-wider py-2 w-full ${
              activeTab === "overview" ? "text-orange-400 border-b-4 border-orange-400" : "text-stone-300 border-b-4 border-stone-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`text-xl tracking-wider py-2 w-full ${
              activeTab === "stats" ? "text-orange-400 border-b-4 border-orange-400" : "text-stone-300 border-b-4 border-stone-800"
            }`}
          >
            Stats
          </button>
        </div>
        
        {/* Content */}
        <div className="h-full px-0 py-4">
          {activeTab === "overview" && <div>Overview Content Goes Here</div>}
          {activeTab === "stats" && (
            <div>
              {scoringCategories.map((category) => (

                <div key={category.schemaKey} className="flex justify-between items-center p-3 border-b border-stone-600">
                  <span className="text-stone-300 me-auto text-lg">{category.name}</span>
                  <span className="text-center w-12 text-lg">
                    {contestant[category.schemaKey as keyof Contestant] === null ? (
                      renderBooleanBadge(null) // Null explicitly renders as --
                    ) : typeof contestant[category.schemaKey as keyof Contestant] === "boolean" ? (
                      renderBooleanBadge(contestant[category.schemaKey as keyof Contestant] as boolean)
                    ) : (
                      <span>
                        {String(contestant[category.schemaKey as keyof Contestant] || 0)}
                      </span>
                    )}

                  </span>
                  <span className="text-orange-400 text-xl w-16 text-end">
                    {((contestant[category.schemaKey as keyof Contestant] || 0) as number) * category.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      ) : (
        <p className="mt-4 text-center text-stone-400">Loading...</p>
      )}
    
    </>
  );
}
