import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const players = [
  { email: 'akkia15@gmail.com', name: 'AssUpInTheWell' },
  { email: 'fishbourneellie@gmail.com', name: 'NoOneCheered4MyCoconut' },
  { email: 'vvacknitz@gmail.com', name: 'Toriko' },
  { email: 'joshbrigance@hotmail.com', name: 'Joshiko' },
  { email: 'catherinermarshall@gmail.com', name: 'Cathemeral Tribe' },
  { email: 'slunbeck@gmail.com', name: 'LunBecks' },
  { email: 'cassandrew25@gmail.com', name: 'Cassaka' },
  { email: 'haileytannenbaum493@gmail.com', name: 'Hailstorm' },
  { email: 'lindsey.swiatek@gmail.com', name: 'Ling' },
  { email: 'jessica.homet@gmail.com', name: 'Jesak\'aa' },
  { email: 'asweinrich@gmail.com', name: 'Werd Na' },
  { email: 'jjg999@gmail.com', name: 'Jdogarundi' },
  { email: 'shelbynb94@gmail.com', name: 'Shebalba' },
  { email: 'enation114@gmail.com', name: 'Bula' },
  { email: 'axiedompier@yahoo.com', name: 'Ax-ah' },
  { email: 'kristimichelleking@gmail.com', name: 'Jeffrey Lee Probst' },
  { email: 'tjfking@gmail.com', name: 'Paku Paku' },
  { email: 'nickgraham@gmail.com', name: 'Nikuru Tribe' },
  { email: 'sigotron@gmail.com', name: 'Joel Probst\'s Chosen' },
  { email: 'lorenamartinez500@gmail.com', name: 'LaLoreChosen' },
  { email: 'suegupta425@gmail.com', name: 'Suevivor' },
  { email: 'claudebullock@gmail.com', name: 'Babu' },
  { email: 'julialeelewis@gmail.com', name: 'JuJu' },
  { email: 'joel.swiatek@gmail.com', name: 'Jolagu' },
  { email: 'charquach@gmail.com', name: 'Lordcharquad' },
  { email: 'kyle.d.heimbach@gmail.com', name: 'Heimheim' },
  { email: 'natidibbern@gmail.com', name: 'Natika' },
  { email: 'juanjo.neri@gmail.com', name: 'Kumachikitopitito' },
];

async function seedPlayers() {
  console.log('Seeding players...');

  try {
    for (const player of players) {
      await prisma.player.create({
        data: {
          email: player.email,
          name: player.name,
          color: '#77c471', // Default color
          name: player.name, // Using tribe name as default name
          passwordHash: '', // Placeholder value for password hash
        },
      });
    }
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding players:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlayers();
