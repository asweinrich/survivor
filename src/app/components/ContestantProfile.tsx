import { useState, useEffect } from 'react';

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
  voteOutOrder?: number | null; // Optional field as it can be null
  createdAt: Date; // Matches DateTime in Prisma
};


export default function ContestantProfile({ contestantId }: { contestantId: number | null }) {
  
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(true);



  // Fetch contestant details when the modal is triggered
  useEffect(() => {
    if (contestantId !== null) {
      setLoading(true); // Start loading
      fetch(`/api/contestant/${contestantId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data[0])
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



  return (
    <>
      {contestant ? (
      <div className="flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-stone-600 px-5">
          <div className="flex flex-col">
            <h2 className="text-2xl tracking-wider">{contestant?.name || 'Loading...'}</h2>
            <p className="text-xs tracking-wider opacity-70 ">
              {contestant.profession} &bull; {contestant.hometown}
            </p>
            <p className="text-sm">
              
            </p>
          </div>
          <div className="ms-auto me-2 mt-6">
            <img
              src={`/imgs/${contestant.img}.png`}
              alt={contestant.name}
              className="w-36 mx-auto"
            />
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
