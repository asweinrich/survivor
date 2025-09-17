'use client';

import { useEffect, useMemo, useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
// import Image from 'next/image'; // (unused in your snippet)

import type { UserBadge } from '@/lib/types';
import { darkenColor } from '@/lib/utils/color';
import { useUserInfo } from '@/lib/hooks/useUserInfo';

type Props = {
  userEmail: string;
  tribeCount: number;
};

export default function UserHeader({ userEmail, tribeCount }: Props) {
  const { name, badges, allBadges } = useUserInfo(userEmail);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // modal state
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  // sync fetched name -> local states
  useEffect(() => {
    setDisplayName(name || '');
    setEditValue(name || '');
  }, [name]);

  const isDirty = useMemo(() => {
    return editValue.trim() !== (displayName || '').trim();
  }, [editValue, displayName]);

  const isValid = useMemo(() => {
    const n = editValue.trim();
    return n.length >= 2 && n.length <= 24;
  }, [editValue]);

  async function saveName() {
    if (!isDirty || !isValid || saving) return;
    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await fetch('/api/update-display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: editValue.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update name');
      }

      const data = await res.json();
      // optimistic apply
      const next = data.name ?? editValue.trim();
      setDisplayName(next);
      setEditValue(next);          
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setIsEditing(true);
    setEditValue(displayName);
    setErrorMsg(null);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditValue(displayName);
    setErrorMsg(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') cancelEditing();
  }

  return (
    <>
      <div className="font-lostIsland border-2 border-stone-700 rounded bg-stone-800 w-full max-w-6xl p-3 flex-col items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Text Content */}
          <div className="flex-col py-2">
            {/* Name + Edit */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <input
                    className="text-2xl bg-stone-700 text-white rounded max-w-48 px-2"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus
                  />
                  {/* Save / Cancel controls */}
                  <button
                    onClick={saveName}
                    disabled={!isDirty || !isValid || saving}
                    className={`px-2 py-1 rounded text-sm border ${
                      !isDirty || !isValid || saving
                        ? 'opacity-40 cursor-not-allowed border-stone-600 text-stone-400'
                        : 'border-stone-300 text-stone-100 hover:bg-stone-700'
                    }`}
                    aria-disabled={!isDirty || !isValid || saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-2 py-1 rounded text-sm border border-stone-600 text-stone-400 hover:text-stone-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-2xl text-white px-2">{displayName}</h1>
                  <button
                    onClick={startEditing}
                    className="text-stone-400 hover:text-white"
                    aria-label="Edit display name"
                    title="Edit display name"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Validation / error */}
            {isEditing && !isValid && (
              <div className="px-2 text-sm text-red-300 mt-1">
                Name must be 2–24 characters.
              </div>
            )}
            {errorMsg && (
              <div className="px-2 text-sm text-red-300 mt-1">{errorMsg}</div>
            )}

            <span className="opacity-70 tracking-wider px-2">{userEmail}</span>

            {/* Season Count */}
            <p className="opacity-90 tracking-wider mt-2 px-2">
              Played in {tribeCount} season{tribeCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex mb-2 ps-1">
          {/* Badges */}
          <div className="flex flex-wrap mt-3 gap-2">
            {badges.length === 0 ? (
              <span className="text-sm text-stone-400 italic px-2">No badges yet</span>
            ) : (
              badges.map((badge) => (
                <button
                  key={badge.id}
                  title={badge.description}
                  className="flex items-center gap-1 w-10 h-10 rounded-lg border-2 border-black font-lostIsland text-xl text-white shadow-md transition hover:scale-[1.02]"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${badge.color}, ${darkenColor(
                      badge.color,
                      0.3
                    )})`,
                    boxShadow: '1px 2px 0px rgba(0,0,0,1)',
                  }}
                  onClick={() => {
                    setBadgeModalOpen(true);
                    setSelectedBadge(badge);
                  }}
                >
                  <div className="mx-auto" style={{ textShadow: '1px 1px 0px rgba(0,0,0,1)' }}>
                    {badge.emoji}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Badge Modal (unchanged) */}
      {badgeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
          onClick={() => setBadgeModalOpen(false)}
        >
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

            <h2 className="text-2xl mb-4 text-center border-b border-stone-500 lowercase pb-4">
              Survivor Fantasy Badges
            </h2>

            {selectedBadge && (
              <div className="text-center mb-6">
                <div
                  className="text-6xl mb-3 flex w-24 h-24 justify-center items-center mx-auto border-4 border-black rounded-2xl"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${selectedBadge.color}, ${darkenColor(
                      selectedBadge.color,
                      0.35
                    )})`,
                    boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                  }}
                >
                  {selectedBadge.emoji}
                </div>
                <h3 className="text-2xl uppercase mb-1 tracking-wide">{selectedBadge.name}</h3>
                <p className="text-lg px-2 text-stone-300 leading-tight">{selectedBadge.description}</p>
              </div>
            )}

            <div className="flex flex-col gap-y-4 max-h-[36vh] overflow-y-auto border-y-2 border-stone-700 p-4">
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
                    <div className="text-2xl" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>
                      {badge.emoji}
                    </div>
                    <span className="text-2xl tracking-wide lowercase" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>
                      {badge.name}
                    </span>
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
