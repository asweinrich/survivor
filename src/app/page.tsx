'use client'
  
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { UserGroupIcon, ChatBubbleLeftRightIcon, TrophyIcon, CalendarDaysIcon, BookOpenIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline"

const HomePage = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });


  const season = 48;

  useEffect(() => {
    const targetDate = new Date("2025-10-01T16:00:00-08:00"); // PST (UTC-8)
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = targetDate.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
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
            fill
            style={{ objectFit: 'cover' }} 
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
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">Welcome!</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/graphics/fantasy-logo.PNG`} // Replace with your Survivor logo path
            alt="Survivor Season 48 Logo"
            width={175}
            height={175}
          />
        </div>
      </div>

      <div className="w-full flex flex-col max-w-5xl mx-auto px-4 py-6 text-center text-lg tracking-wider lowercase border-y-2 border-stone-600">
        <span className="mb-3">Welcome back to Survivor Fantasy!</span>
        <span className="mb-3">This website is a place where you can draft a fantasy tribe, track contestants and scores, and make weekly predictions.</span>
        <span className="">Join the WhatsApp group to meet your competition and to get the best Survivor Fantasy experience - come say hi!</span>
      </div>

      {/*<div className="text-center py-3 px-4 mt-3 mx-3 rounded-xl">
        <h2 className="text-2xl uppercase text-stone-300 mb-4">Tribes due in</h2>
        <div className="flex flex-row  max-w-96 justify-center items-center space-x-6 lowercase tracking-wider bg-stone-800 border border-stone-700 mx-auto p-4 rounded-xl">
          <div className="text-center">
            <div className="text-3xl">{countdown.days}</div>
            <div className="text-stone-400">Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">{countdown.hours}</div>
            <div className="text-stone-400">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">{countdown.minutes}</div>
            <div className="text-stone-400">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">{countdown.seconds}</div>
            <div className="text-stone-400">Seconds</div>
          </div>
        </div>
      </div>
      */}



      <div className="flex flex-col justify-center w-full p-4">
        <p className="text-stone-300 text-lg px-4 uppercase tracking-wider  text-center mb-2">
          Tribe drafting opens Wednesday, September 24 at 10:00 PM PT.
        </p>

        <a href="/draft" className="w-full max-w-5xl mx-auto">
        <button className="opacity-40 w-full p-3 text-2xl uppercase bg-gradient-to-tr from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 rounded-lg text-white">
          Draft Your Tribe
        </button>
        </a>
      </div>

      

      {/* Navigation Section */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 py-8 px-4 text-center tracking-wider border-y-2 border-stone-600">
        
        <a href="/cast">
          <div className="flex items-center bg-stone-800 rounded-lg p-0 hover:bg-stone-700 overflow-hidden">
            <div className="bg-gradient-to-tr from-yellow-500 to-yellow-700 p-3 me-1"><UserGroupIcon className="w-8 h-8" /></div><h3 className="p-3 text-xl uppercase">Season 49 Cast Preview</h3>
          </div>
        </a> 
        <a href="/leaderboard">
          <div className="flex items-center bg-stone-800 rounded-lg p-0 hover:bg-stone-700 overflow-hidden">
            <div className="bg-gradient-to-tr from-red-500 to-red-700 p-3 me-1"><TrophyIcon className="w-8 h-8" /></div><h3 className="p-3 text-xl uppercase">Leaderboard</h3>
          </div>
        </a>
        <a target="_blank" href="https://chat.whatsapp.com/FpRMxQLhp0U848l309PL1T">
          <div className="flex items-center bg-stone-800 rounded-lg p-0 hover:bg-stone-700 overflow-hidden">
            <div className="bg-gradient-to-tr from-emerald-500 to-emerald-700 p-3 me-1"><ChatBubbleLeftRightIcon className="w-8 h-8" /></div><h3 className="p-3 text-xl uppercase">Join WhatsApp Group</h3>
          </div>
        </a>
        <a href="/how-to-play">
          <div className="flex items-center bg-stone-800 rounded-lg p-0 hover:bg-stone-700 overflow-hidden">
            <div className="bg-gradient-to-tr from-indigo-500 to-indigo-800 p-3 me-1"><BookOpenIcon className="w-8 h-8" /></div><h3 className="p-3 text-xl uppercase">How to Play</h3>
          </div>
        </a>
        
        <a href="/faq">
          <div className="flex items-center bg-stone-800 rounded-lg p-0 hover:bg-stone-700 overflow-hidden">
            <div className="bg-gradient-to-tr from-purple-500 to-purple-700 p-3 me-1"><QuestionMarkCircleIcon className="w-8 h-8" /></div><h3 className="p-3 text-xl uppercase">FAQ</h3>
          </div>
        </a>
        {/*
        <a href="/recaps">
          <div className="flex items-center bg-stone-800 rounded-lg p-0 hover:bg-stone-700 overflow-hidden">
            <div className="bg-gradient-to-tr from-pink-500 to-pink-700 p-3 me-1"><CalendarDaysIcon className="w-8 h-8" /></div><h3 className="p-3 text-xl uppercase">Weekly Recaps</h3>
          </div>
        </a>
        */}
        
      </div>

      <div className="max-w-5xl mx-auto text-sm uppercase py-8 px-4 text-center tracking-wider border-b-2 border-stone-600">
        This site is in no way affiliated with Survivor or CBS
      </div>
    </div>


  );
};

export default HomePage;
