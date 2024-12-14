import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
(async () => {
  try {
    // Contestant data for reference
    const contestants = await prisma.contestant.findMany();
    const contestantMap = contestants.reduce((map, contestant) => {
      map[contestant.name] = contestant.id;
      return map;
    }, {});

    // JSON data (replace this with your cleaned JSON file content)
    const playerPicksJson = [
      // Example structure: Replace with the JSON content you uploaded
      {
        tribeName: "Jeffrey Lee Probst",
        picks: [
          ["Andy Rueda", "Gabe Ortis", "Jon Lovett"], // nonMerge
          ["Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Kyle Ostwald", "Sam Phelan", "Teeny Chirichillo"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Kyle Ostwald", "", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Kishan Patel", "", ""], // tribalWins
          ["Sue Smey", "", ""] // rewards
        ]
      },
      {
        tribeName: "Ling",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rachel LaMont"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "Tiyana Hallums"], // merge
          ["Anika Dhar", "Aysha Welch", "Teeny Chirichillo"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["TK Foster"], // removal
          ["Teeny Chirichillo", "", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Teeny Chirichillo", "", ""], // tribalWins
          ["Teeny Chirichillo", "", ""] // rewards
        ]
      },
      {
        tribeName: "Werd Na",
        picks: [
          ["Jon Lovett", "Kishan Patel", "Sierra Wright"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kyle Ostwald", "Rome Cooney", "Sam Phelan", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Genevieve Mushaluk", "Kyle Ostwald", "Rome Cooney"], // top3
          ["Genevieve Mushaluk"], // soleSurvivor
          ["Sol Yi"], // removal
          ["Genevieve Mushaluk", "", ""], // immunityWins
          ["Rome Cooney", "", ""], // hiddenIdols
          ["Rome Cooney", "TK Foster", ""], // tribalWins
          ["Sol Yi", "", ""] // rewards
        ]
      },
      {
        tribeName: "Jesak'aa",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Andy Rueda", "Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Rome Cooney", "Sierra Wright", "Sue Smey", "Teeny Chirichillo", "Tiyana Hallums"], // merge
          ["Caroline Vidmar", "Sierra Wright", "Teeny Chirichillo"], // top3
          ["Aysha Welch"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Caroline Vidmar", "Kyle Ostwald", "Rachel LaMont"], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Rome Cooney", "", ""], // tribalWins
          ["Sue Smey", "", ""] // rewards
        ]
      },
      {
        tribeName: "Paku Paku",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Caroline Vidmar", "Genevieve Mushaluk", "Teeny Chirichillo"], // top3
          ["Genevieve Mushaluk"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Caroline Vidmar", "", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Caroline Vidmar", "", ""], // tribalWins
          ["Teeny Chirichillo", "", ""] // rewards
        ]
      },
      {
        tribeName: "Ax-ah",
        picks: [
          ["Andy Rueda", "Anika Dhar", "Jon Lovett"], // nonMerge
          ["Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Sol Yi", "Teeny Chirichillo", "TK Foster"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["TK Foster", "", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Kishan Patel", "", ""], // tribalWins
          ["Kyle Ostwald", "", ""] // rewards
        ]
      },
      {
        tribeName: "Kumachikitopitito",
        picks: [
          ["Jon Lovett", "Rome Cooney", "Sam Phelan"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Kyle Ostwald", "Rachel LaMont", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Sue Smey", "Teeny Chirichillo", "TK Foster"], // top3
          ["TK Foster"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Kyle Ostwald", "Sam Phelan", ""], // immunityWins
          ["Sierra Wright", "TK Foster", ""], // hiddenIdols
          ["Anika Dhar", "Teeny Chirichillo", ""], // tribalWins
          ["Rachel LaMont", "Sue Smey", ""] // rewards
        ]
      },
      {
        tribeName: "Jolagu",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster"], // merge
          ["Aysha Welch", "Sam Phelan", "Teeny Chirichillo"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Sue Smey", "", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Teeny Chirichillo", "", ""], // tribalWins
          ["Aysha Welch", "", ""] // rewards
        ]
      },
      {
        tribeName: "AssUpInTheWell",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Anika Dhar", "Sam Phelan", "Tiyana Hallums"], // top3
          ["Anika Dhar"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Rachel LaMont", "TK Foster", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["TK Foster", "", ""], // tribalWins
          ["Aysha Welch", "Rachel LaMont", ""] // rewards
        ]
      },
      {
        tribeName: "Jdogarundi",
        picks: [
          ["Andy Rueda", "Anika Dhar", "Jon Lovett"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster"], // merge
          ["Gabe Ortis", "Sam Phelan", "Teeny Chirichillo"], // top3
          ["Gabe Ortis"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Kyle Ostwald", "Sam Phelan", "Sierra Wright"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "Sam Phelan"], // hiddenIdols
          ["Sam Phelan", "Sol Yi", "TK Foster"], // tribalWins
          ["Aysha Welch", "Sierra Wright", "Sue Smey"] // rewards
        ]
      },
      {
        tribeName: "Shebalba",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Anika Dhar", "Kyle Ostwald", "Rachel LaMont"], // top3
          ["Rachel LaMont"], // soleSurvivor
          ["Rome Cooney"], // removal
          ["Caroline Vidmar", "Kyle Ostwald", "TK Foster"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "Tiyana Hallums"], // hiddenIdols
          ["Caroline Vidmar", "Sam Phelan", "Teeny Chirichillo"], // tribalWins
          ["Genevieve Mushaluk", "Kyle Ostwald", "Sue Smey"] // rewards
        ]
      },
      {
        tribeName: "NoOneCheered4MyCoconut",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "Tiyana Hallums"], // merge
          ["Aysha Welch", "Kishan Patel", "Teeny Chirichillo"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Aysha Welch", "Tiyana Hallums", ""], // immunityWins
          ["Gabe Ortis", "", ""], // hiddenIdols
          ["Tiyana Hallums", "", ""], // tribalWins
          ["Anika Dhar", "Caroline Vidmar", "Teeny Chirichillo"] // rewards
        ]
      },
      {
        tribeName: "Cathemeral Tribe",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Tiyana Hallums"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster"], // merge
          ["Caroline Vidmar", "Rachel LaMont", "Sue Smey"], // top3
          ["Caroline Vidmar"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Sam Phelan", "Sierra Wright", ""], // immunityWins
          ["Aysha Welch", "Rachel LaMont", ""], // hiddenIdols
          ["Sam Phelan", "Sue Smey", ""], // tribalWins
          ["Rachel LaMont", "Sue Smey", "Teeny Chirichillo"] // rewards
        ]
      },
      {
        tribeName: "Joshiko",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Anika Dhar", "Genevieve Mushaluk", "Sol Yi"], // top3
          ["Genevieve Mushaluk"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Rachel LaMont", "Sol Yi", "TK Foster"], // immunityWins
          ["Andy Rueda", "Gabe Ortis", "Rome Cooney"], // hiddenIdols
          ["Sam Phelan", "Sol Yi", "TK Foster"], // tribalWins
          ["Genevieve Mushaluk", "Kishan Patel", "Sierra Wright"] // rewards
        ]
      },
      {
        tribeName: "LunBecks",
        picks: [
          ["Andy Rueda", "Aysha Welch", "Jon Lovett"], // nonMerge
          ["Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Rachel LaMont", "Teeny Chirichillo", "Tiyana Hallums"], // top3
          ["Tiyana Hallums"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Genevieve Mushaluk", "Sol Yi", "TK Foster"], // immunityWins
          ["Anika Dhar", "Gabe Ortis", "Rome Cooney"], // hiddenIdols
          ["Aysha Welch", "Sol Yi", "Teeny Chirichillo"], // tribalWins
          ["Kishan Patel", "Rachel LaMont", "Sierra Wright"] // rewards
        ]
      },
      {
        tribeName: "Cassaka",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Genevieve Mushaluk", "Sierra Wright", "Tiyana Hallums"], // top3
          ["Tiyana Hallums"], // soleSurvivor
          ["Caroline Vidmar"], // removal
          ["Kishan Patel", "TK Foster", ""], // immunityWins
          ["Rome Cooney", "", ""], // hiddenIdols
          ["Genevieve Mushaluk", "TK Foster", ""], // tribalWins
          ["Kishan Patel", "Sue Smey", ""] // rewards
        ]
      },
      {
        tribeName: "Natika",
        picks: [
          ["Andy Rueda", "Gabe Ortis", "Jon Lovett"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster"], // merge
          ["Sol Yi", "Sue Smey", "Teeny Chirichillo"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["Sam Phelan"], // removal
          ["Sierra Wright", "Sue Smey", "TK Foster"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "TK Foster"], // hiddenIdols
          ["Sam Phelan", "Sol Yi", ""], // tribalWins
          ["Sue Smey", "Teeny Chirichillo", "TK Foster"] // rewards
        ]
      },
      {
        tribeName: "Babu",
        picks: [
          ["Andy Rueda", "Anika Dhar", "Jon Lovett"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Sam Phelan", "Sierra Wright", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Aysha Welch", "Kishan Patel", "Teeny Chirichillo"], // top3
          ["Aysha Welch"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Gabe Ortis", "Sam Phelan", "TK Foster"], // immunityWins
          ["Aysha Welch", "Gabe Ortis", "Rome Cooney"], // hiddenIdols
          ["Aysha Welch", "Gabe Ortis", "Kyle Ostwald"], // tribalWins
          ["Genevieve Mushaluk", "Kishan Patel", "Sierra Wright"] // rewards
        ]
      },
      {
        tribeName: "Suevivor",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sue Smey", "TK Foster", "Tiyana Hallums"], // merge
          ["Anika Dhar", "Genevieve Mushaluk", "Tiyana Hallums"], // top3
          ["Tiyana Hallums"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Anika Dhar", "Genevieve Mushaluk", "Tiyana Hallums"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "Sam Phelan"], // hiddenIdols
          ["Anika Dhar", "Aysha Welch", "Genevieve Mushaluk"], // tribalWins
          ["Genevieve Mushaluk", "Sol Yi", "Tiyana Hallums"] // rewards
        ]
      },
      {
        tribeName: "Bula",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Kishan Patel", "Sierra Wright", "Sol Yi"], // top3
          ["Sierra Wright"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Genevieve Mushaluk", "Sierra Wright", "TK Foster"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "Tiyana Hallums"], // hiddenIdols
          ["Kishan Patel", "Kyle Ostwald", "Sue Smey"], // tribalWins
          ["Anika Dhar", "Aysha Welch", "Kyle Ostwald"] // rewards
        ]
      },
      {
        tribeName: "JuJu",
        picks: [
          ["Gabe Ortis", "Rome Cooney", "TK Foster"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "Tiyana Hallums"], // merge
          ["Kishan Patel", "Rachel LaMont", "Teeny Chirichillo"], // top3
          ["Teeny Chirichillo"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Sam Phelan", "TK Foster", ""], // immunityWins
          ["Jon Lovett", "Sierra Wright", "Sue Smey"], // hiddenIdols
          ["Gabe Ortis", "Genevieve Mushaluk", ""], // tribalWins
          ["Rome Cooney", "Sol Yi", "Tiyana Hallums"] // rewards
        ]
      },
      {
        tribeName: "Joel Probst's Chosen",
        picks: [
          ["Andy Rueda", "Caroline Vidmar", "Jon Lovett"], // nonMerge
          ["Aysha Welch", "Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Aysha Welch", "Rachel LaMont", "Sol Yi"], // top3
          ["Sol Yi"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Genevieve Mushaluk", "Sam Phelan", "TK Foster"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "Sol Yi"], // hiddenIdols
          ["Genevieve Mushaluk", "Sol Yi", "TK Foster"], // tribalWins
          ["Aysha Welch", "Genevieve Mushaluk", "Sol Yi"] // rewards
        ]
      },
      {
        tribeName: "Hailstorm",
        picks: [
          ["Andy Rueda", "Gabe Ortis", "Jon Lovett"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Kishan Patel", "Sue Smey", "Tiyana Hallums"], // top3
          ["Kyle Ostwald"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Sol Yi", "Sue Smey", "TK Foster"], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "Sue Smey"], // hiddenIdols
          ["Sol Yi", "TK Foster", "Tiyana Hallums"], // tribalWins
          ["Kishan Patel", "Kyle Ostwald", "Sol Yi"] // rewards
        ]
      },
      {
        tribeName: "Nikuru Tribe",
        picks: [
          ["Andy Rueda", "Anika Dhar", "Gabe Ortis"], // nonMerge
          ["Aysha Welch", "Caroline Vidmar", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Rome Cooney", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "Teeny Chirichillo", "TK Foster"], // merge
          ["Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // top3
          ["TK Foster"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Sam Phelan", "TK Foster", ""], // immunityWins
          ["Gabe Ortis", "Rome Cooney", "TK Foster"], // hiddenIdols
          ["Kishan Patel", "Rome Cooney", "Sol Yi"], // tribalWins
          ["Caroline Vidmar", "Genevieve Mushaluk", "Rachel LaMont"] // rewards
        ]
      },
      {
        tribeName: "Toriko",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rome Cooney"], // nonMerge
          ["Anika Dhar", "Caroline Vidmar", "Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Sam Phelan", "Sierra Wright", "Sol Yi", "Teeny Chirichillo", "TK Foster"], // merge
          ["Kishan Patel", "Rachel LaMont", "Teeny Chirichillo"], // top3
          ["Rachel LaMont"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Caroline Vidmar", "Kishan Patel", "TK Foster"], // immunityWins
          ["Caroline Vidmar", "Gabe Ortis", "Rome Cooney"], // hiddenIdols
          ["Gabe Ortis", "Kishan Patel", "TK Foster"], // tribalWins
          ["Anika Dhar", "Sierra Wright", "Teeny Chirichillo"] // rewards
        ]
      },
      {
        tribeName: "Lordcharquad",
        picks: [
          ["Andy Rueda", "Gabe Ortis", "Jon Lovett"], // nonMerge
          ["Anika Dhar", "Caroline Vidmar", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Rome Cooney", "Sam Phelan", "Sierra Wright", "Sol Yi", "Sue Smey", "TK Foster"], // merge
          ["Genevieve Mushaluk", "Kyle Ostwald", "Sam Phelan"], // top3
          ["Genevieve Mushaluk"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Gabe Ortis", "Rachel LaMont", "Rome Cooney"], // immunityWins
          ["Sue Smey", "Teeny Chirichillo", "TK Foster"], // hiddenIdols
          ["Rachel LaMont", "Sam Phelan", "Teeny Chirichillo"], // tribalWins
          ["Aysha Welch", "Kishan Patel", "Sol Yi"] // rewards
        ]
      },
      {
        tribeName: "LaLoreChosen",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Sierra Wright"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Rachel LaMont", "Rome Cooney", "Sam Phelan", "Sol Yi", "Sue Smey", "TK Foster", "Tiyana Hallums"], // merge
          ["Anika Dhar", "Kyle Ostwald", "Rome Cooney"], // top3
          ["Anika Dhar"], // soleSurvivor
          ["Tiyana Hallums"], // removal
          ["Genevieve Mushaluk", "Rome Cooney", "Sol Yi"], // immunityWins
          ["Caroline Vidmar", "Kishan Patel", "Rome Cooney"], // hiddenIdols
          ["Aysha Welch", "Kishan Patel", "TK Foster"], // tribalWins
          ["Anika Dhar", "Aysha Welch", "Caroline Vidmar"] // rewards
        ]
      },
      {
        tribeName: "Heimheim",
        picks: [
          ["Andy Rueda", "Jon Lovett", "Rachel LaMont"], // nonMerge
          ["Anika Dhar", "Aysha Welch", "Gabe Ortis", "Genevieve Mushaluk", "Kishan Patel", "Kyle Ostwald", "Sam Phelan", "Sierra Wright", "Sue Smey", "Teeny Chirichillo", "TK Foster", "Tiyana Hallums"], // merge
          ["Gabe Ortis", "Kyle Ostwald", "Sue Smey"], // top3
          ["Kyle Ostwald"], // soleSurvivor
          ["Andy Rueda"], // removal
          ["Caroline Vidmar", "", ""], // immunityWins
          ["TK Foster", "", ""], // hiddenIdols
          ["Kyle Ostwald", "TK Foster", ""], // tribalWins
          ["Gabe Ortis", "TK Foster", ""] // rewards
        ]
      }
  // Add the remaining data here...
];

    const playerPicksData = await Promise.all(
      playerPicksJson.map(async (player) => {
        const playerRecord = await prisma.player.findUnique({
          where: { tribeName: player.tribeName },
        });

        if (!playerRecord) {
          console.error(`Player with tribe name ${player.tribeName} not found.`);
          return null;
        }

        return {
          playerId: playerRecord.id,
          nonMerge: player.picks[0].filter((name) => name !== "").map((name) => contestantMap[name]),
          merge: player.picks[1].filter((name) => name !== "").map((name) => contestantMap[name]),
          top3: player.picks[2].filter((name) => name !== "").map((name) => contestantMap[name]),
          soleSurvivor: contestantMap[player.picks[3][0]] || null,
          removed: contestantMap[player.picks[4][0]] || null,
          immunityWins: player.picks[5].filter((name) => name !== "").map((name) => contestantMap[name]),
          hiddenIdols: player.picks[6].filter((name) => name !== "").map((name) => contestantMap[name]),
          tribalWins: player.picks[7].filter((name) => name !== "").map((name) => contestantMap[name]),
          rewards: player.picks[8].filter((name) => name !== "").map((name) => contestantMap[name]),
        };
      })
    );

    await prisma.playerPick.createMany({
      data: playerPicksData.filter(Boolean), // Filter out any null entries due to errors
    });

    console.log("Player picks seeded successfully!");
  } catch (error) {
    console.error("Error seeding player picks:", error);
  } finally {
    await prisma.$disconnect();
  }
})();