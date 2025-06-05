'use client' 

import { metadata } from "./metadata"; // Import the metadata
import "./globals.css";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { SessionProvider } from 'next-auth/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { SpoilerProvider } from '../context/SpoilerContext'; 
import { useSpoiler } from '../context/SpoilerContext';




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
        className={`antialiased bg-stone-900 pb-12`}
      >
        <SessionProvider>
          <SpoilerProvider>
            <Navbar />
            <Analytics />
            {children}
          </SpoilerProvider>
        </SessionProvider>
        
      </body>
    </html>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="max-w-6xl mx-auto bg-stone-900 text-white p-3 relative sticky top-0 z-30">
      <div className="flex items-start justify-between uppercase tracking-wider">
        <div className="flex flex-col">
          <a href="/" className="text-3xl px-1 hover:opacity-70 font-survivor">Survivor Fantasy</a>
          <div className="flex mt-1">
            <SpoilerSwitch />
          </div>
        </div>

        <div className="text-lg hidden md:flex space-x-6 items-center font-lostIsland">
          <a href="/cast" className="hover:opacity-70">Cast</a>
          <a href="/leaderboard" className="hover:opacity-70">Leaderboard</a>
          <a href="/recaps" className="hover:opacity-70">Weekly Recaps</a>
          <a href="/how-to-play" className="hover:opacity-70">How to Play</a>
          <a href="/faq" className="hover:opacity-70">FAQ</a>
          <div className="px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-700 rounded text-white opacity-60">Draft</div>
          <AuthButton />
          
        </div>
        <button
          onClick={toggleMenu}
          className="md:hidden bg-stone-800 flex items-center p-2 hover:opacity-70 border-2 rounded border-stone-600"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-8 w-8 stroke-2 text-stone-300" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-stone-900 z-50 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        suppressHydrationWarning
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 p-2 hover:opacity-70"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-6 w-6 text-white" />
        </button>
        <nav className="flex flex-col uppercase items-start p-6 space-y-4 font-lostIsland text-2xl tracking-wider">
          <a href="/" className="hover:opacity-70">Home</a>
          <a href="/cast" className="hover:opacity-70">Cast</a>
          <a href="/leaderboard" className="hover:opacity-70">Leaderboard</a>
          <a href="/recaps" className="hover:opacity-70">Weekly Recaps</a>
          <a href="/how-to-play" className="hover:opacity-70">How To Play</a>
          <a href="/faq" className="hover:opacity-70">FAQ</a>
          <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg text-white opacity-60">Draft</div>
          <AuthButton />
        </nav>
      </div>
    </nav>
  );
}


function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;

  if (session) {
    return (
      <div className="flex flex-col items-start gap-4">
        <a href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-700 rounded text-white">Dashboard</a>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <a href="/sign-in" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Sign In
    </a>
  );
}

function SpoilerSwitch() {

  const { revealSpoilers, toggleSpoilers } = useSpoiler(); 

  return (
    <label htmlFor="spoilerSwitch" className="flex items-center cursor-pointer font-lostIsland">
      
      <div className="relative me-2">
        <input
          type="checkbox"
          id="spoilerSwitch"
          className="sr-only peer"
          checked={revealSpoilers}
          onChange={toggleSpoilers}
        />
        <div className="w-10 h-6 bg-gray-400 rounded-full peer-checked:bg-orange-500 transition-colors"></div>
        <div className="absolute top-1 left-1 w-4 h-4 bg-stone-200 border-2 border-stone-800 rounded-full transition-transform duration-200 peer-checked:translate-x-4"></div>
      </div>

      <span className="lowercase leading-none">Show Spoilers</span>
    </label>
  )
}
