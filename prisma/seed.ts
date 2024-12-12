import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.contestant.createMany({
    data: [
      { name: 'Rachel LaMont', img: '47/Rachel LaMont', hometown: 'Southfield, Michigan', season: '47', profession: 'Graphic Designer', tribes: ['Gata', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 3, hiddenIdols: 1, tribalWins: 3, rewards: 3, removed: false },
      { name: 'Sam Phelan', img: '47/Sam Phelan', hometown: 'Chicago, Illinois', season: '47', profession: 'Sports Reporter', tribes: ['Gata', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 3, rewards: 5, removed: false },
      { name: 'Sue Smey', img: '47/Sue Smey', hometown: 'Putnam Valley, New York', season: '47', profession: 'Flight School Owner', tribes: ['Tuku', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 0, rewards: 3, removed: false },
      { name: 'Teeny Chirichillo', img: '47/Teeny Chirichillo', hometown: 'Manahawkin, New Jersey', season: '47', profession: 'Freelance Writer', tribes: ['Lavo', 'Beka'], inPlay: true, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 1, rewards: 5, removed: false },
      { name: 'Genevieve Mushaluk', img: '47/Genevieve Mushaluk', hometown: 'Winnipeg, Manitoba', season: '47', profession: 'Corporate Lawyer', tribes: ['Lavo', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 2, hiddenIdols: 0, tribalWins: 1, rewards: 5, removed: false },
      { name: 'Andy Rueda', img: '47/Andy Rueda', hometown: 'Brooklyn, New York', season: '47', profession: 'AI Research Assistant', tribes: ['Gata', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 3, rewards: 2, removed: false },
      { name: 'Caroline Vidmar', img: '47/Caroline Vidmar', hometown: 'Chicago, Illinois', season: '47', profession: 'Strategy Consultant', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 1, removed: false },
      { name: 'Kyle Ostwald', img: '47/Kyle Ostwald', hometown: 'Cheboygan, Michigan', season: '47', profession: 'Construction Worker', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 4, hiddenIdols: 0, tribalWins: 1, rewards: 4, removed: false },
      { name: 'Gabe Ortis', img: '47/Gabe Ortis', hometown: 'Baltimore, Maryland', season: '47', profession: 'Radio Host', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 1, tribalWins: 1, rewards: 1, removed: false },
      { name: 'Solomon "Sol" Yi', img: '47/Solomon Yi', hometown: 'Norwalk, Connecticut', season: '47', profession: 'Medical Device Sales', tribes: ['Lavo', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 1, rewards: 2, removed: false },
      { name: 'Sierra Wright', img: '47/Sierra Wright', hometown: 'Phoenixville, Pennslyvania', season: '47', profession: 'Nurse', tribes: ['Gata', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 1, hiddenIdols: 0, tribalWins: 3, rewards: 2, removed: false },
      { name: 'Tiyana Hallums', img: '47/Tiyana Hallums', hometown: 'Oahu, Hawaii', season: '47', profession: 'Flight Attendant', tribes: ['Tuku', 'Beka'], inPlay: false, madeMerge: true, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 1, removed: false },
      { name: 'Rome Cooney', img: '47/Rome Cooney', hometown: 'Phoenix, Arizona', season: '47', profession: 'E-Sports Commentator', tribes: ['Lavo'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 1, tribalWins: 1, rewards: 0, removed: false },
      { name: 'Anika Dhar', img: '47/Anika Dhar', hometown: 'Los Angeles, California', season: '47', profession: 'Marketing Manager', tribes: ['Gata'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 3, rewards: 0, removed: false },
      { name: 'Kishan Patel', img: '47/Kishan Patel', hometown: 'San Francisco, California', season: '47', profession: 'Emergency Room Doctor', tribes: ['Lavo'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 0, removed: false },
      { name: 'Aysha Welch', img: '47/Aysha Welch', hometown: 'Houston, Texas', season: '47', profession: 'IT Consultant', tribes: ['Lavo'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 1, rewards: 0, removed: false },
      { name: 'Terran "TK" Foster', img: '47/TK Foster', hometown: 'Washington D.C.', season: '47', profession: 'Athlete Marketing Manager', tribes: ['Tuku'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, removed: false },
      { name: 'Jon Lovett', img: '47/Jon Lovett', hometown: 'Los Angeles, California', season: '47', profession: 'Podcast Host', tribes: ['Gata'], inPlay: false, madeMerge: false, top3: false, soleSurvivor: false, immunityWins: 0, hiddenIdols: 0, tribalWins: 0, rewards: 0, removed: false },
    ],
  });

  console.log('Seed data for Contestants added!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });