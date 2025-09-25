'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

Chart.register(ArcElement, Tooltip, Legend);

type PlayerTribe = {
  id: number;
  tribeName: string;
  playerName: string;
  paid: boolean;
};

export default function ManagePayments() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // All hooks must be declared before any return or conditional logic!
  const [playerTribes, setPlayerTribes] = useState<PlayerTribe[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tribeCost = 20;

  // Restrict access: only asweinrich@gmail.com can view
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (
      status === 'unauthenticated' ||
      (status === 'authenticated' && session?.user?.email?.toLowerCase() !== 'asweinrich@gmail.com')
    ) {
      router.replace('/');
    }
  }, [session, status, router]);

  // Fetch the list of player tribes on mount
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.email?.toLowerCase() !== 'asweinrich@gmail.com') return;
    async function fetchPlayerTribes() {
      setLoading(true);
      try {
        const res = await fetch('/api/player-tribes/49');
        const data = await res.json();

        // Ensure that 'paid' is always either true or false
        const transformedData = data.map((tribe: PlayerTribe) => ({
          ...tribe,
          paid: tribe.paid ?? false,  // If 'paid' is null or undefined, set it to false
        }));

        setPlayerTribes(transformedData);
      } catch (error) {
        console.error('Error fetching player tribes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayerTribes();
  }, [status, session]);

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
        method: 'POST',
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

  // Calculate paid and pending amounts
  const paidCount = playerTribes.filter((tribe) => tribe.paid).length;
  const unpaidCount = playerTribes.length - paidCount;
  const totalPot = playerTribes.length * tribeCost;
  const paidAmount = paidCount * tribeCost;
  const unpaidAmount = unpaidCount * tribeCost;

  // Pie chart data
  const pieData = {
    labels: ['Paid', 'Pending'],
    datasets: [
      {
        data: [paidAmount, unpaidAmount],
        backgroundColor: ['#77c471', '#6b7280'],
        hoverBackgroundColor: ['#68b165', '#4b5563'],
      },
    ],
  };

  // Don't render until authenticated and correct user
  if (
    status === 'loading' ||
    status === 'unauthenticated' ||
    (status === 'authenticated' && session?.user?.email?.toLowerCase() !== 'asweinrich@gmail.com')
  ) {
    return null;
  }

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

      {/* Pie Chart Section */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="p-4 bg-stone-800 rounded-lg font-lostIsland tracking-wider text-center">
          <h2 className="text-xl mb-4 uppercase">Payment Status Overview</h2>
          <Pie data={pieData} />
          <div className="mt-4 flex justify-center space-x-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl text-stone-100 tracking-wider">${totalPot}</span>
              <span className="text-sm text-stone-400">Total Pot</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl text-green-400 tracking-wider">${paidAmount}</span>
              <span className="text-sm text-stone-400">Paid</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl text-stone-300 tracking-wider">${unpaidAmount}</span>
              <span className="text-sm text-stone-400">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 p-4 bg-stone-800 rounded-lg font-lostIsland tracking-wider">
          <p className="text-xl mb-4 uppercase text-center">Player Tribes Payment Status</p>
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
                      checked={!!tribe.paid}
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