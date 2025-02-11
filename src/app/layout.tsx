'use client' 

import { metadata } from "./metadata"; // Import the metadata
import "./globals.css";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={metadata.description || "Default description"} />
      </head>
      <body
        className={`antialiased bg-stone-900 pb-12`}
      >
        <Navbar />
        {children}
        
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
    <nav className="max-w-6xl mx-auto bg-stone-900 text-white p-3 relative">
      <div className="flex items-center justify-between uppercase tracking-wider">
        <a href="/" className="text-3xl p-1 hover:opacity-70 font-survivor">Survivor Fantasy</a>
        <div className="text-lg hidden md:flex space-x-6 items-center font-lostIsland">
          <a href="/cast" className="hover:opacity-70">Cast</a>
          <a href="/leaderboard" className="hover:opacity-70">Leaderboard</a>
          <a href="/recaps" className="hover:opacity-70">Weekly Recaps</a>
          <a href="/how-to-play" className="hover:opacity-70">How to Play</a>
          <a href="/faq" className="hover:opacity-70">FAQ</a>
          <a href="/draft" className="px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 rounded text-white">Draft</a>
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
          <a href="/draft" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 rounded-lg text-white">Draft</a>
        </nav>
      </div>
    </nav>
  );
}
