'use client'
  
import React, { useState, useEffect } from "react";
import Image from "next/image";

const HomePage = () => {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const targetDate = new Date("2025-02-28T20:00:00"); // Replace with Season 48 premiere date
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = targetDate.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      setCountdown(`${days} days, ${hours} hours, ${minutes} minutes`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-stone-900 text-white font-lostIsland min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/imgs/97FDB0B0-3C97-48FD-8D27-D54E33FDF076.png" // Replace with your background image path
          alt="Survivor Background"
          layout="fill"
          objectFit="cover"
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-800"></div>
      </div>

      {/* Logo and Welcome Section */}
      <div className="relative z-10 flex flex-col items-center text-center py-16">
        <Image
          src="/imgs/IMG_3143.png" // Replace with your Survivor logo path
          alt="Survivor Fantasy Logo"
          width={200}
          height={200}
        />
        <h1 className="text-3xl font-bold mt-6">Welcome to Survivor Fantasy!</h1>
      </div>

      {/* Countdown Section */}
      <div className="relative z-10 text-center py-8">
        <h2 className="text-xl font-semibold">Countdown to Season 48 Premiere:</h2>
        <p className="text-2xl font-bold mt-2">{countdown}</p>
      </div>

      {/* Buttons Section */}
      <div className="relative z-10 flex justify-center gap-4 py-8">
        <button className="px-6 py-3 bg-stone-700 rounded text-white hover:bg-stone-600">
          How to Play
        </button>
        <button className="px-6 py-3 bg-green-600 rounded text-white hover:bg-green-500">
          Draft Your Tribe
        </button>
      </div>

      {/* Navigation Section */}
      <div className="relative z-10 grid grid-cols-2 gap-4 py-8 px-4 text-center">
        <div className="bg-stone-800 rounded p-4 hover:bg-stone-700">
          <h3 className="font-semibold">Preview Season 48 Cast</h3>
        </div>
        <div className="bg-stone-800 rounded p-4 hover:bg-stone-700">
          <h3 className="font-semibold">Weekly Recaps</h3>
        </div>
        <div className="bg-stone-800 rounded p-4 hover:bg-stone-700">
          <h3 className="font-semibold">Leaderboard</h3>
        </div>
        <div className="bg-stone-800 rounded p-4 hover:bg-stone-700">
          <h3 className="font-semibold">Join WhatsApp Group</h3>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
