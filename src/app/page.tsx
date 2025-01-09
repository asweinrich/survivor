'use client'
  
import React, { useState, useEffect } from "react";
import Image from "next/image";

const HomePage = () => {
  const [countdown, setCountdown] = useState("");

  const season = 48;

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
    <div className="bg-stone-900 text-stone-200 p-0 font-lostIsland min-h-screen">
      
      <div className="relative w-full h-60 mb-12 p-0 text-center">
        {/* Background Image */}
        <div className="z-0">
          <Image
            src="/imgs/graphics/home-graphic.png" // Replace with your background image path
            alt="Survivor Background"
            layout="fill"
            objectFit="cover"
            className=""
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-transparent to-stone-900"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, #1c1917 0%, transparent 33%, transparent 66%, #1c1917 100%)",
            }}
          ></div>

        </div>
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">Survivor Fantasy</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/${season}/logo.png`} // Replace with your Survivor logo path
            alt="Survivor Season 48 Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      {/* Countdown Section */}
      <div className="bg-stone-800 text-center py-6 px-4 m-4 rounded-xl">
        <h2 className="text-lg uppercase text-stone-300">Season 48 Countdown</h2>
        <p className="text-2xl font-bold mt-1.5">{countdown}</p>
      </div>

      {/* Buttons Section */}
      <div className="flex justify-center gap-4 py-8 ">
        <a href="/rules">
        <button className="w-40 py-3 uppercase bg-stone-700 rounded text-white hover:bg-stone-600">
          How to Play
        </button>
        </a>
        <a href="/draft">
        <button className="w-40 py-3 uppercase bg-green-700 rounded text-white hover:bg-green-600">
          Draft Your Tribe
        </button>
        </a>
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
