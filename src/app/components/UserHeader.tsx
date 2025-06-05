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
  description: string;
  color: string;
};

export default function UserHeader({ userEmail, tribeCount }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [imageURL, setImageURL] = useState('/imgs/50/Survivor 49 Contestant.png');
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const res = await fetch('/api/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      setDisplayName(data.name || '');
      setBadges(data.badges || []);
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

  return (
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
              formatUserBadges(badges)
            )}
          </div>
        </div>
        {/* Profile Image */}
      

        
    </div>
  );
}
