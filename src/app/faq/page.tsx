'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import scoringValues from '../scoring/values.json';


const FaqPage = () => {


  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-0">

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
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">FAQ</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/graphics/fantasy-logo.PNG`} // Replace with your Survivor logo path
            alt="Survivor Fantasy Rule Book"
            width={175}
            height={175}
          />
        </div>
      </div>

      <div className="relative">

        <div className="max-w-6xl mx-auto">

          <section id="faq" className="px-4 font-lostIsland tracking-wider mb-16">
            <h2 className="text-2xl mb-4 text-center">Frequently Asked Questions</h2>
            
            <div className="border-b border-orange-100 py-8">
              <p className="text-xl font-lostIsland text-stone-200 tracking-wider mb-2">
                How do I stay up to date with updates and discussions?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                To get the full Survivor Fantasy experience, stay updated on game developments, and chat with other players, join our WhatsApp group! Click the link below to join:
              </p>
              <a target="_blank" href="https://chat.whatsapp.com/FpRMxQLhp0U848l309PL1T">
                <div className="my-4 w-full text-center text-lg uppercase bg-gradient-to-tr from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 p-2 rounded-lg">
                  Join WhatsApp Group
                </div>
              </a>
              <p className="font-inter text-stone-300 tracking-wider">
                This group is the best place to discuss strategies, react to episodes, and stay informed on scoring updates. Be sure to introduce yourself once you join!
              </p>
            </div>

            <div className="border-b border-orange-100 py-8">
              <p className="text-xl font-lostIsland text-stone-200 tracking-wider mb-2">
                When do I draft my tribe?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                You can draft your tribe any time between the airing of the 1st and 2nd episodes of Season 48. Tribe 'drafting' will be open from Wednesday February 26 @ 9:00PM PST until Wednesday March 5 at 3:00PM PST.
              </p>
            </div>

            <div className="border-b border-orange-100 py-8">
              <p className="text-xl font-lostIsland text-stone-200 tracking-wider mb-2">
                How do I pay my tribe's entry fee?
              </p>
              <p className="font-inter text-stone-300 tracking-wider mb-4">
                Please pay Andrew $20 for your tribe's entry fee via venmo if possible. Make sure you put your tribe's name in the memo to help keep track of who has paid! Apple Pay also works great. Reach out at 281-415-0650 if you need to pay your entry fee using an alternate method. 
              </p>
              <p className="font-inter text-stone-300 tracking-wider mb-4">
                Remember that if your tribe's entry fee isn't paid by the airing of the 2nd episode, your tribe will be removed from competition - we don't want that!
              </p>
              <a href="https://venmo.com/Andrew-Weinrich?txn=pay&amount=20.00&note=Don%27t+forget+your+tribe+name%21">
                <div className="w-full text-center text-lg uppercase bg-gradient-to-tr from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 p-2 rounded-lg">
                  Pay $20 Entry Fee on Venmo
                </div>
              </a>
            </div>

            <div className="border-b border-orange-100 py-8">
              <p className="text-xl font-lostIsland text-stone-200 tracking-wider mb-2">
                Can I make more than one tribe?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                Absolutely! The more tribe's competing, the merrier! Just make sure you pay the entry fee for each tribe.
              </p>
            </div>

            <div className="border-b border-orange-100 py-8">
              <p className="text-xl font-lostIsland text-stone-200 tracking-wider mb-2">
                What happens if one of my tribe picks gets voted out?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                If one of your tribe members are sent home, they will no longer earn points for your tribe. The points they accumulated during their time in the game wil still contribute to your total points, but they will not earn any additional points from the time they are sent home. 
              </p>
            </div>

            <div className="border-b border-orange-100 py-8">
              <p className="text-xl font-lostIsland text-stone-200 tracking-wider mb-2">
                What happens if there is a tie?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                If two or more tribes are tied for any of the top 3 places at the end of the season, the prize for that place along with the prize for the next place(s) will be evenly distributed among those tied. For example, if two tribes tie for 1st place, they will split the combined 90% of the pot for 1st and 2nd place, and the next hightest scoring tribe would get 3rd place and receive 10% of the pot. 
              </p>  
            </div>


          </section>

        </div>
      </div>
    </div>
  );
};

export default FaqPage;
