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
    <nav className="relative sticky top-0 z-30 bg-stone-900">
      {/* Background layers, clipped to the nav bounds */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Season logo background (zoomed out a bit to show more of the image) */}
        <div
          className="absolute inset-0 bg-no-repeat bg-right me-24"
          style={{
            backgroundImage: `url(/imgs/${season}/logo.png)`,
            backgroundSize: '36%',
          }}
        />
        {/* Gradient overlay: dark at edges, transparent-ish in the middle */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/0 to-stone-900/60" />
        {/* Subtle vertical fade for text legibility top/bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-transparent to-stone-900/80" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-white p-3 uppercase tracking-wider">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <a href="/" className="text-3xl px-1 hover:opacity-70 font-survivor">Survivor Fantasy</a>
            <div className="flex -ms-1">
              <SeasonSelector />
            </div>
          </div>

          <div className="flex flex-col px-1">
            <AuthArea />
          </div>
        </div>
      </div>
    </nav>
  );
}


function AuthArea() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const { color, emoji } = useLatestTribe(session?.user?.email);
  const { name } = useUserInfo(session?.user?.email || '');

  if (status === 'loading') return null;

  if (!session) {
    return (
      <a
        href="/sign-in"
        className="bg-blue-600 text-white text-xl mt-1.5 font-lostIsland px-4 py-2 rounded-lg hover:bg-blue-700 uppercase tracking-wider"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 focus:outline-none"
        aria-label="Account menu"
      >
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full border-2 border-stone-700 flex items-center justify-center text-2xl shadow-md"
            style={{ backgroundColor: color || '#44403c' }}
          >
            {emoji || '🧑'}
          </div>
          {name && (
            <span className="mt-1.5 max-w-[5rem] truncate text-[11px] normal-case font-lostIsland tracking-wide leading-none text-stone-300">
              {name}
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 stroke-2 text-stone-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 bg-stone-800 border border-stone-700 rounded-xl shadow-lg z-50 overflow-hidden font-lostIsland lowercase tracking-wider">
            <a
              href="/dashboard"
              className="block px-4 py-3 text-stone-100 hover:bg-stone-700"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </a>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-4 py-3 text-red-300 hover:bg-stone-700"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
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
        className="bg-stone-900 rounded-md text-xl px-1 uppercase text-stone-400 tracking-wider focus:outline-none"
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