'use client' 

import { metadata } from "./metadata"; // Import the metadata
import "./globals.css";
import { useState } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { SessionProvider } from 'next-auth/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { SeasonProvider, useSeason } from '../context/SeasonContext';
import { useLatestTribe } from '@/lib/hooks/useLatestTribe';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import AppTabBar from "./components/AppTabBar";
import { ChevronDownIcon } from '@heroicons/react/24/outline';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{String(metadata.title)}</title>
        <meta property="og:description" content="Welcome to the ultimate Survivor Fantasy League! Draft your tribe and earn weekly points based on gameplays. Outwit, outplay, outpick!" />
        <meta property="og:image" content="https://survivorfantasy.app/meta-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://survivorfantasy.app" />
        <meta property="og:title" content="Survivor Fantasy App" />
      </head>
      <body
        className={`antialiased bg-stone-900 pb-24`}
      >
        <SessionProvider>
          <SeasonProvider>
            <Navbar />
            <AppTabBar />
            <Analytics />
            {children}
          </SeasonProvider>
        </SessionProvider>
        
      </body>
    </html>
  );
}

function Navbar() {
  const { season } = useSeason();

  return (
    <nav className="relative sticky top-0 z-30 bg-stone-900 rounded-b-2xl shadow border-b border-stone-950 overflow-hidden">
      {/* Background layers, clipped to the nav bounds */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blurred full-bleed logo fill */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/imgs/${season}/logo.png)`,
            filter: 'blur(4px)',
            opacity: 0.5,
          }}
        />
        {/* Crisp season logo background (zoomed out a bit to show more of the image) */}
        <div
          className="absolute inset-0 bg-no-repeat bg-right me-1"
          style={{
            backgroundImage: `url(/imgs/${season}/logo.png)`,
            backgroundSize: '38%',
          }}
        />
        {/* Gradient overlay: dark at edges, transparent-ish in the middle */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/30 via-stone-900/10 to-stone-900/20" />
        {/* Subtle vertical fade for text legibility top/bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-transparent to-stone-900/30" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-white px-3 pt-3 pb-2 uppercase tracking-wider">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <a href="/" style={{ textShadow: '3px 3px 0px rgba(0,0,0,1)' }} className="text-4xl px-1 hover:opacity-70 font-survivor">Survivor Fantasy</a>
            <div className="flex mt-0.5">
              <SeasonSelector />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}



function SeasonSelector() {
  const { season, setSeason, availableSeasons } = useSeason();

  return (
    <label htmlFor="seasonSelector" className="flex items-center font-lostIsland lowercase text-sm">
      <select
        id="seasonSelector"
        value={season}
        onChange={(e) => setSeason(e.target.value)}
        className="bg-stone-900 shadow rounded-md border border-stone-700 text-base px-2 py-1 uppercase text-stone-300 tracking-wider focus:outline-none"
      >
        {availableSeasons.map((s) => (
          <option key={s} value={s}>
            Season {s}
          </option>
        ))}
      </select>
    </label>
  );
}