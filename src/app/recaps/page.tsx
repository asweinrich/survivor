'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import Image from "next/image";

type Recap = {
  id: number;
  week: string;
  body: string;
  headline: string;
  winner: number;
  loser: number;
  created_at: string;
};

export default function Recaps() {
  const [season, setSeason] = useState('48'); // Default season
  const [loading, setLoading] = useState(false);
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [activeWeek, setActiveWeek] = useState<string>("");
  
  // Create a ref for the week selector container
  const weekSelectorRef = useRef<HTMLDivElement>(null);

  // Fetch recaps when the season changes
  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      const res = await fetch(`/api/weekly-recaps/${season}`);
      const data = await res.json();
      setRecaps(data);
      if (data.length > 0 && !activeWeek) {
        // Sort recaps descending by week (assuming week is a numeric string)
        const sortedRecaps = [...data].sort((a, b) => Number(b.week) - Number(a.week));
        setActiveWeek(sortedRecaps[0].week);
      }
      setLoading(false);
    }
    fetchData();
  }, [season]);

  // After recaps load, scroll the week selector container to the end.
  useEffect(() => {
    if (weekSelectorRef.current) {
      weekSelectorRef.current.scrollLeft = weekSelectorRef.current.scrollWidth;
    }
  }, [recaps]);

  function formatDateTime(dateTime: Date | string): string {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    const now = new Date();
    
    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) {
      return `Today • ${timeFormatter.format(date)}`;
    } else if (diffInDays === 1) {
      return `Yesterday • ${timeFormatter.format(date)}`;
    } else {
      return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`;
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png"
            alt="Survivor Background"
            fill
            style={{ objectFit: 'cover' }}
            className=""
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{
              backgroundImage: "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)",
            }}
          ></div>
        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">
          Weekly Recaps
        </h1>
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/${season}/logo.png`}
            alt="Survivor Season 48 Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Season Dropdown */}
        <div className="mb-4 px-4 font-lostIsland tracking-wider">
          <select
            id="season"
            className="p-2 border border-stone-700 text-lg rounded-md bg-stone-800 text-stone-200"
            value={season}
            onChange={(e) => {
              setSeason(e.target.value);
              setActiveWeek(""); // Reset activeWeek when season changes
            }}
          >
            <option value={'48'}>Season 48</option>
            <option value={'47'}>Season 47</option>
            {/* Add more seasons as needed */}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-stone-200" />
            <p className="font-lostIsland text-xl lowercase my-4 tracking-wider">
              Loading...
            </p>
          </div>
        ) : (
          <>
            {/* Week Selector */}
            <div
              ref={weekSelectorRef}
              className="flex justify-start space-x-2 p-4 font-lostIsland w-full overflow-x-scroll whitespace-nowrap"
            >
              {recaps.map((recap) => (
                <button
                  key={recap.id}
                  onClick={() => setActiveWeek(recap.week)}
                  className={`w-12 h-12 flex-shrink-0 rounded-full text-xl border-2 flex items-center justify-center ${
                    activeWeek === recap.week
                      ? "bg-gradient-to-tr from-orange-500 to-orange-700 text-white border-transparent"
                      : "bg-stone-800 text-stone-200 border-stone-700"
                  }`}
                  style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 1)" }}
                >
                  {recap.week}
                </button>
              ))}
            </div>

            {/* Active Recap Display */}
            {recaps.length > 0 && (
              (() => {
                // Sort recaps by week number descending (highest week first)
                const sortedRecaps = [...recaps].sort(
                  (a, b) => Number(b.week) - Number(a.week)
                );
                const activeRecap =
                  sortedRecaps.find((r) => r.week === activeWeek) || sortedRecaps[0];
                return (
                  <div className="p-4">
                    <h2 className="text-2xl font-lostIsland tracking-wider">
                      {activeRecap.headline}
                    </h2>
                    <p className="my-2 text-stone-400 text-lg tracking-wider font-lostIsland lowercase">
                      {formatDateTime(activeRecap.created_at)}
                    </p>
                    <p className="text-lg text-justify" style={{ whiteSpace: "pre-line" }}>
                      {activeRecap.body.replace(/\\n/g, "\n")}
                    </p>
                  </div>
                );
              })()
            )}
          </>
        )}
      </div>
    </div>
  );
}
