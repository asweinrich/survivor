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
            
            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
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

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                When do I draft my tribe?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                You can draft your tribe any time between the airing of the 1st and 2nd episodes of Season 49. Tribe 'drafting' will be open from Wednesday September 24th at 10:00PM PT until Wednesday October 1st at 5:00PM PT.
              </p>
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                Can I update my tribe after I've drafted?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                No. Unfortunately you do not have the ability to make edits to your tribe after you've submitted your picks. So take your time and make sure you pick with intention! If you absolutely, direly need to make a change before tribes are locked on Wednesday October 1st, please reach out to me (Andrew Scott) in the WhatsApp. 
              </p>  
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                How do I pay my tribe's entry fee?
              </p>
              <p className="font-inter text-stone-300 tracking-wider mb-4">
                Please pay me the $20 for your tribe's entry fee via venmo, if possible. Make sure you put your tribe's name in the memo to help keep track of who has paid! Apple Pay also works great. Again, reach out to me (Andrew Scott) in the WhatsApp if you need to pay using an alternate method. 
              </p>
              <p className="font-inter text-stone-300 tracking-wider mb-4">
                Remember that if your tribe's entry fee isn't paid by the airing of the 2nd episode, your tribe will be ineligible for cash prizes - we don't want that!
              </p>
              <a href="https://venmo.com/Andrew-w-scott?txn=pay&amount=20.00&note=Don%27t+forget+your+tribe+name%21">
                <div className="w-full text-center text-lg uppercase bg-gradient-to-tr from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 p-2 rounded-lg">
                  Pay $20 Entry Fee on Venmo
                </div>
              </a>
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                What happens if one of my tribe picks gets voted out?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                If one of your tribe members are sent home, they will no longer earn points for your tribe. The points they accumulated during their time in the game wil still contribute to your total tribe points, but they will not earn any additional points from the time they are sent home. 
              </p>
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                What happens if there is a tie?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
                If two or more tribes are tied for any of the top 3 places at the end of the season, the prize for that place along with the prize for the next place(s) will be evenly distributed among those tied. For example, if two tribes tie for 1st place, they will split the combined 90% of the pot for 1st and 2nd place, and the next hightest scoring tribe would get 3rd place and receive 10% of the pot. 
              </p>  
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                What is the difference between the Fantasy Tribes and the Weekly Pick Em's?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
              </p>  
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                What happens if I don't play the Weekly Pick Em?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
              </p>  
            </div>

            <div className="border-b-2 border-stone-700 py-8">
              <p className="lowercase text-2xl leading-tight font-lostIsland text-stone-200 tracking-wider mb-2">
                Can I invite any interested friends or family?
              </p>
              <p className="font-inter text-stone-300 tracking-wider">
              </p>  
            </div>

            


          </section>

        </div>
      </div>
    </div>
  );
};

export default FaqPage;
