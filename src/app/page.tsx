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
    <div className="bg-stone-900 text-white font-lostIsland min-h-screen">
      
      <div className="relative w-full h-80 m-0 p-0">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/97FDB0B0-3C97-48FD-8D27-D54E33FDF076.jpeg" // Replace with your background image path
            alt="Survivor Background"
            layout="fill"
            objectFit="cover"
            className=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900"></div>
        </div>
        <h1 className="absolute bottom-0 z-10 text-2xl font-semibold mt-6">Welcome to Survivor Fantasy!</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-col mx-auto items-center text-center">
          <Image
            src="/imgs/IMG_3143.png" // Replace with your Survivor logo path
            alt="Survivor Season 48 Logo"
            width={300}
            height={300}
          />
        </div>
      </div>

      {/* Countdown Section */}
      <div className=" text-center py-8">
        <h2 className="text-xl font-semibold">Countdown to Season 48 Premiere:</h2>
        <p className="text-2xl font-bold mt-2">{countdown}</p>
      </div>

      {/* Buttons Section */}
      <div className="flex justify-center gap-4 py-8">
        <button className="px-6 py-3 bg-stone-700 rounded text-white hover:bg-stone-600">
          How to Play
        </button>
        <button className="px-6 py-3 bg-green-600 rounded text-white hover:bg-green-500">
          Draft Your Tribe
        </button>
      </div>

      {/* Navigation Section */}
      <div className="grid grid-cols-2 gap-4 py-8 px-4 text-center">
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
