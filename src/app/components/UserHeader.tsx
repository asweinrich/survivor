'use client';

import { useEffect, useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

type Props = {
  userEmail: string;
  tribeCount: number;
};

type UserBadge = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  color: string;
  rank: number;
};

export default function UserHeader({ userEmail, tribeCount }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [imageURL, setImageURL] = useState('/imgs/50/Survivor 49 Contestant.png');
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<UserBadge[]>([]); 
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const res = await fetch('/api/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      const sortedEarned = [...(data.badges || [])].sort((a, b) => a.rank - b.rank);
      const sortedAll = [...(data.allBadges || [])].sort((a, b) => a.rank - b.rank);

      setDisplayName(data.name || '');
      setBadges(sortedEarned);
      setAllBadges(sortedAll);
    };

    if (userEmail) {
      fetchUserInfo();
    }
  }, [userEmail]);



  const handleNameSave = () => {
    setIsEditing(false);
    // TODO: Add update name API logic
  };

  function formatUserBadges(badges: { id: number; name: string; description: string; color: string }[]) {
    return badges.map((badge) => {
      if (!badge) return null;

      return (
        <span
          key={badge.id}
          title={badge.description}
          className="inline px-3 py-1 tracking-wider rounded-full lowercase font-lostIsland border border-black"
          style={{
            backgroundColor: hexToRgba(badge.color, 0.3),
            color: badge.color,
            textShadow: '2px 2px 0px rgba(0,0,0,1)',
          }}
        >
          {badge.name}
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

  function darkenColor(hex: string, amount: number = 0.2): string {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const darken = (channel: number) =>
      Math.max(0, Math.min(255, Math.floor(channel * (1 - amount))));

    return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
  }

  return (
    <>
      <div className="font-lostIsland bg-stone-800 w-full max-w-6xl p-4 flex-col items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          
          {/* Text Content */}
          <div className="flex-col py-2">
            {/* Name and Edit */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  className="text-2xl bg-stone-700 text-white rounded max-w-48 px-2"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={handleNameSave}
                  autoFocus
                />
              ) : (
                <h1 className="text-2xl text-white px-2">{displayName}</h1>
              )}
              <button onClick={() => setIsEditing(!isEditing)} className="text-stone-400 hover:text-white">
                <PencilSquareIcon className="h-5 w-5" />
              </button>
            </div>

            <span className="opacity-70 tracking-wider px-2">{userEmail}</span>

            {/* Season Count */}
            <p className="opacity-90 tracking-wider mt-2 px-2">Played in {tribeCount} season{tribeCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

          <div className="flex mb-2">
            {/* Badges */}
            <div className="flex flex-wrap mt-3 gap-2">
              {badges.length === 0 ? (
                <span className="text-sm text-stone-400 italic px-2">No badges yet</span>
              ) : (
                badges.map((badge) => (
                  <button
                    key={badge.id}
                    title={badge.description}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg border-2 border-black font-lostIsland text-white shadow-md transition hover:scale-[1.02]"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${badge.color}, ${darkenColor(badge.color, 0.3)})`,
                      boxShadow: '1px 1px 0px rgba(0,0,0,1)',
                    }}
                     onClick={() => {
                      setBadgeModalOpen(true)
                      setSelectedBadge(badge)
                    }}
                  >
                    <div
                      className=""
                      style={{
                        textShadow: '2px 2px 0px rgba(0,0,0,1)',
                      }}
                    >
                      {badge.emoji}
                    </div>
                    <span 
                      className="tracking-wide lowercase"
                      style={{
                        textShadow: '1px 1px 0px rgba(0,0,0,1)',
                      }}
                    >{badge.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
          {/* Profile Image */}
        

          
      </div>



      {badgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div
            className="flex flex-col bg-stone-800 text-stone-100 rounded-2xl p-6 w-full max-w-3xl relative font-lostIsland"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBadgeModalOpen(false)}
              className="absolute top-3 right-4 text-stone-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl mb-4 text-center border-b border-stone-500 lowercase pb-4">Survivor Fantasy Badges</h2>

            {/* Focused Badge Display */}
            {selectedBadge && (
              <div className="text-center mb-6">
                <div 
                  className="text-6xl mb-3 flex w-24 h-24 justify-center items-center mx-auto border-4 border-black rounded-lg" 
                  style={{ 
                    backgroundImage: `linear-gradient(to bottom right, ${selectedBadge.color}, ${darkenColor(selectedBadge.color, 0.35)})`,
                    textShadow: '3px 5px 0px rgba(0,0,0,1)', 
                    boxShadow: '4px 4px 0px rgba(0,0,0,1)', 
                  }}
                >
                  {selectedBadge.emoji}
                </div>
                <h3 className="text-2xl uppercase mb-1 tracking-wide">{selectedBadge.name}</h3>
                <p className="text-lg px-2 text-stone-300 leading-tight">{selectedBadge.description}</p>
              </div>
            )}

            {/* Badge Grid */}
            <div className="flex flex-col gap-y-4 max-h-[36vh] overflow-y-auto border-y border-stone-500 p-4">
              {allBadges.map((badge) => {
                const earned = badges.some((b) => b.id === badge.id);
                const isFocused = selectedBadge?.id === badge.id;

                return (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`w-full flex items-center gap-4 px-3 py-1 rounded-xl border-4 border-black text-left transition ${
                      isFocused ? 'scale-105' : ''
                    } ${earned ? '' : 'opacity-30'}`}
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${badge.color}, ${darkenColor(
                        badge.color,
                        0.5
                      )})`,
                      boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                    }}
                  >
                    <div
                      className="text-2xl"
                      style={{
                        textShadow: '2px 2px 0px rgba(0,0,0,1)',
                      }}
                    >
                      {badge.emoji}
                    </div>
                    <span 
                      className="text-2xl tracking-wide lowercase"
                      style={{
                        textShadow: '2px 2px 0px rgba(0,0,0,1)',
                      }}
                    >{badge.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </> 
  );
}
