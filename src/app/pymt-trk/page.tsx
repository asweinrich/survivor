'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type PlayerTribe = {
  id: number;
  tribeName: string;
  playerName: string;
  paid: boolean;
};

export default function ManagePayments() {
  const [playerTribes, setPlayerTribes] = useState<PlayerTribe[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch the list of player tribes on mount
  useEffect(() => {
    async function fetchPlayerTribes() {
      setLoading(true);
      try {
        const res = await fetch('/api/player-tribes/48');
        const data = await res.json();
        setPlayerTribes(data);
      } catch (error) {
        console.error('Error fetching player tribes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayerTribes();
  }, []);

  // Update the local state when a checkbox is toggled
  const handleCheckboxChange = (id: number, checked: boolean) => {
    const updatedTribes = playerTribes.map((tribe) =>
      tribe.id === id ? { ...tribe, paid: checked } : tribe
    );
    setPlayerTribes(updatedTribes);
  };

  // Save the updated paid statuses to the backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/update-payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerTribes }),
      });
      if (res.ok) {
        alert('Payment statuses updated successfully.');
      } else {
        alert('Failed to update payment statuses.');
      }
    } catch (error) {
      console.error('Error saving payment statuses:', error);
      alert('An error occurred while saving changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      {/* Header Section */}
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png"
            alt="Survivor Background"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)',
            }}
          ></div>
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Manage Payments
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 p-4 bg-stone-800 rounded-lg font-lostIsland tracking-wider">
          <p className="text-xl mb-2">Player Tribes Payment Status</p>
          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : (
            <div>
              {playerTribes.map((tribe) => (
                <div
                  key={tribe.id}
                  className="flex items-center justify-between border-b border-stone-700 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-lg">{tribe.tribeName}</span>
                    <span className="">{tribe.playerName}</span>

                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={tribe.paid}
                      onChange={(e) =>
                        handleCheckboxChange(tribe.id, e.target.checked)
                      }
                      className="h-5 w-5"
                    />
                    <span className="text-sm">Paid</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2 rounded text-lg uppercase ${
              saving
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
