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
          <ul className="text-lg flex flex-wrap justify-start text-orange-200 font-lostIsland tracking-wider lowercase">
            <li><a href="#overview" className="hover:text-orange-400 pe-4">Overview</a></li>
            <li><a href="#your-tribe" className="hover:text-orange-400 pe-4">Your Tribe</a></li>
            <li><a href="#pick-ems" className="hover:text-orange-400 pe-4">Pick Em</a></li>
            <li><a href="#scoring" className="hover:text-orange-400 pe-4">Scoring</a></li>
            <li><a href="#prizes" className="hover:text-orange-400 pe-4">Prizes</a></li>
            <li><a href="#disclaimer" className="hover:text-orange-400 pe-4">Disclaimer</a></li>
          </ul>
        </nav>



        <div className="max-w-6xl mx-auto">

          <section id="overview" className="px-4 pt-16 font-lostIsland tracking-wider">
            <h2 className="text-2xl mb-4">General Overview</h2>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Welcome to the unofficial best Survivor Fantasy League! Just like on Survivor, it’s all about strategy, intuition, and outlasting the competition.
            </p>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Here’s how it works: First, you draft a tribe of 6 contestants from the upcoming season (Season 49!). You'll then pick one of them who you think will win it all. Your job is to pick the players you think will dominate challenges, survive tribal councils, and make it to the end. Each contestant earns points based on their performance throughout the season. Think of it like crafting your own Survivor dream team, and every episode is another chance to earn points and climb the leaderboard.
            </p>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              At the end of the season, the top three tribes with the most points will split the prize pool. Whether you’re a die-hard fan, a casual watcher, or simply here to vibe and have a good time, this is your shot to outwit, outplay, and outlast!
            </p>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>

          <section id="your-tribe" className="px-4 pt-16 font-lostIsland tracking-wider">
            <h2 className="text-2xl mb-4">Your Tribe</h2>
            <div id="tribe-customization" className="mb-8">
              <h3 className="text-lg mb-2 font-semibold text-stone-300 font-inter">Tribe Customization</h3>
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
                <h3 className="text-lg mb-2 font-semibold font-inter text-stone-300">Picking Your Tribe</h3>
              <p className="font-inter text-stone-300 tracking-wider mb-2">
                Drafting your tribe is simple. Head to the <a href="/draft" className="underline text-orange-500 hover:text-orange-400">draft page</a> between September 24th and October 1st to enter your email address, name, tribe info, and to choose 6 contestants who you think will dominate this season. After you submit your 6 tribe members, you will be prompted to confirm your picks and select one contestant who you think will walk away as sole survivor. Once you've drafted your tribe, it's time to sit back and watch the season unfold!
              </p>
              <p className="font-inter text-stone-300 tracking-wider mb-2"><em>
                Just like last season, each tribe is required to pay a $20 entry fee to compete for prizes. This goes towards the prize pot to be distributed at the conclusion of Season 49.  
              </em></p>
            </div>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>

          <section id="pick-ems" className="px-4 pt-16 font-lostIsland tracking-wider">
            <h2 className="text-2xl mb-4">Weekly Pick Em's <span className="ms-2 bg-orange-800/40 px-2 rounded border-2 border-orange-400 text-orange-400">New!</span></h2>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              This year you get a fun new game called Weekly Pick Em's! This is completely optional and included with your original entry fee, so there's no additional cost to play. Your Pick Em score is separate and independent of your standard tribe score. 
            </p>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              Each week, every player who has drafted a tribe receives an entry for that week's pick-em contest. You can pick who will win an immunity challenge, who might be voted out, and other key events. If you pick correctly, you'll earn a specific amount of points for your overall Pick Em score! But beware, picking carries risk and an incorrect pick will cost you some points.
            </p>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              Every tribe's Pick Em entry starts in a "passed" state each week by default, so you won't be penalized for skipping a week. You only gain or lose points when you actively make picks.
            </p>
            <p className="font-inter text-stone-300 tracking-wider mb-0">
              <em>
                If you prefer a more relaxed experience, you can simply draft your tribe and let the season play out without ever making a pick-em selection. The pick-em game is great for those who enjoy the added excitement and interaction, but you’re never required to participate. The choice is yours!
              </em>
            </p>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>


          <section className="px-4 pt-16 font-lostIsland tracking-wider" id="scoring">
            <h2 className="text-2xl mb-4">Scoring System</h2>
            <p className="mb-8 text-stone-300 tracking-wider font-inter">
              Points are the currency of your success in this league. Whether you get em from your tribe or from the Pick Em Contest, you need to get more than everybody else in order to win. This section tells you how to do that. 
            </p>
            <h3 className="text-lg font-inter mb-2 font-semibold">Tribe Scoring</h3>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Each contestant in your tribe earns points individually based on their performance, and your tribe's total score is the sum of your six contestants' scores. <br/><br/>Here’s the breakdown:<br/><span className="text-sm"><em>Tap the <InformationCircleIcon className="inline w-5 h-5" /> icon for details on a scoring category</em></span>
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
                        <div className="absolute text-sm bg-stone-700 border border-stone-900 text-stone-200 p-4 mt-2 rounded w-80">
                          <button
                            type="button"
                            className="absolute top-0 right-3 text-stone-400 hover:text-stone-200 text-2xl"
                            onClick={() => setTooltip(null)}
                            aria-label="Close help"
                          >
                            ×
                          </button>
                          Picking the correct Sole Survivor earns your tribe a 200 point bonus.
                        </div>
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
                          <div className="absolute text-sm bg-stone-700 border border-stone-900 text-stone-200 p-4 mt-2 rounded w-80">
                          <button
                            type="button"
                            className="absolute top-0 right-3 text-stone-400 hover:text-stone-200 text-2xl"
                            onClick={() => setTooltip(null)}
                            aria-label="Close help"
                          >
                            ×
                          </button>
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
            <p className="mt-4 mb-8 text-stone-300 tracking-wider font-inter">
              This scoring system rewards key milestones in Survivor. Do you have the Sole Survivor on your tribe? That could land you 500 points! Making the merge? That’s a solid 100 points for each pick. And don’t underestimate the smaller categories like winning challenges or simply surviving episodes - they can add up quickly! Remember, if one of your contestants gets voted out, you won't earn additional points from them, so choose wisely. It’s all about balancing bold moves with smart picks.
            </p>
            <h3 className="text-lg font-inter mb-2 font-semibold">Pick Em Scoring</h3>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Your overall Pick Em score will be visible on the leaderboard page once the season begins. This score is a running total that accumulates over the entire season and combines the results of all your Weekly Pick Em entries. 
            </p>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              Each week will offer multiple Pick Em questions with unique selectable options, and each option may have a different point value based on the relative odds or likelyhood of that outcome. 
            </p>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              If your pick is correct, you earn that option’s full point value. If your pick is incorrect, you are deducted a fraction of the possible points for that option.
            </p>
            <p className="mb-4 text-stone-300 tracking-wider font-inter">
              <em>You are not required to answer all of the Pick Em questions for a given week and you will not gain or lose points on any skipped questions.</em>
            </p>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>

          

          <section id="prizes"  className="px-4 pt-16 font-lostIsland tracking-wider">
            <h2 className="text-2xl mb-4">Winning & Prizes</h2>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              Wanna know what you're playing for? When the final torch is snuffed and the dust settles, the top Tribe and Pick Em scores get to split the prize pool money. Here’s how it pays out:
            </p>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              Every player’s $20 entry fee fills the prize pool. At the end of the season, <span className="text-orange-400">75%</span> of the prize pool goes to the top 3 tribe scores, and <span className="text-blue-400">25%</span> goes to the top 3 Pick Em scores. 
            </p>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              In both categories, prizes are awarded among the top three finishers using a 60%, 30%, 10% split.
            </p>
            <div className="overflow-x-auto mb-4 ">
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

            <div className="py-4"><em>
              <h4 className="text-lg font-semibold text-stone-100 mb-2 font-inter">Example with 50 Players</h4>
              <p className="font-inter text-stone-300 tracking-wider">
                <span className="block mb-3">Total Prize Pool: 50 players × $20 = <span className="text-lime-300">$1000</span></span>
                <span className="block mb-3">Tribe Prize Pool (75%): 
                  <span className="text-orange-500"> $750</span>
                  <br/>
                  60% / 30% / 10% - 
                  <span className="text-orange-400"> $450 </span> 
                  / 
                  <span className="text-orange-300"> $225 </span> 
                  / 
                  <span className="text-orange-200"> $75 </span>
                </span>
                <span className="block mb-3">Pick Em Prize Pool (25%): 
                  <span className="text-blue-500"> $250</span>
                  <br/>
                  60% / 30% / 10% - 
                  <span className="text-blue-400"> $150 </span> 
                  / 
                  <span className="text-blue-300"> $75 </span> 
                  / 
                  <span className="text-blue-200"> $25 </span>
                </span>
              </p></em>
            </div>

            <p className="mt-2 font-inter text-stone-300 tracking-wider">
              But let’s not forget, this game is about more than just money! It’s about bragging rights, epic moments, and proving you have what it takes to outpick everyone else. So bring your A-game, and may the best tribe win!
            </p>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>

          <section id="disclaimer" className="px-4 pt-16 font-lostIsland tracking-wider mb-16">
            <h2 className="text-2xl mb-4">Private Betting Pool Disclaimer</h2>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              In this Survivor Fantasy League, the prize pool is created entirely from the contributions of participating players. Each player pays an entry fee, which is pooled together to form the total prize. The entire pool is distributed among the winners at the end of the season based on the league's scoring system.
            </p>
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              No portion of the prize pool is retained for administrative purposes or for profit. This league is a private, social activity designed for enjoyment and camaraderie. All fees directly contribute to the winnings for the season.
            </p>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>

          <section id="extra" className="px-4 font-lostIsland tracking-wider mb-16">
            <p className="font-inter text-stone-300 tracking-wider mb-4">
              Again, this website is in no way affiliated with Survivor or CBS.
            </p>
            <div className="border-b-2 border-stone-700 w-full mt-16"></div>
          </section>



        </div>
      </div>
    </div>
  );
};

export default RulesPage;
