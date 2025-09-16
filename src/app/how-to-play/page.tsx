'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import scoringValues from '../scoring/values.json';


const RulesPage = () => {

  const [tooltip, setTooltip] = useState<number | null>(null);



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
        <h1 className="absolute -bottom-8 inset-x-0 z-10 text-4xl font-bold mb-2 text-stone-100 font-survivor tracking-wider">How To Play</h1>
  
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
          <ul className="flex flex-wrap justify-start text-orange-200 font-lostIsland tracking-wider uppercase leading-relaxed">
            <li><a href="#overview" className="hover:text-orange-400 pe-4">Overview</a></li>
            <li><a href="#scoring" className="hover:text-orange-400 pe-4">Scoring</a></li>
            <li><a href="#your-tribe" className="hover:text-orange-400 pe-4">Your Tribe</a></li>
            <li><a href="#prizes" className="hover:text-orange-400 pe-4">Prizes</a></li>
            <li><a href="#disclaimer" className="hover:text-orange-400 pe-4">Disclaimer</a></li>
          </ul>
        </nav>



        <div className="max-w-6xl mx-auto">

          <section id="overview" className="px-4 pt-16 font-lostIsland tracking-wider">
            <h2 className="text-2xl mb-4">General Overview</h2>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Welcome to our Survivor Fantasy League! Just like on Survivor, it’s all about strategy, intuition, and outlasting the competition. Here’s how it works: First, you draft a tribe of 6 contestants from the upcoming season (Season 48!). You'll then pick one of them who you think will win it all. Your job is to pick the players you think will dominate challenges, survive tribal councils, and make it to the end. Each contestant earns points based on their performance throughout the season. Think of it like crafting your own Survivor dream team, and every episode is another chance to earn points and climb the leaderboard.
            </p>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              At the end of the season, the top three tribes with the most points will split the prize pool. Whether you’re a die-hard fan or just here to have a good time, this is your shot to outwit, outplay, and outlast!
            </p>
            <div className="border-b border-stone-500 w-full mt-16"></div>
          </section>

          <section className="px-4 pt-16 font-lostIsland tracking-wider" id="scoring">
            <h2 className="text-2xl mb-4">Scoring System</h2>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Points are the currency of your success in this league. Each contestant in your tribe earns points individually based on their performance, and your tribe's total score is the sum of your six contestants' scores. <br/><br/>Here’s the breakdown:<br/><span className="text-sm"><em>Tap the <InformationCircleIcon className="inline w-5 h-5" /> icon for details on a scoring category</em></span>
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
                  <tr key={-1}>
                    <td className="p-2 border border-stone-700">
                      <button
                        onClick={() => setTooltip(tooltip === -1 ? null : -1)}
                        className="me-2 text-stone-400 hover:text-stone-200"
                      >
                        <InformationCircleIcon className="w-5 h-5 inline mb-0.5" />
                      </button>
                      {tooltip === -1 && (
                        <div className="absolute text-sm bg-stone-700 text-stone-200 p-4 mt-2 rounded-lg shadow-lg w-80">Picking the correct Sole Survivor earns your tribe a 200 point bonus.</div>
                      )}
                      Correct Sole Survivor Pick
                    </td>

                    <td className="p-2 border border-stone-700">200</td>
                  </tr>
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
                          <div
                            className="absolute text-sm bg-stone-700 text-stone-200 p-4 mt-2 rounded-lg shadow-lg w-80"
                            dangerouslySetInnerHTML={{ __html: score.description }}
                          />
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
              The scoring system is designed to reward key milestones in Survivor. Do you have the Sole Survivor on your tribe? That could land you 500 points! Making the merge? That’s a solid 100 points for each pick. And don’t underestimate the smaller categories like winning challenges or simply surviving episodes -- they can add up quickly. Remember, if one of your contestants gets voted out, you won't earn additional points from them, so choose wisely. It’s all about balancing bold moves with smart picks.
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
              <p className="list-disc list-inside mb-4 font-inter leading-relaxed">
                <strong>Tribe Name:</strong> Choose the defining name of your tribe. 
                <br/><br/>
                <strong>Emoji Tribe Icon:</strong> Choose any emoji that captures the essence of your tribe.
                <br/><br/>
                <strong>Tribe Color:</strong> Pick a favorite color to give your tribe a signature look on the leaderboard.
              </p>
            </div>
            <div id="picking-tribe" className="mb-8">
                <h3 className="text-2xl mb-2 lowercase text-stone-300">Picking Your Tribe</h3>
              <p className="font-inter text-stone-300 tracking-wider mb-2">
                Drafting your tribe is simple. Head to the <a href="/draft" className="underline text-orange-500 hover:text-orange-400">draft page</a> to enter your email address, name, tribe info, and to choose 6 contestants who you think will dominate this season. After you submit your 6 tribe members, you will be prompted to confirm your picks and select one contestant who you think will walk away as sole survivor. Once you've drafted your tribe, it's time to sit back and watch the season unfold!
              </p>
              <p className="font-inter text-stone-300 tracking-wider mb-2"><em>
                Just like last season, each tribe is required to pay a $20 entry fee. This goes towards the prize pot to be distributed at the conclusion of Season 48. 
              </em></p>
            </div>
            <div className="border-b border-stone-500 w-full mt-16"></div>
          </section>

          <section id="prizes"  className="px-4 pt-16 font-lostIsland tracking-wider">
            <h2 className="text-2xl mb-4">Winning & Prizes</h2>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              Wanna know what you're playing for? When the final torch is snuffed and the dust settles, the top three tribes with the highest total points will take home the prize pool money. Here’s how it pays out:
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
              But let’s not forget, this game is about more than just money! It’s about bragging rights, epic moments, and proving you have what it takes to outpick everyone else. So bring your A-game, and may the best tribe win!
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
