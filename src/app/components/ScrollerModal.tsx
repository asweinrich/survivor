'use client'

import { useState } from "react";

const scrollerItems = [
  { 
    id: 1, 
    text: "🚨 Prize Payouts Updated 🚨",
    message: (
      <div className="flex flex-col gap-4">
        <p>Hey everyone. I have an important update to share regarding the prize payouts for this season. I'll explain why in a moment, but here's what we will do instead:</p>

        <p className="font-bold uppercase">Payouts will now go to the Top 10 on the Tribe Leaderboard at the conclusion of the season.</p>

        <p className="font-bold uppercase">Payouts for the Pick Em contest will go to the Top 5 on the Pick Em Leaderboard at the end of the season.</p>

        <p>The prizes will be distributed as follows:</p>

        <div>
          <p className="font-bold mb-1">Tribe Leaderboard ($1,680 Prize Pool)</p>
          <ul className="flex flex-col gap-1">
            <li>1st: 25% = $420</li>
            <li>2nd: ~18% = $300</li>
            <li>3rd: ~14% = $235</li>
            <li>4th: ~11% = $185</li>
            <li>5th: ~9% = $150</li>
            <li>6th: ~7% = $120</li>
            <li>7th: ~6% = $100</li>
            <li>8th: ~5% = $85</li>
            <li>9th: ~3% = $50</li>
            <li>10th: ~2% = $35</li>
          </ul>
        </div>

        <div>
          <p className="font-bold mb-1">Pick Em Leaderboard ($560 Prize Pool)</p>
          <ul className="flex flex-col gap-1">
            <li>1st: ~40% = $225</li>
            <li>2nd: 25% = $140</li>
            <li>3rd: ~18% = $100</li>
            <li>4th: ~11% = $60</li>
            <li>5th: ~6% = $35</li>
          </ul>
        </div>

        <p>Okay, now the 'why' for transparency! So, last Friday I was bopping around on the web and stumbled upon the prediction market website Kalshi. Some of you may be familiar with this site, but basically it's where people bet on the outcomes of certain events relating to sports, politics, and even reality TV. Along with that, they display the odds of specific outcomes which are based on what people are betting on. While this stuff is supposed to be federally regulated, sometimes people with insider knowledge place large bets on outcomes, triggering huge jumps in the odds of something happening.</p>

        <p>The point is, I found out that there was a 'market' for "Who will be voted out of Survivor Season 50 Episode 3?" This market predicted that Q (RIP, my chaos king) would be voted out episode 3 with a 99% certainty as early as the Saturday before the episode aired. That was before I even posted the Pick Ems for last week, which included "Who would be voted out?" I was not aware of this 'market' when I posted the Pick Ems, but the fact of the matter is that the information was publicly out there before the episode aired. And it was a huge question worth 1000 points in the Pick Em contest. I don't know (or care) if anybody referenced that market prediction via the Kalshi website or AI chats or whatever, but to be overly cautious I'm going to change the points for that question to be worth 200 instead of 1000. So you'll still be rewarded for the correct pick, but it just won't be worth so much. And I will not use that question (or anything else that's on Kalshi) for future Pick Ems.</p>

        <p>On Kalshi there is also a 'market' for "Who will win Survivor Season 50?". And one specific contestant has extremely high odds to win compared to the other castaways. And they have had those extremely high odds to win since before the season even premiered. I am now realizing that AI chats like ChatGPT, Claude, and even the AI overviews from a Google Search might reference these Kalshi prediction odds, directly or indirectly. For example, if you asked AI "who should I draft for my survivor fantasy league", there is a chance that the AI referenced these Kalshi odds (or maybe even other online spoilers) to provide its answer.</p>

        <p>I want it to be crystal clear that I never said you can't use AI to draft your fantasy tribes. It's not against the rules or anything. I have no earthly idea how many people did or did not use AI and it would be impossible for me to try to police something like that. Hell, the Kalshi odds could even be wrong about this kind of thing. But in the event that they are not, I am expanding the prize payouts to give everybody a better shot of winning on some level. I am still confident in the integrity of the game, and regardless of all this, more people getting prizes is objectively a good thing.</p>

        <p>I'm really bummed these prediction markets exist in the first place, but they do and I have no choice but to adapt to them. I hope you know that I do my best to make this fantasy game fun and fair for every single person who plays. If you have any questions about this, or if you want to talk to me directly about it, please don't hesitate to message me on the WhatsApp.</p>

        <p>Thanks and let's get ready for an exciting rest of the season!</p>
      </div>
    ),
  },
];

export default function ScrollerModal() {
  const [selectedItem, setSelectedItem] = useState<typeof scrollerItems[0] | null>(null);

  return (
    <>
      {/* Scrolling Ticker */}
      <div className="overflow-hidden whitespace-nowrap w-full bg-stone-800 py-2">
        <div className="inline-flex animate-marquee gap-16 px-4">
          {scrollerItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="text-lg font-lostIsland lowercase tracking-wider text-stone-300 hover:text-white cursor-pointer"
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-stone-800 border border-stone-600 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className=" mx-auto text-lg font-lostIsland lowercase tracking-wider text-stone-100 mb-4 shrink-0">{selectedItem.text}</h2>
            <div className="overflow-y-auto text-stone-300 tracking-wide text-sm leading-relaxed">
              {selectedItem.message}
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 shrink-0 text-sm uppercase tracking-wider text-stone-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}