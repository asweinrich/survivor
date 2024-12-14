import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const players = [
  { email: 'akkia15@gmail.com', tribeName: 'AssUpInTheWell' },
  { email: 'fishbourneellie@gmail.com', tribeName: 'NoOneCheered4MyCoconut' },
  { email: 'vvacknitz@gmail.com', tribeName: 'Toriko' },
  { email: 'joshbrigance@hotmail.com', tribeName: 'Joshiko' },
  { email: 'catherinermarshall@gmail.com', tribeName: 'Cathemeral Tribe' },
  { email: 'slunbeck@gmail.com', tribeName: 'LunBecks' },
  { email: 'cassandrew25@gmail.com', tribeName: 'Cassaka' },
  { email: 'haileytannenbaum493@gmail.com', tribeName: 'Hailstorm' },
  { email: 'lindsey.swiatek@gmail.com', tribeName: 'Ling' },
  { email: 'jessica.homet@gmail.com', tribeName: 'Jesak\'aa' },
  { email: 'asweinrich@gmail.com', tribeName: 'Werd Na' },
  { email: 'jjg999@gmail.com', tribeName: 'Jdogarundi' },
  { email: 'shelbynb94@gmail.com', tribeName: 'Shebalba' },
  { email: 'enation114@gmail.com', tribeName: 'Bula' },
  { email: 'axiedompier@yahoo.com', tribeName: 'Ax-ah' },
  { email: 'kristimichelleking@gmail.com', tribeName: 'Jeffrey Lee Probst' },
  { email: 'tjfking@gmail.com', tribeName: 'Paku Paku' },
  { email: 'nickgraham@gmail.com', tribeName: 'Nikuru Tribe' },
  { email: 'sigotron@gmail.com', tribeName: 'Joel Probst\'s Chosen' },
  { email: 'lorenamartinez500@gmail.com', tribeName: 'LaLoreChosen' },
  { email: 'suegupta425@gmail.com', tribeName: 'Suevivor' },
  { email: 'claudebullock@gmail.com', tribeName: 'Babu' },
  { email: 'julialeelewis@gmail.com', tribeName: 'JuJu' },
  { email: 'joel.swiatek@gmail.com', tribeName: 'Jolagu' },
  { email: 'charquach@gmail.com', tribeName: 'Lordcharquad' },
  { email: 'kyle.d.heimbach@gmail.com', tribeName: 'Heimheim' },
  { email: 'natidibbern@gmail.com', tribeName: 'Natika' },
  { email: 'juanjo.neri@gmail.com', tribeName: 'Kumachikitopitito' },
];

async function seedPlayers() {
  console.log('Seeding players...');

  try {
    for (const player of players) {
      await prisma.player.create({
        data: {
          email: player.email,
          tribeName: player.tribeName,
          color: '#77c471', // Default color
          name: player.tribeName, // Using tribe name as default name
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
