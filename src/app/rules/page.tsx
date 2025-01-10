'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import scoringValues from '../scoring/values.json';


const RulesPage = () => {

  const [tooltip, setTooltip] = useState<string | null>(null);



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
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">League Rules</h1>
  
        {/* Logo and Welcome Section */}
        <div className="absolute inset-0 z-10 flex flex-row justify-center mx-auto items-center">
          <Image
            src={`/imgs/graphics/rule-book.png`} // Replace with your Survivor logo path
            alt="Survivor Fantasy Rule Book"
            width={200}
            height={200}
          />
        </div>
      </div>

      <div className="relative">

      {/* Jump to Navigation */}
      <nav className="sticky top-0 max-w-6xl mx-auto mb-8 p-4 bg-stone-800 border-y border-stone-700">
        <ul className="flex flex-wrap justify-around space-x-2 text-sm text-orange-200 font-lostIsland tracking-wider lowercase">
          <li><a href="#overview" className="hover:text-orange-400">Overview</a></li>
          <li><a href="#scoring" className="hover:text-orange-400">Scoring< /a></li>
          <li><a href="#your-tribe" className="hover:text-orange-400">Your Tribe</a></li>
          <li><a href="#prizes" className="hover:text-orange-400">Prizes</a></li>
          <li><a href="#disclaimer" className="hover:text-orange-400">Disclaimer</a></li>
        </ul>
      </nav>



      <div className="max-w-6xl mx-auto">

        <section id="overview" className="px-4 pt-16 font-lostIsland tracking-wider">
          <h2 className="text-2xl mb-4">General Overview</h2>
          <p className="mb-4 text-stone-300 tracking-wider font-inter">
            Welcome to our Survivor Fantasy League! Just like on Survivor, it’s all about strategy, intuition, and outlasting the competition. Here’s how it works: Each player drafts a tribe of 6 contestants from the upcoming season (Season 48!). Your job is to pick the players you think will dominate challenges, survive tribal councils, and make it to the end. Each contestant earns you points based on their performance throughout the season. Think of it like crafting your own Survivor dream team, and every episode is another chance to earn points and climb the leaderboard.
          </p>
          <p className="mb-4 text-stone-300 tracking-wider font-inter">
            At the end of the season, the top three tribes with the most points will split the prize pool. Whether you’re a die-hard fan or just here to have a good time, this is your shot to outwit, outplay, and outlast!
          </p>
          <div className="border-b border-stone-500 w-full mt-16"></div>
        </section>

        <section className="px-4 pt-16 font-lostIsland tracking-wider" id="scoring">
          <h2 className="text-2xl mb-4">Scoring System</h2>
          <p className="mb-4 text-stone-300 tracking-wider font-inter">
            Points are the currency of your success in this league. Each contestant in your tribe earns points individually based on their performance, and your tribe's total score is the sum of all six contestants' scores. Here’s the breakdown:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-stone-300 font-inter border-collapse">
              <thead>
                <tr className="bg-stone-800 text-stone-100">
                  <th className="p-2 border border-stone-700">Category</th>
                  <th className="p-2 border border-stone-700">Points</th>
                </tr>
              </thead>
              <tbody>
                {scoringValues.map((score, index) => (
                  <tr key={index}>
                    <td className="p-2 border border-stone-700">
                      <button
                        onClick={() => setTooltip(tooltip === index ? null : index)}
                        className="me-2 text-stone-400 hover:text-stone-200"
                      >
                        <InformationCircleIcon className="w-5 h-5 inline mb-0.5" />
                      </button>
                      {tooltip === index && (
                        <div className="absolute text-sm bg-stone-700 text-stone-200 p-4 mt-2 rounded-lg shadow-lg w-80">
                          {score.description}
                        </div>
                      )}
                      {score.name}
                    </td>
                    <td className="p-2 border border-stone-700">{score.points}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-stone-300 tracking-wider font-inter">
            The scoring system is designed to reward key milestones in Survivor. Do you know who will be Sole Survivor? That could land you a nice 500 point bonus! Making the merge? That’s a solid 100 points for each pick. And don’t underestimate the smaller categories like winning challenges or simply surviving episodes -- they can add up quickly. Remember, if one of your contestants gets voted out, you won't earn additional points from them, so choose wisely. It’s all about balancing bold moves with smart picks.
          </p>
          <div className="border-b border-stone-500 w-full mt-16"></div>
        </section>

        <section id="your-tribe" className="px-4 pt-16 font-lostIsland tracking-wider">
          <h2 className="text-2xl mb-4">Your Tribe</h2>
          <div id="tribe-customization" className="mb-8">
            <h3 className="text-2xl mb-2 lowercase text-stone-300">Tribe Customization</h3>
            <p className="mb-4 font-inter text-stone-300 tracking-wider">
              Your tribe is your team, your identity, and your strategy all rolled into one. You get to customize it in a few ways:
            </p>
            <p className="list-disc list-inside mb-4 font-inter">
              <strong>Tribe Name --</strong> Choose the defining name of your tribe. 
              <br/><br/>
              <strong>Emoji Tribe Icon --</strong> Choose any emoji that captures the essence of your tribe.
              <br/><br/>
              <strong>Tribe Color --</strong> Pick a favorite color to give your tribe a signature look on the leaderboard.
            </p>
          </div>
          <div id="picking-tribe" className="mb-8">
              <h3 className="text-2xl mb-2 lowercase text-stone-300">Picking Your Tribe</h3>
            <p className="font-inter text-stone-300 tracking-wider">
              Drafting your tribe is simple. Head to the <a href="/draft" className="underline text-orange-500 hover:text-orange-400">draft page</a> to register your tribe and lock in your 6 contestants. 
            </p>
          </div>
          <div className="border-b border-stone-500 w-full mt-16"></div>
        </section>

        <section id="prizes"  className="px-4 pt-16 font-lostIsland tracking-wider">
          <h2 className="text-2xl mb-4">Winning & Prizes</h2>
          <p className="font-inter text-stone-300 tracking-wider mb-4">
            When the final torch is snuffed and the dust settles, the top three tribes with the highest total points will take home the prize pool money. Here’s how it pays out:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-stone-300 font-inter border-collapse\">
              <thead>
                <tr className="bg-stone-800 text-stone-100">
                  <th className="p-2 border border-stone-700">Place</th>
                  <th className="p-2 border border-stone-700">Prize Pool Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-stone-700">1st Place</td>
                  <td className="p-2 border border-stone-700">60%</td>
                </tr>
                <tr>
                  <td className="p-2 border border-stone-700">2nd Place</td>
                  <td className="p-2 border border-stone-700">30%</td>
                </tr>
                <tr>
                  <td className="p-2 border border-stone-700">3rd Place</td>
                  <td className="p-2 border border-stone-700">10%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-inter text-stone-300 tracking-wider">
            But let’s not forget, this game is about more than just money. It’s about bragging rights, epic moments, and proving you have what it takes to outwit, outplay, and outlast everyone else. So bring your A-game, and may the best tribe win!
          </p>
          <div className="border-b border-stone-500 w-full mt-16"></div>
        </section>

        <section id="disclaimer" className="px-4 pt-16 font-lostIsland tracking-wider mb-16">
          <h2 className="text-2xl mb-4">Private Betting Pool Disclaimer</h2>
          <p className="font-inter text-stone-300 tracking-wider mb-4">
            In this Survivor Fantasy League, the prize pool is created entirely from the contributions of participating players. Each player pays an entry fee, which is pooled together to form the total prize. The entire pool is distributed among the winners at the end of the season based on the league's scoring system.
          </p>
          <p className="font-inter text-stone-300 tracking-wider mb-4">
            No portion of the prize pool is retained for administrative purposes or for profit by the organizer. This league is a private, social activity designed for enjoyment and camaraderie. All fees directly contribute to the winnings for the season.
          </p>
          <div className="border-b border-stone-500 w-full mt-16"></div>
        </section>

      </div>
      </div>
    </div>
  );
};

export default RulesPage;
